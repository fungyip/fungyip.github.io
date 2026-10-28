/* Featured project card: progressive enhancements only, no dependencies.
   The card works fully without this file (links, layout, <details>). */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function guardThumbnail(card) {
    var media = card.querySelector(".project-card__media");
    var img = media && media.querySelector("img");
    if (!img) return;
    // Show a neutral placeholder instead of the browser's broken-image icon.
    var markBroken = function () { media.classList.add("is-broken"); };
    if (img.complete && img.naturalWidth === 0) markBroken();
    else img.addEventListener("error", markBroken, { once: true });
  }

  function revealOnScroll(cards) {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    cards.forEach(function (card) {
      // Only animate cards that start below the fold, so nothing visible flickers.
      if (card.getBoundingClientRect().top > window.innerHeight) {
        card.classList.add("will-reveal");
        observer.observe(card);
      }
    });
  }

  function init() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
    cards.forEach(guardThumbnail);
    revealOnScroll(cards);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
