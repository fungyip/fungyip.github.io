#!/usr/bin/env python3
"""Export reviewed wiki-llm pages into the site's _knowledge/ collection.

Usage:
    python scripts/export_knowledge.py <wiki-llm checkout> <output dir> [--report FILE]

A page is exported only when its front matter has BOTH:
    publish: true      (set by you in Obsidian, never by Hermes)
    status: reviewed

Safety rules
- Pages that mention a private term (employer, servers, personal notes,
  credentials) are skipped and listed in the report. They are never exported.
- Only title, type, updated and confidence are copied from front matter.
  source_paths, source_revision, tags, aliases etc. are dropped.
- [[Wikilinks]] to other exported pages become site links; links to
  unexported pages become plain text.
- Raw-source links become the original public article URL (from the
  Readwise "- URL:" line). Sources without a public URL are removed.
- The output is written to a temporary folder, scanned again, and only then
  swapped into place. If anything fails, the existing _knowledge/ is untouched.
"""
import argparse
import pathlib
import re
import shutil
import sys
import tempfile
import urllib.parse

import yaml

# Terms that must never appear on the public site.
BLOCK = re.compile(
    r"circle-of-life|\bscai\b|covestro|\bsrv\d+|hstgr\.cloud"
    r"|api[_-]?key|private key|BEGIN [A-Z ]*KEY|\bghp_[A-Za-z0-9]{10,}|\bsk-[A-Za-z0-9]{10,}"
    r"|\b(?:\d{1,3}\.){3}\d{1,3}\b",
    re.I,
)
KEEP = ["title", "type", "updated", "confidence"]
TRACKING = re.compile(r"^(utm_|share_id$|si$|ref$|ref_src$|fbclid$|gclid$|igshid$)")


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.strip().lower())
    return s.strip("-")


def split_front_matter(text: str):
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    return (yaml.safe_load(m.group(1)) or {}), m.group(2)


def clean_url(url: str) -> str:
    parts = urllib.parse.urlsplit(url)
    query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query, keep_blank_values=True)
             if not TRACKING.match(k)]
    url = urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query)))
    return url.replace("(", "%28").replace(")", "%29")   # keep Markdown links intact


def public_source(src: pathlib.Path, raw_rel: str):
    """Return (title, url) for a Readwise source, or None if it has no public URL."""
    raw_rel = urllib.parse.unquote(raw_rel)
    if not raw_rel.startswith("raw/readwise/"):
        return None
    path = src / raw_rel
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8")
    m = re.search(r"^- URL: (https?://\S+)", text, re.M)
    if not m:
        return None
    h = re.search(r"^# (.+)$", text, re.M)
    title = h.group(1).strip() if h else path.stem
    return title, clean_url(m.group(1))


def convert(body: str, src: pathlib.Path, published: dict) -> str:
    # [[Page]], [[Page|label]], [[Page#Heading|label]]
    def wikilink(m):
        target = m.group(1).strip()
        label = (m.group(3) or target).strip()
        slug = slugify(target)
        return f"[{label}](/knowledge/{slug}/)" if slug in published else label

    body = re.sub(r"!?\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]+))?\]\]", wikilink, body)

    # [Raw source](../../raw/...) -> public URL; whole list item removed if none
    raw_link = re.compile(r"\[[^\]]*\]\(((?:\.\./)+|\./)?(raw/[^\n]*?\.md)\)")
    out_lines = []
    for line in body.split("\n"):
        if raw_link.search(line):
            def repl(m):
                found = public_source(src, m.group(2))
                return f"[{found[0]}]({found[1]})" if found else "\x00"
            line = raw_link.sub(repl, line)
            if "\x00" in line:
                rest = line.replace("\x00", "").strip(" -*;,")
                if not rest:
                    continue          # line was only a private/unknown source
                line = line.replace("\x00", "")
        out_lines.append(line)
    body = "\n".join(out_lines)

    # Any other relative link into the vault -> plain text
    body = re.sub(r"\[([^\]]*)\]\((?:\.\./|\./)[^)]*\)", r"\1", body)
    # Obsidian ==highlight== -> <mark>
    body = re.sub(r"==(.+?)==", r"<mark>\1</mark>", body, flags=re.S)
    # The layout prints the title, so drop the first H1
    body = re.sub(r"^\s*# .+\n", "", body, count=1)
    return body.strip() + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=pathlib.Path)
    ap.add_argument("out", type=pathlib.Path)
    ap.add_argument("--report", type=pathlib.Path)
    args = ap.parse_args()

    candidates, drafts, blocked = {}, [], []
    for f in sorted((args.src / "wiki").rglob("*.md")):
        fm, body = split_front_matter(f.read_text(encoding="utf-8"))
        if fm.get("publish") is not True:
            continue
        rel = f.relative_to(args.src)
        if fm.get("status") != "reviewed":
            drafts.append(f"{rel} (status: {fm.get('status')})")
            continue
        hit = BLOCK.search(body) or BLOCK.search(yaml.safe_dump(fm))
        if hit:
            blocked.append(f"{rel} (matched '{hit.group(0)}')")
            continue
        candidates[slugify(f.stem)] = (rel, fm, body)

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="knowledge-"))
    exported = []
    for slug, (rel, fm, body) in candidates.items():
        out_fm = {k: fm[k] for k in KEEP if k in fm}
        out_fm.setdefault("title", rel.stem.replace("-", " "))
        text = (
            "---\n" + yaml.safe_dump(out_fm, allow_unicode=True, sort_keys=False, default_flow_style=False)
            + "---\n{% raw %}\n" + convert(body, args.src, candidates) + "{% endraw %}\n"
        )
        # Second check on the final output
        hit = BLOCK.search(text)
        if hit:
            blocked.append(f"{rel} (matched '{hit.group(0)}' after conversion)")
            continue
        (tmp / f"{slug}.md").write_text(text, encoding="utf-8")
        exported.append(f"{rel} -> /knowledge/{slug}/")

    # Swap into place only after everything succeeded
    if args.out.exists():
        shutil.rmtree(args.out)
    shutil.copytree(tmp, args.out)
    (args.out / ".gitkeep").touch()
    shutil.rmtree(tmp)

    lines = [f"Exported {len(exported)} page(s)."]
    for title, items in (("Exported", exported),
                         ("Skipped: flagged but not `status: reviewed`", drafts),
                         ("Blocked: contains a private term", blocked)):
        if items:
            lines += ["", f"### {title}", *[f"- {i}" for i in items]]
    report = "\n".join(lines) + "\n"
    print(report)
    if args.report:
        args.report.write_text(report, encoding="utf-8")
    for b in blocked:
        print(f"::warning::Blocked from publishing: {b}")


if __name__ == "__main__":
    sys.exit(main())
