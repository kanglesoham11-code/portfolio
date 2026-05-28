// ═══════════════════════════════════════════════════════════════════════════
// HERO-THREE.JS — 3D Approaching Lines (Luma Style)
// Thin, crisp lines · Muted warm tones · No neon · No dots
// Ultra-Optimized for Mobile Performance
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;

  function resize() {
    // Keep canvas at logical resolution (1x device pixel ratio) for maximum performance,
    // especially critical on high-DPI mobile screens to prevent GPU fill-rate bottleneck.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ─── MUTED WARM PALETTE ───
  const COLORS = [
    [195, 140, 55],   // aged gold
    [175, 115, 45],   // dark amber
    [160, 95, 40],    // rust
    [190, 130, 50],   // caramel
    [145, 85, 35],    // burnt sienna
    [55, 95, 140],    // muted steel blue
    [45, 120, 105],   // deep teal
    [60, 105, 80],    // olive green
    [75, 130, 120],   // sage seafoam
    [160, 155, 145],  // warm gray
  ];

  function getGhostColor(c) {
    if (c[0] > c[2]) return [45, 85, 135];  
    return [185, 125, 50];                   
  }

  // ─── CONFIG ───
  // Significantly reduce count on mobile to guarantee 60fps
  const POOL = isMobile ? 120 : 400; 
  const CENTER_GAP = isMobile ? 25 : 40;
  const streaks = [];

  function initStreak(stagger) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const startZ = stagger 
      ? Math.random() * 2000 
      : 2000 + Math.random() * 500;

    const x3d = (Math.random() - 0.5) * 1800;
    const y3d = (Math.random() - 0.5) * 1800;
    
    const zSpeed = 0.5 + Math.random() * 2.0;

    return {
      x3d,
      y3d,
      z: startZ,
      zSpeed,
      color,
      ghost: getGhostColor(color),
      trailLen: 150 + Math.random() * 300,
      baseWidth: 0.3 + Math.random() * 0.3,
    };
  }

  function resetStreak(s) {
    s.z = 2000 + Math.random() * 500;
    s.x3d = (Math.random() - 0.5) * 2000;
    s.y3d = (Math.random() - 0.5) * 2000;
    s.zSpeed = 0.5 + Math.random() * 2.0;
    s.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    s.ghost = getGhostColor(s.color);
    s.baseWidth = 0.3 + Math.random() * 0.3;
    s.trailLen = 150 + Math.random() * 300;
  }

  for (let i = 0; i < POOL; i++) {
    streaks.push(initStreak(true));
  }

  // Cache RGBA strings to avoid string concatenation in the render loop
  // This is a major CPU saver on mobile.
  const rgbaCache = new Map();
  function getCachedRGBA(r, g, b, alpha) {
    // Quantize alpha to 2 decimal places to increase cache hits
    const a = Math.round(alpha * 100) / 100;
    const key = `${r},${g},${b},${a}`;
    let val = rgbaCache.get(key);
    if (!val) {
      val = `rgba(${r},${g},${b},${a})`;
      rgbaCache.set(key, val);
    }
    return val;
  }

  // ─── DRAW ───
  function draw() {
    requestAnimationFrame(draw);

    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.5;
    const cy = H * 0.5;
    const fov = 400; 

    // Fill background solid
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, W, H);

    ctx.lineCap = 'round';

    for (let i = 0; i < streaks.length; i++) {
      const s = streaks[i];

      if (s.z > 2500) {
        s.z -= s.zSpeed * 5;
        continue;
      }

      const tailZ = s.z + s.trailLen;

      // Projection
      const scaleHead = fov / (s.z < 1 ? 1 : s.z);
      const xHead = cx + s.x3d * scaleHead;
      const yHead = cy + s.y3d * scaleHead;

      const scaleTail = fov / (tailZ < 1 ? 1 : tailZ);
      const xTail = cx + s.x3d * scaleTail;
      const yTail = cy + s.y3d * scaleTail;

      // Fast distance check (avoid Math.sqrt if possible, but needed for gap check)
      const dxDist = xHead - cx;
      const dyDist = yHead - cy;
      const distFromCenter = Math.sqrt(dxDist * dxDist + dyDist * dyDist);

      if (distFromCenter > CENTER_GAP && s.z > 0) {
        
        const depth = 1 - (s.z / 2000);
        const lw = s.baseWidth + (depth * 0.6);
        const alpha = 0.4 + (depth * 0.5);

        // Main line
        ctx.beginPath();
        ctx.moveTo(xTail, yTail);
        ctx.lineTo(xHead, yHead);
        ctx.strokeStyle = getCachedRGBA(s.color[0], s.color[1], s.color[2], alpha);
        ctx.lineWidth = lw;
        ctx.stroke();

        // Ghosts (Disable on mobile to save 2/3rds of draw calls for massive performance boost)
        if (!isMobile && depth > 0.4) {
          const dx = xHead - xTail;
          const dy = yHead - yTail;
          const len2d = Math.sqrt(dx * dx + dy * dy);

          if (len2d > 1.0) {
            const px = -dy / len2d;
            const py = dx / len2d;
            const offset = 0.8 + depth * 0.6;
            const ghostA = 0.1 + depth * 0.15;
            const ghostStroke = getCachedRGBA(s.ghost[0], s.ghost[1], s.ghost[2], ghostA);

            ctx.lineWidth = lw * 0.5;

            ctx.beginPath();
            ctx.moveTo(xTail + px * offset, yTail + py * offset);
            ctx.lineTo(xHead + px * offset, yHead + py * offset);
            ctx.strokeStyle = ghostStroke;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(xTail - px * offset, yTail - py * offset);
            ctx.lineTo(xHead - px * offset, yHead - py * offset);
            ctx.strokeStyle = ghostStroke;
            ctx.stroke();
          }
        }
      }

      // Advance
      const accel = 1 + (1500 / Math.max(s.z, 10));
      s.z -= s.zSpeed * accel;

      // Reset
      if (s.z <= 0 || distFromCenter > Math.max(W, H) * 1.5) {
        resetStreak(s);
      }
    }
  }

  draw();
})();
