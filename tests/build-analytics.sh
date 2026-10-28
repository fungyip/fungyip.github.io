#!/usr/bin/env bash
set -euo pipefail
# Jekyll replaces arrays rather than merging them. Preserve *all* existing
# layout/collection defaults before adding the test-only page opt-out.
qa_dir=$(mktemp -d "${TMPDIR:-/tmp}/portfolio-analytics-XXXXXX")
qa_config="$qa_dir/config.yml"
trap 'rm -f "$qa_config"; rmdir "$qa_dir"' EXIT
bundle exec ruby -ryaml -e '
  base = YAML.load_file("_config.yml")
  qa = YAML.load_file("tests/analytics-qa.yml")
  qa["defaults"] = base.fetch("defaults", []) + qa.fetch("defaults", [])
  File.write(ARGV[0], YAML.dump(qa))
' "$qa_config"
JEKYLL_ENV=production bundle exec jekyll build --config "_config.yml,$qa_config" --destination _site/analytics-qa
JEKYLL_ENV=development bundle exec jekyll build --config "_config.yml,$qa_config" --destination _site/analytics-development
JEKYLL_ENV=production bundle exec jekyll build --config _config.yml,tests/analytics-default.yml --destination _site/analytics-default
