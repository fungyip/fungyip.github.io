const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  validContext, canCollect, buildLinkEvent, createEngagement, init
} = require("../assets/js/portfolio-analytics.js");

const context = {
  measurement_id: "G-TEST000000",
  page_type: "home",
  content_id: "home",
  tracking_schema_version: "1.0"
};
const current = "https://fungyip.github.io/";
function anchor(event, attrs = {}, href = "/projects/") {
  const values = {
    href,
    "data-analytics-event": event,
    "data-analytics-placement": "hero",
    "data-analytics-link-id": "home_projects",
    ...attrs
  };
  return { getAttribute: key => values[key] ?? null };
}
const rect = (depth = 60) => {
  const top = 800 - depth * 20;
  return { top, bottom: top + 2000, height: 2000 };
};

test("context rejects unknown types, IDs, schemas and identity-like free text", () => {
  assert.equal(validContext(context), true);
  for (const change of [
    { page_type: "customer_email" }, { content_id: "someone@example.com" },
    { content_id: "a".repeat(65) }, { measurement_id: "UA-123" },
    { tracking_schema_version: "2.0" }
  ]) assert.equal(validContext({ ...context, ...change }), false);
});

test("collection requires explicit boolean consent and a usable tag", () => {
  const win = { navigator: {}, gtag() {} };
  for (const value of [undefined, false, "true", 1, null])
    assert.equal(canCollect(win, context, value), false);
  assert.equal(canCollect(win, context, true), true);
  assert.equal(canCollect({ navigator: {} }, context, true), false);
});

test("opt-out, GPC, and browser DNT override an explicit grant", () => {
  for (const win of [
    { navigator: { globalPrivacyControl: true } },
    { navigator: { doNotTrack: "1" } },
    { navigator: { doNotTrack: "yes" } },
    { navigator: {}, doNotTrack: "1" },
    { navigator: {}, "ga-disable-G-TEST000000": true }
  ]) assert.equal(canCollect({ gtag() {}, ...win }, context, true), false);
});

test("internal navigation uses current context and strips query/fragment", () => {
  const event = buildLinkEvent(context, anchor("portfolio_navigation", {
    "data-analytics-target": "projects"
  }, "/projects/?utm_source=should_not_be_sent#overview"), current);
  assert.equal(event.name, "portfolio_navigation");
  assert.equal(event.params.content_id, "home");
  assert.equal(event.params.target_content_id, "projects");
  assert.equal(event.params.destination_path, "/projects/");
  assert.equal(JSON.stringify(event).includes("utm_source"), false);
});

test("knowledge links map generated underscore IDs to hyphenated paths", () => {
  const event = buildLinkEvent(context, anchor("portfolio_navigation", {
    "data-analytics-target": "harness_engineering",
    "data-analytics-link-id": "knowledge_harness_engineering",
    "data-analytics-placement": "knowledge_list"
  }, "/knowledge/harness-engineering/"), current);
  assert.equal(event.params.target_content_id, "harness_engineering");
});

test("navigation rejects external, javascript, mismatched, and same-page anchors", () => {
  for (const href of [
    "https://other.example/projects/", "javascript:alert(1)",
    "/privacy/", "/#same-page"
  ]) assert.equal(buildLinkEvent(context, anchor("portfolio_navigation", {
    "data-analytics-target": "projects"
  }, href), current), null);
});

test("unknown event, bad placement, and malformed IDs are skipped", () => {
  assert.equal(buildLinkEvent(context, anchor("purchase"), current), null);
  assert.equal(buildLinkEvent(context, anchor("contact_click", {
    "data-analytics-placement": "someone@example.com"
  }), current), null);
  assert.equal(buildLinkEvent(context, anchor("contact_click", {
    "data-analytics-link-id": "private@example.com"
  }), current), null);
});

test("email payload contains no address, subject, body, href or identity", () => {
  const event = buildLinkEvent(context, anchor("contact_click", {
    "data-analytics-channel": "email",
    "data-analytics-link-id": "home_contact_email"
  }, "mailto:sensitive@example.com?subject=Secret&body=Personal"), current);
  assert.equal(event.params.contact_channel, "email");
  assert.deepEqual(Object.keys(event.params).sort(), [
    "page_type", "content_id", "tracking_schema_version",
    "placement", "link_id", "contact_channel"
  ].sort());
  assert.doesNotMatch(JSON.stringify(event), /sensitive|Secret|Personal|mailto|user_id|client_id/);
});

test("LinkedIn channel requires a real HTTPS profile link", () => {
  assert.equal(buildLinkEvent(context, anchor("contact_click", {
    "data-analytics-channel": "linkedin"
  }, "https://www.linkedin.com/in/fungyip"), current).params.contact_channel, "linkedin");
  assert.equal(buildLinkEvent(context, anchor("contact_click", {
    "data-analytics-channel": "linkedin"
  }, "https://www.linkedin.com.attacker.example/in/fungyip"), current), null);
});

