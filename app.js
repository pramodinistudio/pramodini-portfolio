/* ============================================================
   Pramodini Subramanya — Portfolio · Shared behaviour
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Page entrance fade-in ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("loaded");
  });
  // ensure fade-in even if loaded fires before listener
  window.addEventListener("pageshow", function () {
    document.body.classList.remove("fade-out");
  });

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    document.body.classList.add("cursor-active");
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = "translate(" + mouseX + "px," + mouseY + "px) translate(-50%,-50%)";
    });
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = "translate(" + (ringX - 16) + "px," + (ringY - 16) + "px)";
      requestAnimationFrame(animateRing);
    })();

    function setCursor(state) {
      document.body.classList.remove("cursor-link", "cursor-view");
      if (state === "view") {
        document.body.classList.add("cursor-view");
        dot.textContent = "View →";
      } else if (state === "link") {
        document.body.classList.add("cursor-link");
        dot.textContent = "";
      } else {
        dot.textContent = "";
      }
    }

    // case card thumbnails -> "View →" pill
    document.querySelectorAll(".case-card .case-thumb").forEach(function (el) {
      el.addEventListener("mouseenter", function () { setCursor("view"); });
      el.addEventListener("mouseleave", function () { setCursor(null); });
    });
    // generic interactive -> grow dot
    document.querySelectorAll("a, button, .case-card").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (!document.body.classList.contains("cursor-view")) setCursor("link");
      });
      el.addEventListener("mouseleave", function () {
        if (!el.matches(".case-thumb")) setCursor(null);
      });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var bar = document.querySelector(".scroll-bar");
  function updateBar() {
    if (!bar) return;
    var h = document.body.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = pct + "%";
  }

  /* ---------- Nav morph on scroll ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 70);
    updateBar();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Sticky stacking case cards (recede as covered) ---------- */
  var stackEls = [].slice.call(document.querySelectorAll(".case-grid > .stack-card"));
  if (stackEls.length > 1 && !reduceMotion) {
    var stackTicking = false;
    function updateStack() {
      for (var i = 0; i < stackEls.length; i++) {
        var el = stackEls[i];
        var next = stackEls[i + 1];
        if (!next) { el.style.transform = ""; el.style.filter = ""; continue; }
        var r = el.getBoundingClientRect();
        var rn = next.getBoundingClientRect();
        // p: how far the next card has risen up over this card (0→1)
        var p = (r.bottom - rn.top) / 260;
        p = p < 0 ? 0 : (p > 1 ? 1 : p);
        if (p <= 0) { el.style.transform = ""; el.style.filter = ""; continue; }
        var scale = 1 - 0.05 * p;
        el.style.transform = "scale(" + scale.toFixed(4) + ")";
        el.style.filter = "brightness(" + (1 - 0.16 * p).toFixed(4) + ")";
      }
      stackTicking = false;
    }
    function onStackScroll() {
      if (!stackTicking) { stackTicking = true; requestAnimationFrame(updateStack); }
    }
    window.addEventListener("scroll", onStackScroll, { passive: true });
    window.addEventListener("resize", onStackScroll, { passive: true });
    updateStack();
  }

  /* ---------- Count-up for proof metrics ---------- */
  function countUp(el, target, prefix, suffix, duration) {
    if (reduceMotion) { el.textContent = prefix + target.toLocaleString() + suffix; return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCountUp(scope) {
    var nums = (scope || document).querySelectorAll("[data-count]");
    if (!nums.length) return;
    if (!("IntersectionObserver" in window)) {
      nums.forEach(function (el) {
        countUp(el, +el.dataset.count, el.dataset.prefix || "", el.dataset.suffix || "", 1400);
      });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          countUp(el, +el.dataset.count, el.dataset.prefix || "", el.dataset.suffix || "", 1400);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { obs.observe(el); });
  }
  initCountUp();

  /* ---------- Page transitions ---------- */
  document.querySelectorAll("a[data-transition]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      e.preventDefault();
      document.body.classList.add("fade-out");
      setTimeout(function () { window.location = href; }, 220);
    });
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".nav-burger");
  var menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      document.body.style.overflow = menu.classList.contains("open") ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Tools marquee with brand logos ---------- */
  var toolsMarquee = document.getElementById("toolsMarquee");
  if (toolsMarquee) {
    var claudeBurst = (function () {
      var spokes = "";
      for (var i = 0; i < 12; i++) {
        var len = i % 2 === 0 ? 3 : 4.5;
        spokes += '<line x1="12" y1="12" x2="12" y2="' + len + '" stroke="#D97757" stroke-width="2.1" stroke-linecap="round" transform="rotate(' + (i * 30) + ' 12 12)"/>';
      }
      return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + spokes + "</svg>";
    })();

    var LOGOS = {
      figma:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="8" cy="5" r="4" fill="#F24E1E"/>' +
        '<circle cx="8" cy="12" r="4" fill="#FF7262"/>' +
        '<circle cx="8" cy="19" r="4" fill="#0ACF83"/>' +
        '<circle cx="16" cy="5" r="4" fill="#A259FF"/>' +
        '<circle cx="16" cy="12" r="4" fill="#1ABCFE"/></svg>',
      claude: claudeBurst,
      framer:
        '<svg viewBox="0 0 14 21" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="#1A1A1A" d="M0 0h14v7H7zM0 7h7l7 7H7v7L0 14z"/></svg>',
      perplexity:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#20808D" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3v18"/>' +
        '<path d="M12 7 L5 4 V11 L12 14"/>' +
        '<path d="M12 7 L19 4 V11 L12 14"/>' +
        '<path d="M12 17 L5 20 V13"/>' +
        '<path d="M12 17 L19 20 V13"/></svg>',
      jira:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="#2684FF" d="M12 2 L22 12 H17 L12 7 L7 12 H2 Z"/>' +
        '<path fill="#2684FF" fill-opacity="0.55" d="M12 9 L22 19 H17 L12 14 L7 19 H2 Z"/></svg>',
      ae:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="2" y="2" width="20" height="20" rx="4.5" fill="#00005B"/>' +
        '<text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#9D9DF7">Ae</text></svg>'
    };

    var tools = [
      { name: "Figma", logo: LOGOS.figma },
      { name: "Claude", logo: LOGOS.claude },
      { name: "Figma Make", logo: LOGOS.figma },
      { name: "Framer", logo: LOGOS.framer },
      { name: "Perplexity", logo: LOGOS.perplexity },
      { name: "Jira", logo: LOGOS.jira },
      { name: "Adobe After Effects", logo: LOGOS.ae }
    ];

    function pill(t) {
      return '<span class="marquee-pill">' + t.logo + "<span>" + t.name + "</span></span>";
    }
    var html = "";
    for (var copy = 0; copy < 2; copy++) {
      tools.forEach(function (t) { html += pill(t); });
    }
    toolsMarquee.innerHTML = html;
  }
})();
