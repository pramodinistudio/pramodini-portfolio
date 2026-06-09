/* ============================================================
   Case-study password gate
   ------------------------------------------------------------
   A lightweight, branded access gate for the case-study pages.

   NOTE ON SECURITY: because these are static pages, this is a
   *deterrent* — it keeps casual visitors, shared links and search
   engines out. It is not server-grade protection. Anyone determined
   enough could read the source. For most portfolios that's exactly
   the intent: share the password with the people you want to let in.

   TO CHANGE THE PASSWORD:
   Replace the value of PASSWORD below. That's it.
   ============================================================ */
(function () {
  "use strict";

  // ---- CONFIG -------------------------------------------------
  var PASSWORD   = "pramodini2026";          // ← change this to set your password
  var HINT       = "Ask Pramodini for access.";
  // -------------------------------------------------------------

  // The password is required on EVERY visit — no unlock is remembered,
  // so returning visitors and each case study always prompt again.

  // Hide the page immediately (runs from <head>, before body paints).
  var hideStyle = document.createElement("style");
  hideStyle.id = "gate-hide";
  hideStyle.textContent = "html.gate-locked,html.gate-locked body{overflow:hidden!important}" +
    "html.gate-locked body>*:not(#cs-gate){filter:blur(14px);pointer-events:none;user-select:none}";
  document.documentElement.appendChild(hideStyle);
  document.documentElement.classList.add("gate-locked");

  function buildGate() {
    if (document.getElementById("cs-gate")) return;

    var css = document.createElement("style");
    css.textContent = [
      "#cs-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;",
      "background:radial-gradient(120% 80% at 50% 0%,#221C33 0%,#120F1E 60%);",
      "font-family:'Outfit',sans-serif;opacity:0;transition:opacity .5s cubic-bezier(.22,1,.36,1);padding:24px}",
      "#cs-gate.in{opacity:1}",
      "#cs-gate.out{opacity:0;pointer-events:none}",
      "#cs-gate,#cs-gate *{cursor:auto!important}",
      "#cs-gate input{cursor:text!important}",
      "#cs-gate button,#cs-gate a{cursor:pointer!important}",
      "#cs-gate .gate-card{width:100%;max-width:430px;text-align:center;transform:translateY(14px);",
      "transition:transform .6s cubic-bezier(.22,1,.36,1)}",
      "#cs-gate.in .gate-card{transform:none}",
      "#cs-gate .gate-mark{display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;",
      "border:1px solid rgba(255,255,255,.18);border-radius:50%;color:#fff;font-family:'Cormorant Garamond',serif;",
      "font-size:26px;font-style:italic;margin-bottom:30px}",
      "#cs-gate .gate-eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;",
      "color:#E06060;margin-bottom:18px}",
      "#cs-gate h2{font-family:'Cormorant Garamond',serif;font-weight:500;color:#fff;font-size:34px;line-height:1.15;margin-bottom:14px}",
      "#cs-gate p.sub{color:rgba(255,255,255,.55);font-size:15px;font-weight:300;line-height:1.5;margin-bottom:30px}",
      "#cs-gate form{display:flex;flex-direction:column;gap:12px}",
      "#cs-gate .gate-field{display:flex;gap:10px}",
      "#cs-gate input{flex:1;min-width:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);",
      "border-radius:11px;padding:14px 16px;color:#fff;font-family:'Outfit',sans-serif;font-size:15px;outline:none;",
      "transition:border-color .2s,background .2s}",
      "#cs-gate input::placeholder{color:rgba(255,255,255,.4)}",
      "#cs-gate input:focus{border-color:rgba(224,96,96,.7);background:rgba(255,255,255,.09)}",
      "#cs-gate button{background:#E06060;color:#fff;border:none;border-radius:11px;padding:14px 22px;font-family:'Outfit',sans-serif;",
      "font-size:15px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background .2s,transform .1s}",
      "#cs-gate button:hover{background:#C44848}",
      "#cs-gate button:active{transform:translateY(1px)}",
      "#cs-gate .gate-err{min-height:18px;font-size:13px;color:#E06060;opacity:0;transition:opacity .2s;text-align:left;padding-left:2px}",
      "#cs-gate .gate-err.show{opacity:1}",
      "#cs-gate.shake .gate-card{animation:gateShake .4s}",
      "@keyframes gateShake{10%,90%{transform:translateX(-2px)}30%,70%{transform:translateX(5px)}50%{transform:translateX(-7px)}}",
      "#cs-gate .gate-foot{margin-top:26px;font-size:12.5px;color:rgba(255,255,255,.38)}",
      "#cs-gate .gate-foot a{color:rgba(255,255,255,.6);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.25)}",
      "@media(max-width:480px){#cs-gate .gate-field{flex-direction:column}#cs-gate h2{font-size:28px}}"
    ].join("");
    document.head.appendChild(css);

    var wrap = document.createElement("div");
    wrap.id = "cs-gate";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Password protected case study");
    wrap.innerHTML =
      '<div class="gate-card">' +
        '<div class="gate-mark">Ps</div>' +
        '<div class="gate-eyebrow">Protected case study</div>' +
        '<h2>This work is protected under NDA</h2>' +
        '<p class="sub">Details are only available on request. Enter the password to view this case study.</p>' +
        '<form id="gate-form" autocomplete="off">' +
          '<div class="gate-field">' +
            '<input id="gate-input" type="password" placeholder="Enter password" aria-label="Password" autocomplete="off" spellcheck="false">' +
            '<button type="submit">Unlock</button>' +
          '</div>' +
          '<div class="gate-err" id="gate-err"></div>' +
        '</form>' +
        '<div class="gate-foot"><a href="index.html" id="gate-back">\u2190 Back to portfolio</a></div>' +
      '</div>';
    document.body.appendChild(wrap);

    requestAnimationFrame(function () { wrap.classList.add("in"); });

    var input = document.getElementById("gate-input");
    var err   = document.getElementById("gate-err");
    var form  = document.getElementById("gate-form");
    var back  = document.getElementById("gate-back");
    setTimeout(function () { input.focus(); }, 450);

    if (back) {
      back.addEventListener("click", function (ev) {
        ev.preventDefault();
        document.documentElement.classList.remove("gate-locked");
        window.location.href = "index.html";
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (input.value === PASSWORD) {
        wrap.classList.add("out");
        document.documentElement.classList.remove("gate-locked");
        setTimeout(function () { wrap.remove(); }, 500);
      } else {
        err.textContent = "Incorrect password. " + HINT;
        err.classList.add("show");
        wrap.classList.remove("shake");
        void wrap.offsetWidth;            // restart animation
        wrap.classList.add("shake");
        input.value = "";
        input.focus();
      }
    });
  }

  if (document.body) {
    buildGate();
  } else {
    document.addEventListener("DOMContentLoaded", buildGate);
  }
})();