test("resource destinations are validated without sending URLs", () => {
  for (const [type, href] of [
    ["github_profile", "https://github.com/fungyip"],
    ["github_repository", "https://github.com/fungyip/fungyip.github.io"],
    ["feed", "/feed.xml"]
  ]) {
    const event = buildLinkEvent(context, anchor("resource_click", {
      "data-analytics-destination": type
    }, href), current);
    assert.equal(event.params.destination_type, type);
    assert.equal("link_url" in event.params, false);
  }
  assert.equal(buildLinkEvent(context, anchor("resource_click", {
    "data-analytics-destination": "feed"
  }, "https://outside.example/feed.xml"), current), null);
});

test("source citations require exact reviewed URL, ID and source page", () => {
  const source = anchor("resource_click", {
    "data-analytics-destination": "external_reference",
    "data-analytics-link-id": "harness_source_martin_fowler",
    "data-analytics-placement": "sources"
  }, "https://martinfowler.com/articles/harness-engineering.html");
  assert.equal(buildLinkEvent(context, source, current), null);
  const note = { ...context, page_type: "knowledge_note", content_id: "harness_engineering" };
  assert.equal(buildLinkEvent(note, source, current).params.destination_type, "external_reference");
});

test("engagement needs 60 visible seconds and 50% depth, once only", () => {
  const tracker = createEngagement();
  assert.equal(tracker.update(0, true, true, rect(60), 800), false);
  assert.equal(tracker.update(59000, true, true, rect(60), 800), false);
  assert.equal(tracker.update(60000, true, true, rect(60), 800), true);
  assert.equal(tracker.update(120000, true, true, rect(100), 800), false);
});

test("time first then depth qualifies only after both", () => {
  const tracker = createEngagement();
  tracker.update(0, true, true, rect(40), 800);
  assert.equal(tracker.update(61000, true, true, rect(40), 800), false);
  assert.equal(tracker.update(62000, true, true, rect(60), 800), true);
});

test("hidden time and suspended bfcache intervals do not contribute", () => {
  const tracker = createEngagement();
  tracker.update(0, true, true, rect(60), 800);
  tracker.update(10000, false, true, rect(60), 800);
  assert.equal(tracker.update(130000, true, true, rect(60), 800), false);
  assert.equal(tracker.update(179000, true, true, rect(60), 800), false);
  assert.equal(tracker.update(180000, true, true, rect(60), 800), true);
});

test("withdrawal discards time and depth; an emitted document cannot re-emit", () => {
  const tracker = createEngagement();
  tracker.update(0, true, true, rect(60), 800);
  tracker.update(59000, true, true, rect(60), 800);
  tracker.update(60000, true, false, rect(60), 800);
  tracker.update(61000, true, true, rect(40), 800);
  assert.equal(tracker.update(121000, true, true, rect(40), 800), false);
  assert.equal(tracker.update(122000, true, true, rect(60), 800), true);
  tracker.reset(123000);
  tracker.update(124000, true, true, rect(60), 800);
  assert.equal(tracker.update(185000, true, true, rect(60), 800), false);
});

test("short articles, absent geometry and nonvisible article depth never qualify", () => {
  for (const geometry of [null, { top: 0, bottom: 400, height: 400 },
    { top: -3000, bottom: -1000, height: 2000 }]) {
    const tracker = createEngagement();
    tracker.update(0, true, true, geometry, 800);
    assert.equal(tracker.update(90000, true, true, geometry, 800), false);
  }
});

test("initialization is idempotent and fails closed on absent/malformed metadata", () => {
  init({ document: { getElementById: () => null } });
  init({ document: { getElementById: () => ({ textContent: "not-json" }) } });
  let reads = 0;
  init({ PortfolioAnalytics: {}, document: { getElementById() { reads++; } } });
  assert.equal(reads, 0);
});

test("source keeps all existing gates and one config owner", () => {
  const loader = fs.readFileSync("_includes/analytics.html", "utf8");
  const custom = fs.readFileSync("_includes/portfolio-analytics.html", "utf8");
  const provider = fs.readFileSync("_includes/analytics-providers/google-gtag.html", "utf8");
  assert.match(loader, /page\.analytics != false/);
  for (const gate of [
    /portfolio_events == true/, /page\.analytics != false/,
    /jekyll\.environment == "production"/, /provider == "google-gtag"/
  ]) assert.match(custom, gate);
  assert.equal((provider.match(/gtag\('config'/g) || []).length, 1);
  assert.equal((provider.match(/gtag\/js\?id=/g) || []).length, 1);
  assert.doesNotMatch(fs.readFileSync("assets/js/portfolio-analytics.js", "utf8"),
    /localStorage|sessionStorage|document\.cookie/);
});
