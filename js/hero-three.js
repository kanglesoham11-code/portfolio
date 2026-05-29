(function () {
  'use strict';

  // ── Feature Detection ──────────────────────────────────────────────
  if (typeof THREE === 'undefined') {
    console.warn('[hero-three] THREE.js not loaded — aborting.');
    return;
  }

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) {
    console.warn('[hero-three] #hero-canvas not found — aborting.');
    return;
  }

  // ── Constants & Config ─────────────────────────────────────────────
  var isMobile = window.innerWidth < 768;

  var CONFIG = {
    particleCount:       isMobile ? 250 : 600,
    connectionMax:       isMobile ? 350 : 1500,  // Enable on mobile
    proximityThreshold:  350,
    mouseRadius:         300,
    mouseLerp:           0.02,
    spreadX:             3000,
    spreadY:             3000,
    spreadZ:             1500,
    driftSpeed:          0.08,
    pointSizeMin:        4.0,
    pointSizeMax:        8.0,
    cameraFov:           75,
    cameraZ:             500,
    autoRotateSpeed:     0.0002,
    scrollDispersionMul: 0.5,
    resizeDebounceMs:    200
  };

  // ── Renderer ───────────────────────────────────────────────────────
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobile
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ── Scene & Camera ─────────────────────────────────────────────────
  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    CONFIG.cameraFov,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.z = CONFIG.cameraZ;

  // ── Particle Data ──────────────────────────────────────────────────
  var count = CONFIG.particleCount;

  // Flat arrays: x, y, z per particle
  var positions  = new Float32Array(count * 3);
  var basePositions = new Float32Array(count * 3); // store original positions
  var colors     = new Float32Array(count * 3);
  var baseColors = new Float32Array(count * 3); // store originals for brightening
  var sizes      = new Float32Array(count);
  var velocities = new Float32Array(count * 3);

  // Palette: highly saturated amber, cyan, bright gold
  var palette = [
    { r: 255 / 255, g: 153 / 255, b:   0 / 255 },  // bright orange
    { r:   0 / 255, g: 255 / 255, b: 255 / 255 },  // neon cyan
    { r: 255 / 255, g: 200 / 255, b:  50 / 255 },  // bright gold
    { r:  50 / 255, g: 200 / 255, b: 255 / 255 },  // light blue
    { r: 255 / 255, g: 120 / 255, b:  20 / 255 }   // deep amber
  ];

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  for (var i = 0; i < count; i++) {
    var i3 = i * 3;

    // Position — centred around origin
    positions[i3]     = randomRange(-CONFIG.spreadX * 0.5, CONFIG.spreadX * 0.5);
    positions[i3 + 1] = randomRange(-CONFIG.spreadY * 0.5, CONFIG.spreadY * 0.5);
    positions[i3 + 2] = randomRange(-CONFIG.spreadZ * 0.5, CONFIG.spreadZ * 0.5);

    basePositions[i3]     = positions[i3];
    basePositions[i3 + 1] = positions[i3 + 1];
    basePositions[i3 + 2] = positions[i3 + 2];

    // Velocity — very subtle drift
    velocities[i3]     = randomRange(-1, 1) * CONFIG.driftSpeed;
    velocities[i3 + 1] = randomRange(-1, 1) * CONFIG.driftSpeed;
    velocities[i3 + 2] = randomRange(-1, 1) * CONFIG.driftSpeed * 0.3;

    // Colour — pick from palette
    var c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
    baseColors[i3]     = c.r;
    baseColors[i3 + 1] = c.g;
    baseColors[i3 + 2] = c.b;

    // Size
    sizes[i] = randomRange(CONFIG.pointSizeMin, CONFIG.pointSizeMax);
  }

  // ── Points Geometry & Material ─────────────────────────────────────
  var particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  // Custom ShaderMaterial — programmatic circle with glow, size attenuation
  var pointVertexShader = [
    'attribute float size;',
    'varying vec3 vColor;',
    'void main() {',
    '  vColor = color;',
    '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = size * (400.0 / -mvPosition.z);',
    '  gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);',
    '  gl_Position = projectionMatrix * mvPosition;',
    '}'
  ].join('\n');

  var pointFragmentShader = [
    'varying vec3 vColor;',
    'void main() {',
    '  vec2 uv = gl_PointCoord - vec2(0.5);',
    '  float d = length(uv);',
    '  if (d > 0.5) discard;',
    '  float alpha = smoothstep(0.5, 0.1, d);',
    '  gl_FragColor = vec4(vColor, min(1.0, alpha * 1.5));',
    '}'
  ].join('\n');

  var pointsMaterial = new THREE.ShaderMaterial({
    vertexShader:   pointVertexShader,
    fragmentShader: pointFragmentShader,
    vertexColors:   true,
    transparent:    true,
    depthWrite:     false,
    blending:       THREE.AdditiveBlending
  });

  var pointsMesh = new THREE.Points(particleGeometry, pointsMaterial);
  scene.add(pointsMesh);

  // ── Connection Lines (desktop only) ────────────────────────────────
  var lineGeometry, lineMaterial, lineSegments;
  var maxLineVerts = CONFIG.connectionMax * 2; // 2 verts per segment
  var linePositions, lineColors;

  if (CONFIG.connectionMax > 0) {
    linePositions = new Float32Array(maxLineVerts * 3);
    lineColors    = new Float32Array(maxLineVerts * 3);

    lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color',    new THREE.BufferAttribute(lineColors, 3));
    lineGeometry.setDrawRange(0, 0);

    lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      opacity:      1.0,
      depthWrite:   false,
      blending:     THREE.NormalBlending
    });

    lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);
  }

  // ── Input Tracking (Desktop & Mobile) ───────────────────────────
  var mouse3D = new THREE.Vector3(99999, 99999, 0); // offscreen default
  var mouseNDC = new THREE.Vector2();
  var raycaster = new THREE.Raycaster();
  var mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var mouseIntersect = new THREE.Vector3();
  var waveForce = 0;

  function updateMouse(x, y) {
    mouseNDC.x =  (x / window.innerWidth)  * 2 - 1;
    mouseNDC.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    raycaster.ray.intersectPlane(mousePlane, mouseIntersect);
    if (mouseIntersect) {
      mouse3D.copy(mouseIntersect);
    }
  }

  // Desktop Events
  document.addEventListener('mousemove', function (e) { updateMouse(e.clientX, e.clientY); });
  document.addEventListener('mouseleave', function () { mouse3D.set(99999, 99999, 0); });
  document.addEventListener('click', function () { waveForce = 1.0; });

  // Mobile Touch Events
  document.addEventListener('touchstart', function(e) {
    waveForce = 1.0;
    if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive: true});
  
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive: true});

  document.addEventListener('touchend', function() {
    mouse3D.set(99999, 99999, 0);
  }, {passive: true});

  // ── Scroll Tracking ───────────────────────────────────────────────
  var scrollProgress = 0;

  function updateScroll() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = scrollable > 0 ? (window.pageYOffset / scrollable) : 0;
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ── Resize Handler (debounced) ─────────────────────────────────────
  var resizeTimer = null;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, CONFIG.resizeDebounceMs);
  });

  // ── Visibility API — pause when hidden ─────────────────────────────
  var paused = false;

  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });

  // ── Half-bounds for wrapping ───────────────────────────────────────
  var halfX = CONFIG.spreadX * 0.5;
  var halfY = CONFIG.spreadY * 0.5;
  var halfZ = CONFIG.spreadZ * 0.5;

  // ── Temp vectors (reuse to avoid GC) ──────────────────────────────
  var _v = new THREE.Vector3();

  // ── Animation Loop ─────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);

    if (paused) return;

    waveForce *= 0.95; // Decay the click/touch wave


    var posAttr   = particleGeometry.getAttribute('position');
    var colorAttr = particleGeometry.getAttribute('color');
    var posArr    = posAttr.array;
    var colArr    = colorAttr.array;

    var scrollMul = 1 + scrollProgress * CONFIG.scrollDispersionMul;

    // ── Update Particles ─────────────────────────────────────────
    for (var i = 0; i < count; i++) {
      var i3 = i * 3;

      // Apply velocity (with scroll dispersion) to both current and base
      posArr[i3]     += velocities[i3]     * scrollMul;
      posArr[i3 + 1] += velocities[i3 + 1] * scrollMul;
      posArr[i3 + 2] += velocities[i3 + 2] * scrollMul;

      basePositions[i3]     += velocities[i3]     * scrollMul;
      basePositions[i3 + 1] += velocities[i3 + 1] * scrollMul;
      basePositions[i3 + 2] += velocities[i3 + 2] * scrollMul;

      // Wrap around bounds (sync both so they don't shoot across screen)
      if (posArr[i3]     >  halfX) { posArr[i3]     = -halfX; basePositions[i3] = -halfX; }
      if (posArr[i3]     < -halfX) { posArr[i3]     =  halfX; basePositions[i3] =  halfX; }
      if (posArr[i3 + 1] >  halfY) { posArr[i3 + 1] = -halfY; basePositions[i3 + 1] = -halfY; }
      if (posArr[i3 + 1] < -halfY) { posArr[i3 + 1] =  halfY; basePositions[i3 + 1] =  halfY; }
      if (posArr[i3 + 2] >  halfZ) { posArr[i3 + 2] = -halfZ; basePositions[i3 + 2] = -halfZ; }
      if (posArr[i3 + 2] < -halfZ) { posArr[i3 + 2] =  halfZ; basePositions[i3 + 2] =  halfZ; }

      // Reset colour to base
      colArr[i3]     = baseColors[i3];
      colArr[i3 + 1] = baseColors[i3 + 1];
      colArr[i3 + 2] = baseColors[i3 + 2];

      // Mouse/Touch attraction & brightening
      _v.set(posArr[i3], posArr[i3 + 1], posArr[i3 + 2]);
      var dist = _v.distanceTo(mouse3D);

      // 1. Continuous attraction vs Spring to base
      var tMouse = CONFIG.mouseLerp * (1 - dist / 5000) * 0.8; 
      if (tMouse < 0) tMouse = 0;
      
      var tBase = 0.01 + (waveForce * 0.5); 
        
      posArr[i3]     += (mouse3D.x - posArr[i3])     * tMouse;
      posArr[i3 + 1] += (mouse3D.y - posArr[i3 + 1]) * tMouse;
      posArr[i3 + 2] += (mouse3D.z - posArr[i3 + 2]) * tMouse;

      posArr[i3]     += (basePositions[i3]     - posArr[i3])     * tBase;
      posArr[i3 + 1] += (basePositions[i3 + 1] - posArr[i3 + 1]) * tBase;
      posArr[i3 + 2] += (basePositions[i3 + 2] - posArr[i3 + 2]) * tBase;

      // 2. Brighten ONLY points near the mouse
      if (dist < CONFIG.mouseRadius) {
        var bright = 1 - dist / CONFIG.mouseRadius;
        colArr[i3]     = Math.min(1.0, baseColors[i3]     + bright * 0.4);
        colArr[i3 + 1] = Math.min(1.0, baseColors[i3 + 1] + bright * 0.4);
        colArr[i3 + 2] = Math.min(1.0, baseColors[i3 + 2] + bright * 0.4);
      }
    }

    posAttr.needsUpdate   = true;
    colorAttr.needsUpdate = true;

    // ── Update Connections (desktop only) ─────────────────────────
    if (CONFIG.connectionMax > 0) {
      var threshold  = CONFIG.proximityThreshold;
      var threshSq   = threshold * threshold;
      var lineCount  = 0;
      var maxConns   = CONFIG.connectionMax;

      // Amber connection colour base
      var lineR = 245 / 255;
      var lineG = 166 / 255;
      var lineB =  35 / 255;

      outer:
      for (var a = 0; a < count - 1; a++) {
        var a3 = a * 3;
        var ax = posArr[a3], ay = posArr[a3 + 1], az = posArr[a3 + 2];

        for (var b = a + 1; b < count; b++) {
          var b3 = b * 3;
          var dx = ax - posArr[b3];
          var dy = ay - posArr[b3 + 1];
          var dz = az - posArr[b3 + 2];
          var distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < threshSq) {
            var d = Math.sqrt(distSq);
            var alpha = (1 - d / threshold) * 0.8;

            var idx = lineCount * 6; // 2 verts × 3 components

            // Vertex A
            linePositions[idx]     = ax;
            linePositions[idx + 1] = ay;
            linePositions[idx + 2] = az;
            // Vertex B
            linePositions[idx + 3] = posArr[b3];
            linePositions[idx + 4] = posArr[b3 + 1];
            linePositions[idx + 5] = posArr[b3 + 2];

            // Colors (same for both endpoints — faded amber)
            lineColors[idx]     = lineR * alpha;
            lineColors[idx + 1] = lineG * alpha;
            lineColors[idx + 2] = lineB * alpha;
            lineColors[idx + 3] = lineR * alpha;
            lineColors[idx + 4] = lineG * alpha;
            lineColors[idx + 5] = lineB * alpha;

            lineCount++;
            if (lineCount >= maxConns) break outer;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineCount * 2);
      lineGeometry.getAttribute('position').needsUpdate = true;
      lineGeometry.getAttribute('color').needsUpdate    = true;
    }

    // ── Camera auto-rotation ─────────────────────────────────────
    var rotAngle = Date.now() * 0.00005;
    camera.position.x = Math.sin(rotAngle) * 40;
    camera.position.z = CONFIG.cameraZ + Math.cos(rotAngle) * 20;
    camera.lookAt(scene.position);

    // ── Render ───────────────────────────────────────────────────
    renderer.render(scene, camera);
  }

  // ── Kick off ───────────────────────────────────────────────────────
  animate();

})();
