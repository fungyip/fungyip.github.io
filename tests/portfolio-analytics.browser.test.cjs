const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

let server, browser;
const root = path.resolve("_site/analytics-qa");
before(async () => {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.join(root, pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    const type = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml" };
    res.setHeader("Content-Type", type[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(4400, "127.0.0.1", resolve));
  browser = await chromium.launch({ headless: true, channel: "chromium" });
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function newPage(route = "/", mobile = false, clock = false) {
  const page = await browser.newPage({ viewport: { width: mobile ? 375 : 1440, height: 1000 } });
  // Install before the adapter creates its timers, not after document load.
  if (clock) await page.clock.install();
  await page.route(/google(tagmanager|analytics)\.com/, req => req.abort());
  await page.addInitScript(() => {
    window.__capturedEvents = [];
    window.dataLayer = {
      push(args) {
        if (args[0] === "event") window.__capturedEvents.push({ name: args[1], params: args[2] });
      }
    };
  });
  await page.goto("http://127.0.0.1:4400" + route);
  return page;
}

test("built production default and development do not load the custom adapter", () => {
  const production = fs.readFileSync("_site/analytics-default/index.html", "utf8");
  const development = fs.readFileSync("_site/analytics-development/index.html", "utf8");
  assert.doesNotMatch(production, /src="[^"]*portfolio-analytics\.js/);
  assert.match(production, /gtag\/js\?id=G-TEST000000/);
  assert.doesNotMatch(development, /gtag\/js\?id=|src="[^"]*portfolio-analytics\.js/);
  for (const folder of ["tests", "docs", "vendor/bundle"])
    assert.equal(fs.existsSync(path.join(root, folder)), false);
});

test("eligible build has one config and loader; explicit page opt-out suppresses both", async () => {
  const page = await newPage();
  assert.equal(await page.locator('script[src*="gtag/js"]').count(), 1);
  const html = await page.content();
  assert.equal((html.match(/gtag\('config'/g) || []).length, 1);
  assert.match(html, /gtag\/js\?id=G-TEST000000/);
  assert.doesNotMatch(html, /G-08L3F7YL6H/);
  await page.goto("http://127.0.0.1:4400/privacy/");
  assert.equal(await page.locator('script[src*="gtag/js"],script[src*="portfolio-analytics.js"]').count(), 0);
  await page.close();
});

test("no consent means no custom event and no click replay after granting", async () => {
  const page = await newPage();
  // Suppress navigation only in the test so captured events remain inspectable.
  await page.evaluate(() => document.addEventListener("click", e => e.preventDefault(), { once: true }));
  await page.getByRole("link", { name: "View my projects", exact: true }).click();
  assert.deepEqual(await page.evaluate(() => window.__capturedEvents), []);
  await page.evaluate(() => window.PortfolioAnalytics.setConsent(true));
  assert.deepEqual(await page.evaluate(() => window.__capturedEvents), []);
  await page.close();
});

test("nested icon and keyboard contact activation emit safe events exactly once", async () => {
  const page = await newPage();
  await page.evaluate(() => window.PortfolioAnalytics.setConsent(true));
  const link = page.locator('[data-analytics-link-id="sidebar_email"]');
  await link.locator("i").click();
  await link.focus();
  await page.keyboard.press("Enter");
  const events = await page.evaluate(() => window.__capturedEvents);
  assert.equal(events.length, 2);
  for (const event of events) {
    assert.equal(event.name, "contact_click");
    assert.equal(event.params.contact_channel, "email");
    assert.equal(event.params.send_to, "G-TEST000000");
    assert.doesNotMatch(JSON.stringify(event), /mailto:|@|subject|client_id|user_id/);
  }
  await page.close();
});

test("resource link emits one semantic resource event", async () => {
  const page = await newPage();
  await page.evaluate(() => {
    window.PortfolioAnalytics.setConsent(true);
    document.querySelector('[data-analytics-link-id="home_github"]').target = "_blank";
  });
  await page.locator('[data-analytics-link-id="home_github"]').click();
  const events = await page.evaluate(() => window.__capturedEvents);
  assert.equal(events.length, 1);
  assert.equal(events[0].name, "resource_click");
  assert.equal(events[0].params.destination_type, "github_profile");
  await page.close();
});

test("internal CTA dispatches once without preventing navigation", async () => {
  const page = await newPage();
  let captured;
  await page.exposeFunction("captureNavigation", value => { captured = value; });
  await page.evaluate(() => {
    window.PortfolioAnalytics.setConsent(true);
    const previous = window.gtag;
    window.gtag = function (...args) {
      if (args[0] === "event") window.captureNavigation({ name: args[1], params: args[2] });
      previous(...args);
    };
  });
  await page.getByRole("link", { name: "View my projects", exact: true }).click();
  assert.match(page.url(), /\/projects\/$/);
  assert.equal(captured.name, "portfolio_navigation");
  assert.equal(captured.params.content_id, "home");
  assert.equal(captured.params.target_content_id, "projects");
  assert.equal(captured.params.placement, "hero");
  await page.getByRole("link", { name: "Read the case study", exact: true }).click();
  assert.match(page.url(), /\/projects\/knowledge-data-platform\/$/);
  await page.close();
});

test("knowledge loop preserves note context and annotates only reviewed sources", async () => {
  const page = await newPage("/knowledge/");
  assert.equal(await page.locator('[data-analytics-link-id="knowledge_harness_engineering"]').count(), 1);
  await page.getByRole("link", { name: "Harness Engineering", exact: true }).click();
  await page.waitForLoadState("load");
  await page.waitForFunction(() => !!window.PortfolioAnalytics);
  assert.match(page.url(), /\/knowledge\/harness-engineering\/$/);
  const context = await page.locator("#portfolio-analytics-context").textContent();
  assert.equal(JSON.parse(context).page_type, "knowledge_note");
  assert.equal(JSON.parse(context).content_id, "harness_engineering");
  assert.equal(await page.locator('[data-analytics-destination="external_reference"]').count(), 3);
  await page.evaluate(() => {
    window.PortfolioAnalytics.setConsent(true);
    document.querySelector('[data-analytics-link-id="harness_source_martin_fowler"]').target = "_blank";
  });
  await page.locator('[data-analytics-link-id="harness_source_martin_fowler"]').click();
  assert.equal((await page.evaluate(() => window.__capturedEvents))[0].params.destination_type, "external_reference");
  await page.close();
});

test("withdrawal, opt-out and synthetic programmatic activation suppress custom events", async () => {
  const page = await newPage();
  await page.evaluate(() => {
    window.PortfolioAnalytics.setConsent(true);
    document.querySelector('[data-analytics-link-id="sidebar_email"]').click();
    window.PortfolioAnalytics.setConsent(false);
  });
  await page.locator('[data-analytics-link-id="sidebar_email"]').click();
  assert.deepEqual(await page.evaluate(() => window.__capturedEvents), []);
  await page.evaluate(() => {
    window.PortfolioAnalytics.setConsent(true);
    window["ga-disable-G-TEST000000"] = true;
  });
  await page.locator('[data-analytics-link-id="sidebar_email"]').click();
  assert.deepEqual(await page.evaluate(() => window.__capturedEvents), []);
  await page.close();
});

test("case-study time/depth logic runs in the browser without real-time waiting", async () => {
  const page = await newPage("/projects/knowledge-data-platform/", false, true);
  await page.evaluate(() => window.PortfolioAnalytics.setConsent(true));
  await page.clock.runFor(61000);
  assert.equal((await page.evaluate(() => window.__capturedEvents)).length, 0);
  await page.evaluate(() => {
    const article = document.querySelector("article .page__content");
    const y = article.getBoundingClientRect().top + window.scrollY + article.offsetHeight * 0.6;
    window.scrollTo(0, y);
  });
  await page.clock.runFor(1000);
  const events = await page.evaluate(() => window.__capturedEvents);
  assert.equal(events.filter(e => e.name === "case_study_engaged").length, 1);
  await page.clock.runFor(61000);
  assert.equal((await page.evaluate(() => window.__capturedEvents)).length, 1);
  await page.close();
});

test("mobile navigation, sidebar and content remain usable at 375px", async () => {
  const page = await newPage("/", true);
  await page.locator(".greedy-nav button").click();
  await page.locator('.hidden-links a[href$="/knowledge/"]').click();
  await page.waitForLoadState("load");
  assert.match(page.url(), /\/knowledge\/$/);
  await page.getByRole("button", { name: "Follow" }).click();
  await page.locator('[data-analytics-link-id="sidebar_email"]').waitFor({ state: "visible" });
  assert.equal(await page.locator('[data-analytics-link-id="sidebar_email"]').isVisible(), true);
  await page.getByRole("link", { name: "Harness Engineering", exact: true }).click();
  await page.waitForLoadState("load");
  assert.equal((await page.locator("h1").innerText()).trim(), "Harness Engineering");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(overflow, false);
  await page.close();
});

test("econometrics and same-page case-study contents preserve existing behavior", async () => {
  const page = await newPage("/econometrics/");
  assert.equal((await page.locator("h1").innerText()).trim(), "Econometrics");
  await page.goto("http://127.0.0.1:4400/projects/knowledge-data-platform/");
  await page.evaluate(() => window.PortfolioAnalytics.setConsent(true));
  const anchor = page.locator('article .page__content a[href^="#"]').first();
  const hash = await anchor.getAttribute("href");
  await anchor.click();
  assert.ok(hash.length > 1);
  assert.deepEqual(await page.evaluate(() => window.__capturedEvents), []);
  await page.close();
});

test("reloading the adapter cannot duplicate listeners; GPC overrides consent", async () => {
  const page = await newPage();
  await page.evaluate(() => window.PortfolioAnalytics.setConsent(true));
  await page.addScriptTag({ url: "/assets/js/portfolio-analytics.js" });
  await page.locator('[data-analytics-link-id="sidebar_email"]').click();
  assert.equal((await page.evaluate(() => window.__capturedEvents)).length, 1);
  await page.evaluate(() => Object.defineProperty(navigator, "globalPrivacyControl", { value: true }));
  await page.locator('[data-analytics-link-id="sidebar_email"]').click();
  assert.equal((await page.evaluate(() => window.__capturedEvents)).length, 1);
  await page.close();
});
