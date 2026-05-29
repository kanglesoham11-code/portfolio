/**
 * Custom Cursor – dot + ring with lerp-based rAF animation
 * Self-contained IIFE, vanilla JS, zero dependencies.
 */
(function () {
  'use strict';

  // ── Touch-device bail-out ──────────────────────────────────────────
  var isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  if (isTouch) {
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return; // nothing else to do
  }

  // ── Hide native cursor ────────────────────────────────────────────
  document.body.style.cursor = 'none';

  // Also hide cursor on all interactive elements so it doesn't flash back
  var cursorStyle = document.createElement('style');
  cursorStyle.textContent =
    '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(cursorStyle);

  // ── Grab DOM handles ──────────────────────────────────────────────
  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');

  if (!dot || !ring) return;

  // ── GPU-acceleration hints ────────────────────────────────────────
  dot.style.willChange = 'transform, opacity';
  ring.style.willChange = 'transform, opacity';

  // ── Mix-blend-mode on dot ─────────────────────────────────────────
  dot.style.mixBlendMode = 'difference';

  // ── State ─────────────────────────────────────────────────────────
  var mouse = { x: 0, y: 0 };
  var dotPos = { x: 0, y: 0 };
  var ringPos = { x: 0, y: 0 };

  var DOT_LERP = 0.35;
  var RING_LERP = 0.12;

  // Target scales / border – these are *targets*; we lerp toward them
  var dotScale = 1;
  var ringScale = 1;
  var ringBorder = 'rgba(245, 166, 35, 0.3)'; // default amber 30 %

  // Animated (current) scales
  var curDotScale = 1;
  var curRingScale = 1;

  var SCALE_LERP = 0.18; // how fast scales interpolate

  var visible = true; // false when cursor leaves the window

  // ── Selectors ─────────────────────────────────────────────────────
  var INTERACTIVE_SELECTOR =
    'a, button, .btn, [data-magnetic], [data-tilt], .skill-tag, .social-link, .nav-link, .mobile-link';
  var CYAN_SELECTOR = '.btn-secondary, .social-link';
  var TEXT_SELECTOR = 'p, h1, h2, h3, span';

  // ── Helpers ───────────────────────────────────────────────────────
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Walk up the DOM from `el` and return true if any ancestor (including
   * `el` itself) matches `selector`.
   */
  function matchesUp(el, selector) {
    while (el && el !== document.documentElement) {
      try {
        if (el.matches && el.matches(selector)) return true;
      } catch (_) {
        /* ignore */
      }
      el = el.parentNode;
    }
    return false;
  }

  // ── Event listeners ───────────────────────────────────────────────

  // Mouse move – just store coordinates (cheap, no DOM writes)
  document.addEventListener(
    'mousemove',
    function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Determine hover context and set *target* values
      var target = e.target;

      if (matchesUp(target, INTERACTIVE_SELECTOR)) {
        dotScale = 0.5;
        ringScale = 1.5;
        ringBorder = matchesUp(target, CYAN_SELECTOR)
          ? 'rgba(80, 227, 194, 0.6)'
          : 'rgba(245, 166, 35, 0.6)';
      } else if (matchesUp(target, TEXT_SELECTOR)) {
        dotScale = 1;
        ringScale = 1.2;
        ringBorder = 'rgba(245, 166, 35, 0.3)';
      } else {
        dotScale = 1;
        ringScale = 1;
        ringBorder = 'rgba(245, 166, 35, 0.3)';
      }
    },
    { passive: true }
  );

  // Click feedback
  document.addEventListener(
    'mousedown',
    function () {
      dotScale = 0.6;
      ringScale = 0.85;
    },
    { passive: true }
  );

  document.addEventListener(
    'mouseup',
    function () {
      // Restore to whatever the hover state should be – will be
      // recalculated on the next mousemove, but give sensible defaults.
      dotScale = 1;
      ringScale = 1;
    },
    { passive: true }
  );

  // Window leave / enter
  document.addEventListener(
    'mouseleave',
    function () {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    },
    { passive: true }
  );

  document.addEventListener(
    'mouseenter',
    function () {
      visible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    },
    { passive: true }
  );

  // ── Animation loop ────────────────────────────────────────────────
  function tick() {
    // Lerp positions
    dotPos.x = lerp(dotPos.x, mouse.x, DOT_LERP);
    dotPos.y = lerp(dotPos.y, mouse.y, DOT_LERP);

    ringPos.x = lerp(ringPos.x, mouse.x, RING_LERP);
    ringPos.y = lerp(ringPos.y, mouse.y, RING_LERP);

    // Lerp scales for buttery transitions
    curDotScale = lerp(curDotScale, dotScale, SCALE_LERP);
    curRingScale = lerp(curRingScale, ringScale, SCALE_LERP);

    // ── Write phase (batched, single rAF) ───────────────────────
    dot.style.transform =
      'translate3d(' +
      dotPos.x +
      'px, ' +
      dotPos.y +
      'px, 0) translate(-50%, -50%) scale(' +
      curDotScale.toFixed(3) +
      ')';

    ring.style.transform =
      'translate3d(' +
      ringPos.x +
      'px, ' +
      ringPos.y +
      'px, 0) translate(-50%, -50%) scale(' +
      curRingScale.toFixed(3) +
      ')';

    ring.style.borderColor = ringBorder;

    requestAnimationFrame(tick);
  }

  // Kick off – set initial opacity so the cursor is hidden until the
  // first mouseenter (avoids a flash at 0,0).
  dot.style.opacity = '0';
  ring.style.opacity = '0';

  // On the very first mousemove, snap positions so there's no lerp from 0,0
  var firstMove = function (e) {
    dotPos.x = e.clientX;
    dotPos.y = e.clientY;
    ringPos.x = e.clientX;
    ringPos.y = e.clientY;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    visible = true;
    document.removeEventListener('mousemove', firstMove);
  };
  document.addEventListener('mousemove', firstMove, { passive: true });

  requestAnimationFrame(tick);
})();
