/**
 * Cursor — Arrow mode (custom dot+ring removed).
 * Preserves body cursor as default arrow.
 * Self-contained IIFE, vanilla JS, zero dependencies.
 */
(function () {
  'use strict';

  // Hide the dot and ring elements
  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  if (dot) dot.style.display = 'none';
  if (ring) ring.style.display = 'none';

  // Ensure default arrow cursor everywhere
  document.body.style.cursor = 'default';
})();
