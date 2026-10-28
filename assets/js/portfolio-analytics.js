/* Bounded semantic events only. No storage, identity, URL payloads or click replay. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.init(root);
}(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var PAGE_TYPES = ["home", "project_index", "case_study", "knowledge_index",
    "knowledge_note", "reference", "utility", "other"];
  var PLACEMENTS = ["nav", "hero", "featured_work", "project_list", "knowledge_list",
    "sidebar", "contact", "body", "footer", "sources"];
  var TARGETS = {
    projects: "/projects/",
    econometrics: "/econometrics/",
    knowledge: "/knowledge/",
    knowledge_data_platform: "/projects/knowledge-data-platform/",
    hkgeo: "/HKGeo/"
  };
  // Generated knowledge pages are overwritten by the publishing sync. Annotate
  // only these exact reviewed citations at runtime instead of modifying exports.
  var SOURCES = {
    "https://martinfowler.com/articles/harness-engineering.html": "harness_source_martin_fowler",
    "https://levelup.gitconnected.com/how-to-implement-harness-engineering-fe70c558bb7f": "harness_source_gitconnected",
    "https://www.langchain.com/blog/the-anatomy-of-an-agent-harness": "harness_source_langchain"
  };

  function slug(value) {
    return typeof value === "string" && /^[a-z][a-z0-9_]{0,63}$/.test(value);
  }

  function validContext(context) {
    return !!context && /^G-[A-Z0-9]+$/.test(context.measurement_id || "") &&
      PAGE_TYPES.indexOf(context.page_type) !== -1 && slug(context.content_id) &&
      context.tracking_schema_version === "1.0";
  }

  function shared(context) {
    return {
      page_type: context.page_type,
      content_id: context.content_id,
      tracking_schema_version: "1.0"
    };
  }

  function canCollect(win, context, consent) {
    var nav = win.navigator || {};
    return consent === true && typeof win.gtag === "function" &&
      win["ga-disable-" + context.measurement_id] !== true &&
      nav.globalPrivacyControl !== true &&
      [nav.doNotTrack, win.doNotTrack].every(function (value) {
        return value !== "1" && value !== "yes";
      });
  }

  // Return a whitelisted payload, never a copy of DOM attributes or the URL.
  function buildLinkEvent(context, anchor, currentLocation) {
    if (!validContext(context) || !anchor || !anchor.getAttribute) return null;
    var name = anchor.getAttribute("data-analytics-event");
    var placement = anchor.getAttribute("data-analytics-placement");
    var linkId = anchor.getAttribute("data-analytics-link-id");
    if (PLACEMENTS.indexOf(placement) === -1 || !slug(linkId)) return null;
    var current, url;
    try {
      current = new URL(currentLocation);
      url = new URL(anchor.getAttribute("href"), current);
    } catch (_) { return null; }
    var params = shared(context);
    params.placement = placement;
    params.link_id = linkId;
    if (name === "portfolio_navigation") {
      var target = anchor.getAttribute("data-analytics-target");
      if (!slug(target) || url.origin !== current.origin ||
          !/^https?:$/.test(url.protocol) ||
          (url.pathname === current.pathname && url.hash)) return null;
      var targetPath = TARGETS[target];
      if (!targetPath && /^knowledge_[a-z0-9_]+$/.test(linkId)) {
        targetPath = "/knowledge/" + target.replace(/_/g, "-") + "/";
      }
      if (!targetPath || url.pathname !== targetPath) return null;
      params.target_content_id = target;
      params.destination_path = targetPath;
    } else if (name === "contact_click") {
      var channel = anchor.getAttribute("data-analytics-channel");
      if (channel === "email" && url.protocol === "mailto:") {
        params.contact_channel = "email";
      } else if (channel === "linkedin" && url.protocol === "https:" &&
          url.hostname === "www.linkedin.com" && /^\/in\/[^/]+\/?$/.test(url.pathname)) {
        params.contact_channel = "linkedin";
      } else { return null; }
    } else if (name === "resource_click") {
      var destination = anchor.getAttribute("data-analytics-destination");
      var github = /^https?:$/.test(url.protocol) && url.hostname === "github.com";
      if ((destination === "github_profile" && github && /^\/[^/]+\/?$/.test(url.pathname)) ||
          (destination === "github_repository" && github && /^\/[^/]+\/[^/]+\/?$/.test(url.pathname)) ||
          (destination === "feed" && url.origin === current.origin && url.pathname === "/feed.xml") ||
          (destination === "external_reference" && context.content_id === "harness_engineering" &&
            SOURCES[url.href] === linkId)) {
        params.destination_type = destination;
      } else { return null; }
    } else { return null; }
    return { name: name, params: params };
  }

  // Pure state machine. Both threshold conditions are required; no hidden time.
  function createEngagement() {
    var seconds = 0, maxDepth = 0, lastTime = null, active = false, emitted = false;
    return {
      reset: function (now) {
        seconds = 0; maxDepth = 0; lastTime = now; active = false;
        // A document that already emitted must not emit again after re-consent.
      },
      update: function (now, visible, allowed, rect, viewportHeight) {
        if (!allowed) {
          this.reset(now);
          return false;
        }
        var longArticle = rect && isFinite(rect.height) && rect.height > viewportHeight &&
          viewportHeight > 0;
        if (active && lastTime !== null) seconds += Math.max(0, now - lastTime) / 1000;
        lastTime = now;
        active = !!visible && !!longArticle;
        if (visible && longArticle && rect.top < viewportHeight && rect.bottom > 0) {
          maxDepth = Math.max(maxDepth,
            Math.max(0, Math.min(100, 100 * (viewportHeight - rect.top) / rect.height)));
        }
        if (!emitted && visible && longArticle && seconds >= 60 && maxDepth >= 50) {
          emitted = true;
          return true;
        }
        return false;
      }
    };
  }

  function init(win) {
    if (win.PortfolioAnalytics) return;
    var doc = win.document;
    var node = doc.getElementById("portfolio-analytics-context");
    if (!node) return;
    var context;
    try { context = JSON.parse(node.textContent); } catch (_) { return; }
    if (!validContext(context)) return;
    var consent = win.portfolioAnalyticsConsent === true;
    var tracker = createEngagement();
    var suspended = false;
    var article = context.page_type === "case_study" ?
      doc.querySelector("article .page__content") : null;
    var now = function () { return win.performance.now(); };
    function allowed() { return canCollect(win, context, consent); }
    function emit(event) {
      if (!event || !allowed()) return;
      // A missing/blocked Google tag must never break a navigation handler.
      try {
        var params = Object.assign({}, event.params, { send_to: context.measurement_id });
        win.gtag("event", event.name, params);
      } catch (_) { /* Measurement failure must not affect the site. */ }
    }
    function tick() {
      if (!article) return;
      if (tracker.update(now(), !suspended && doc.visibilityState === "visible",
          allowed(), article.getBoundingClientRect(), win.innerHeight)) {
        var params = shared(context);
        params.visible_seconds_threshold = 60;
        params.article_depth_threshold = 50;
        emit({ name: "case_study_engaged", params: params });
      }
    }
    win.PortfolioAnalytics = Object.freeze({
      setConsent: function (granted) {
        // This controls custom events only, not the existing Google tag or CMP.
        var next = granted === true;
        if (consent !== next) tracker.reset(now());
        consent = next;
        tick();
      }
    });
    if (context.page_type === "knowledge_note" && context.content_id === "harness_engineering") {
      doc.querySelectorAll("article .page__content a[href]").forEach(function (anchor) {
        var source = SOURCES[anchor.href];
        if (!source) return;
        anchor.setAttribute("data-analytics-event", "resource_click");
        anchor.setAttribute("data-analytics-placement", "sources");
        anchor.setAttribute("data-analytics-link-id", source);
        anchor.setAttribute("data-analytics-destination", "external_reference");
      });
    }
    doc.addEventListener("click", function (event) {
      if (event.isTrusted === false || event.defaultPrevented ||
          (event.button !== undefined && event.button !== 0) || !allowed()) return;
      var target = event.target && event.target.closest ?
        event.target.closest("a[data-analytics-event]") : null;
      if (target) emit(buildLinkEvent(context, target, win.location.href));
    });
    if (article) {
      doc.addEventListener("visibilitychange", tick);
      win.addEventListener("scroll", tick, { passive: true });
      win.addEventListener("resize", tick);
      // Recompute geometry on each tick, including after font/image/diagram layout.
      win.setInterval(tick, 1000);
      win.addEventListener("pagehide", function () { suspended = true; tick(); });
      win.addEventListener("pageshow", function () { suspended = false; tick(); });
      tick();
    }
  }

  return {
    validContext: validContext,
    canCollect: canCollect,
    buildLinkEvent: buildLinkEvent,
    createEngagement: createEngagement,
    init: init
  };
}));
