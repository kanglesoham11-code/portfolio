// ═══════════════════════════════════════════════════════════════════════════
// HERO-THREE.JS — Smooth Deep-Space Travel · Full-Screen White Starfield
// Mobile Optimized
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const isMobile = window.innerWidth < 768;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap pixel ratio on mobile to prevent performance drops
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 0, 0);

  // ──────────────────────────────────────────────
  // LAYER 1: FAR BACKGROUND STARS (Celestial Sphere)
  // ──────────────────────────────────────────────
  const BG_COUNT = isMobile ? 1500 : 5000;
  const bgGeo = new THREE.BufferGeometry();
  const bgPos = new Float32Array(BG_COUNT * 3);
  const bgSizes = new Float32Array(BG_COUNT);

  for (let i = 0; i < BG_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1200 + Math.random() * 1800;
    bgPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    bgPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    bgPos[i*3+2] = r * Math.cos(phi);
    bgSizes[i] = 0.3 + Math.random() * (isMobile ? 3.0 : 2.0); // Slightly larger on mobile
  }

  bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
  bgGeo.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

  const bgMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      varying float vAlpha;
      uniform float time;
      void main() {
        float twinkle = 0.5 + 0.5 * sin(time * 0.8 + position.x * 0.05 + position.y * 0.07);
        vAlpha = twinkle;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (350.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        float core = exp(-d * 14.0);
        float glow = exp(-d * 5.0) * 0.3;
        float alpha = (core + glow) * vAlpha;
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.85);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(bgGeo, bgMat));

  // ──────────────────────────────────────────────
  // LAYER 2: DRIFTING STARS (Gentle Forward Motion)
  // ──────────────────────────────────────────────
  const DRIFT_COUNT = isMobile ? 800 : 3000;
  const driftGeo = new THREE.BufferGeometry();
  const driftPos = new Float32Array(DRIFT_COUNT * 3);
  const driftSizes = new Float32Array(DRIFT_COUNT);
  const driftSpd = new Float32Array(DRIFT_COUNT);

  function resetDriftStar(i) {
    driftPos[i*3]   = (Math.random() - 0.5) * 200;
    driftPos[i*3+1] = (Math.random() - 0.5) * 160;
    driftPos[i*3+2] = -(200 + Math.random() * 2000);
    driftSpd[i] = 0.15 + Math.random() * 0.5;
    driftSizes[i] = 0.8 + Math.random() * 2.5;
  }

  for (let i = 0; i < DRIFT_COUNT; i++) {
    resetDriftStar(i);
    driftPos[i*3+2] = -(Math.random() * 2000);
  }

  driftGeo.setAttribute('position', new THREE.BufferAttribute(driftPos, 3));
  driftGeo.setAttribute('size', new THREE.BufferAttribute(driftSizes, 1));

  const driftMat = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      varying float vDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_PointSize = size * (500.0 / -mv.z);
        gl_PointSize = min(gl_PointSize, 20.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vDepth;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        float core = exp(-d * 10.0);
        float glow = exp(-d * 3.5) * 0.25;
        float alpha = core + glow;
        float brightness = clamp(1.0 - vDepth * 0.0003, 0.4, 1.0);
        gl_FragColor = vec4(vec3(brightness), alpha * 0.9);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(driftGeo, driftMat));

  // ──────────────────────────────────────────────
  // LAYER 3: FINE COSMIC DUST
  // ──────────────────────────────────────────────
  const DUST_COUNT = isMobile ? 300 : 1500;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST_COUNT * 3);
  const dustSpd = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    dustPos[i*3]   = (Math.random() - 0.5) * 150;
    dustPos[i*3+1] = (Math.random() - 0.5) * 120;
    dustPos[i*3+2] = -(Math.random() * 1200);
    dustSpd[i] = 0.05 + Math.random() * 0.2;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

  const dustMat = new THREE.PointsMaterial({
    size: 0.3,
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(dustGeo, dustMat));

  // ──────────────────────────────────────────────
  // LAYER 4: NEBULA CLOUDS
  // ──────────────────────────────────────────────
  const nebulaGroup = new THREE.Group();
  scene.add(nebulaGroup);

  function createNebula(x, y, z, size, opacity) {
    const nCanvas = document.createElement('canvas');
    nCanvas.width = isMobile ? 128 : 256; 
    nCanvas.height = isMobile ? 128 : 256;
    const ctx = nCanvas.getContext('2d');
    const multiplier = isMobile ? 0.5 : 1;

    for (let layer = 0; layer < (isMobile ? 3 : 5); layer++) {
      const cx = (100 * multiplier) + (Math.random() - 0.5) * (80 * multiplier);
      const cy = (100 * multiplier) + (Math.random() - 0.5) * (80 * multiplier);
      const r = (50 * multiplier) + Math.random() * (90 * multiplier);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const a = 0.03 + Math.random() * 0.04;
      grad.addColorStop(0, `rgba(200, 200, 220, ${a})`);
      grad.addColorStop(0.5, `rgba(180, 180, 200, ${a * 0.4})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, nCanvas.width, nCanvas.height);
    }

    const texture = new THREE.CanvasTexture(nCanvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData = { speed: 0.08 + Math.random() * 0.15 };
    nebulaGroup.add(mesh);
  }

  // Reduce number of nebulae on mobile
  const numNebulae = isMobile ? 3 : 5;
  const nebParams = [
    [-100, 50, -800, 400, 0.35],
    [120, -40, -1300, 500, 0.3],
    [-70, -60, -1800, 350, 0.25],
    [80, 70, -2300, 450, 0.3],
    [-130, 20, -2700, 380, 0.2]
  ];
  
  for(let i=0; i<numNebulae; i++) {
     createNebula(...nebParams[i]);
  }

  // ──────────────────────────────────────────────
  // LAYER 5: SPIRAL GALAXIES
  // ──────────────────────────────────────────────
  const galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  function createGalaxy(x, y, z, scale, arms) {
    const COUNT = isMobile ? 800 : 3500;
    const gGeo = new THREE.BufferGeometry();
    const gPos = new Float32Array(COUNT * 3);
    const gSizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const radius = Math.pow(Math.random(), 1.5) * scale;
      const spinAngle = radius * 0.12;
      const branchAngle = (i % arms) * ((Math.PI * 2) / arms);

      const scatter = (1 - radius / scale) * scale * 0.12;
      const rx = (Math.random() - 0.5) * scatter;
      const ry = (Math.random() - 0.5) * scatter * 0.1;
      const rz = (Math.random() - 0.5) * scatter;

      gPos[i*3]   = Math.cos(branchAngle + spinAngle) * radius + rx;
      gPos[i*3+1] = ry;
      gPos[i*3+2] = Math.sin(branchAngle + spinAngle) * radius + rz;

      gSizes[i] = radius < scale * 0.08 ? 2.5 + Math.random() : 0.4 + Math.random() * 1.2;
    }

    gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    gGeo.setAttribute('size', new THREE.BufferAttribute(gSizes, 1));

    const gMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying float vSize;
        void main() {
          vSize = size;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (250.0 / -mv.z);
          gl_PointSize = min(gl_PointSize, 6.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vSize;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if(d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          float brightness = vSize > 2.0 ? 1.0 : 0.7;
          gl_FragColor = vec4(vec3(brightness), alpha * 0.55);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const galaxy = new THREE.Points(gGeo, gMat);
    galaxy.position.set(x, y, z);
    galaxy.rotation.x = Math.PI * 0.35 + (Math.random() - 0.5) * 0.4;
    galaxy.rotation.z = Math.random() * Math.PI;
    galaxy.userData = { rotSpeed: (Math.random() - 0.5) * 0.001, speed: 0.1 + Math.random() * 0.15 };
    galaxyGroup.add(galaxy);
  }

  // Reduce galaxies on mobile
  const numGalaxies = isMobile ? 2 : 4;
  const galParams = [
    [-100, 40, -1000, 55, 3],
    [130, -50, -1600, 75, 4],
    [-80, -40, -2200, 60, 3],
    [90, 60, -2800, 90, 5]
  ];

  for(let i=0; i<numGalaxies; i++) {
     createGalaxy(...galParams[i]);
  }

  // ─── INTERACTION TRACKING ───
  let mouseX = 0, mouseY = 0;
  let tMouseX = 0, tMouseY = 0;

  if (!isMobile) {
    document.addEventListener('mousemove', e => {
      tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      tMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  } else {
    // Optional: map touch events to camera movement
    document.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        tMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        tMouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, {passive: true});
  }

  canvas.style.pointerEvents = 'none';

  // ─── ANIMATION LOOP ───
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    const s60 = dt * 60;

    mouseX += (tMouseX - mouseX) * 1.5 * dt;
    mouseY += (tMouseY - mouseY) * 1.5 * dt;

    bgMat.uniforms.time.value = elapsed;

    const dp = driftGeo.attributes.position.array;
    for (let i = 0; i < DRIFT_COUNT; i++) {
      dp[i*3+2] += driftSpd[i] * s60;
      if (dp[i*3+2] > 30) resetDriftStar(i);
    }
    driftGeo.attributes.position.needsUpdate = true;

    const dustP = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST_COUNT; i++) {
      dustP[i*3+2] += dustSpd[i] * s60;
      if (dustP[i*3+2] > 20) {
        dustP[i*3]   = (Math.random() - 0.5) * 150;
        dustP[i*3+1] = (Math.random() - 0.5) * 120;
        dustP[i*3+2] = -1200;
      }
    }
    dustGeo.attributes.position.needsUpdate = true;

    nebulaGroup.children.forEach(neb => {
      neb.position.z += neb.userData.speed * s60;
      neb.rotation.z += 0.00015 * s60;
      if (neb.position.z > 400) {
        neb.position.z = -2800;
        neb.position.x = (Math.random() - 0.5) * 280;
        neb.position.y = (Math.random() - 0.5) * 180;
      }
    });

    galaxyGroup.children.forEach(gal => {
      gal.rotation.y += gal.userData.rotSpeed * s60;
      gal.position.z += gal.userData.speed * s60;
      if (gal.position.z > 400) {
        gal.position.z = -3000;
        gal.position.x = (Math.random() - 0.5) * 280;
        gal.position.y = (Math.random() - 0.5) * 180;
      }
    });

    camera.position.x += (mouseX * 3 - camera.position.x) * 1.0 * dt;
    camera.position.y += (mouseY * 2 - camera.position.y) * 1.0 * dt;
    camera.lookAt(mouseX * 1.5, mouseY * 1, -500);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
