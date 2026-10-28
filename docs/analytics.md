# Portfolio interaction analytics

This change implements four semantic events for the existing direct Google-tag setup. It is intentionally default-off: the implementation is available for review and tests, but merging alone does not start collecting new custom interaction data.

## Activation gate

- **Feature switch:** Set `analytics.portfolio_events: true` in `_config.yml` only after privacy review.
- **Consent integration:** Custom events additionally require an explicit boolean grant on each document. From the approved consent integration, set `window.portfolioAnalyticsConsent = true` before the deferred adapter runs, or call `window.PortfolioAnalytics.setConsent(true)` after it runs.
- **Withdrawal:** Clear the early flag and call `window.PortfolioAnalytics.setConsent(false)`. No prior interactions are replayed, progress toward engagement is discarded, and no consent state is stored by the adapter.
- **Separation:** This hook controls custom events only. It does not update Google Consent Mode, block the existing tag, delete existing analytics cookies, or implement a consent banner. The approved CMP must handle those independently.
- **Existing analytics:** The existing Google-tag loader/config remains unchanged by default. This PR does not resolve any pre-existing legal/consent question.
- **No identity:** No User-ID, custom client ID, persistent storage, email address, message content, or named visitor profile is added.

GPC, browser Do Not Track, and `window["ga-disable-" + measurementId] === true` override a custom-event grant. These controls do not retroactively change the existing Google tag's own collection.

## Event contract

| Event | Trigger | Extra fields | Interpretation |
|---|---|---|---|
| `portfolio_navigation` | Primary click/keyboard activation on annotated same-site content/navigation | `placement`, `link_id`, `target_content_id`, `destination_path` | Selection intent, not confirmed arrival |
| `contact_click` | Approved email or LinkedIn link activation | `placement`, `link_id`, `contact_channel` | Contact intent, not a sent message/lead |
| `resource_click` | Approved GitHub/feed/source-link activation | `placement`, `link_id`, `destination_type` | Resource interest |
| `case_study_engaged` | Both 60 visible seconds and at least 50% article depth | `visible_seconds_threshold: 60`, `article_depth_threshold: 50` | Reading-opportunity proxy |

Every event includes current-page `page_type`, current-page `content_id`, and `tracking_schema_version: "1.0"`. Payloads are built field by field, never by copying DOM attributes or full URLs; `send_to` scopes delivery to the configured stream.

Only primary `click` events are handled, including keyboard-generated clicks. Middle-click/context-menu actions and untrusted programmatic clicks are outside this first catalog; the adapter never prevents navigation or waits for analytics.

Register event-scoped custom dimensions for `page_type`, `content_id`, `placement`, `link_id`, `target_content_id`, `contact_channel`, `destination_type`, and `tracking_schema_version`. Propose `contact_click` as the only primary key event, named “Contact intent,” with once-per-session key-event counting if the goal is sessions showing intent.

## Reading proxy and lifecycle

The main `article .page__content` must be taller than the viewport. Depth is the deepest visible viewport-bottom position relative to the current article height, clamped to 0–100; sidebar/footer height is excluded and geometry is recomputed after layout changes.

Visible time is accumulated using `performance.now()` only while the document is visible, permitted, and not suspended. Both thresholds must be true before emission; hidden time does not count, withdrawal resets progress, and there is at most one event per document even after re-consent or bfcache restoration. Full reload creates a new document.

This does not prove active attention or comprehension. Keep it separate from GA4's standard `scroll`, which measures 90% page depth when Enhanced Measurement is enabled. ([Enhanced Measurement](https://support.google.com/analytics/answer/9216061))

## Content and annotations

Page metadata comes from `analytics_page_type` and `analytics_content_id` front matter. Generated Knowledge collection items get `knowledge_note` and their normalized slug automatically, so the private-repo publishing sync does not need changes.

Links use `data-analytics-event`, `data-analytics-placement`, `data-analytics-link-id`, and event-specific target/channel/destination attributes. Only the three exact reviewed Harness Engineering citations are annotated at runtime; no generated `_knowledge/` file is edited or an arbitrary external link auto-promoted to a custom event.

Source IDs, placement names, and event names are bounded slugs/enums. Do not add recipient-specific IDs, full URLs, or PII to metadata; adding a new business action requires a reviewed event contract.

## Local and CI tests

Run from the repository root. The unit tests need Node only and do not install or invoke the legacy node-sass build.

```sh
node --test tests/portfolio-analytics.test.cjs
bundle install
bash tests/build-analytics.sh
```

The build script creates enabled production, development, and default-off production test destinations under `_site/`. All use the fake `G-TEST000000` ID, and the enabled test config opts the privacy page out for a real `analytics: false` fixture; test sources and documentation are excluded from the built site.

The `vendor/bundle` dependency directory is also excluded: GitHub's Ruby cache places gem sources there, and their internal Jekyll templates must never be interpreted as portfolio pages or published.

Install browser tooling outside the legacy npm dependency tree, then run:

```sh
npm install --prefix /tmp/portfolio-browser-tools playwright@1.59.0
/tmp/portfolio-browser-tools/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/portfolio-browser-tools/node_modules node --test tests/portfolio-analytics.browser.test.cjs
```

The browser runner starts its own loopback HTTP server, stubs the Google tag queue, and blocks Google Analytics/Tag Manager endpoints. It exercises actual rendered Jekyll pages and navigation without sending production analytics.

## Manual GA4 review before activation

- Confirm property/stream ID, reporting identity, time zone, retention, and traffic filters.
- Check existing Enhanced Measurement settings, including automatic mail/link URLs and any prohibited query data.
- Do not add manual page views or another generic outbound `click` producer.
- Keep generic automatic `click` separate from semantic contact/resource events; never sum them as unique actions.
- Verify privacy/consent behavior and the public notice against actual collection.
- Verify safe payloads in DebugView and processed source/medium/campaign reports using approved QA traffic.
- No GTM migration, GA4 Admin mutation, native-app tracking, or UTM injection into internal links is included.
