// ═══════════════════════════════════════════════════════════════════════════
// HERO-THREE.JS — Full-Page Particle Field (Light Theme — Violet/Orange/Cyan)
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  const isMobile = window.innerWidth < 768;
  if (isMobile) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent background
  camera.position.z = 5;

  // Particle system — soft pastels for white background
  const PARTICLE_COUNT = 4000;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const phases = new Float32Array(PARTICLE_COUNT);

  const violet = new THREE.Color(0x7C3AED);
  const orange = new THREE.Color(0xFF6B35);
  const cyan = new THREE.Color(0x06B6D4);
  const pink = new THREE.Color(0xEC4899);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    
    // Spread across larger area for full-page coverage
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 14;
    positions[i3 + 2] = (Math.random() - 0.5) * 8;
    
    velocities[i3] = 0.001 + Math.random() * 0.003;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.0008;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.0005;
    
    // 4-color gradient spectrum
    const t = Math.random();
    let c;
    if (t < 0.3) {
      c = violet.clone().lerp(pink, t / 0.3);
    } else if (t < 0.6) {
      c = pink.clone().lerp(orange, (t - 0.3) / 0.3);
    } else {
      c = orange.clone().lerp(cyan, (t - 0.6) / 0.4);
    }
    // Make colors softer/lighter for white background
    c.lerp(new THREE.Color(0xFFFFFF), 0.3);
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
    
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.NormalBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Connection lines — soft violet
  const LINE_COUNT = 120;
  const linePositions = new Float32Array(LINE_COUNT * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x7C3AED,
    transparent: true,
    opacity: 0.04,
    blending: THREE.NormalBlending,
  });
  
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Mouse interaction
  let mouse3D = new THREE.Vector2(0, 0);
  let targetMouse = new THREE.Vector2(0, 0);

  document.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let time = 0;
  const CONNECTION_DIST = 1.0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.004;

    mouse3D.x += (targetMouse.x - mouse3D.x) * 0.04;
    mouse3D.y += (targetMouse.y - mouse3D.y) * 0.04;

    const posArr = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Gentle flow
      posArr[i3] += velocities[i3];
      posArr[i3 + 1] += Math.sin(time * 1.5 + phases[i]) * 0.0008;
      posArr[i3 + 2] += Math.cos(time + phases[i]) * 0.0004;
      
      // Wrap around for infinite field
      if (posArr[i3] > 10) posArr[i3] = -10;
      if (posArr[i3] < -10) posArr[i3] = 10;
      if (posArr[i3+1] > 7) posArr[i3+1] = -7;
      if (posArr[i3+1] < -7) posArr[i3+1] = 7;
      
      // Mouse attraction (gentle pull, not repulsion)
      const dx = mouse3D.x * 5 - posArr[i3];
      const dy = mouse3D.y * 4 - posArr[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3 && dist > 0.1) {
        const force = (3 - dist) * 0.0006;
        posArr[i3] += (dx / dist) * force;
        posArr[i3 + 1] += (dy / dist) * force;
      }
    }

    geometry.attributes.position.needsUpdate = true;

    // Update connection lines
    let lineIdx = 0;
    const linePosArr = lineGeometry.attributes.position.array;
    
    for (let i = 0; i < Math.min(PARTICLE_COUNT, 400) && lineIdx < LINE_COUNT; i++) {
      for (let j = i + 1; j < Math.min(PARTICLE_COUNT, 400) && lineIdx < LINE_COUNT; j++) {
        const i3 = i * 3, j3 = j * 3;
        const ddx = posArr[i3] - posArr[j3];
        const ddy = posArr[i3+1] - posArr[j3+1];
        const ddz = posArr[i3+2] - posArr[j3+2];
        const d = ddx*ddx + ddy*ddy + ddz*ddz;
        
        if (d < CONNECTION_DIST * CONNECTION_DIST) {
          const li = lineIdx * 6;
          linePosArr[li] = posArr[i3];
          linePosArr[li+1] = posArr[i3+1];
          linePosArr[li+2] = posArr[i3+2];
          linePosArr[li+3] = posArr[j3];
          linePosArr[li+4] = posArr[j3+1];
          linePosArr[li+5] = posArr[j3+2];
          lineIdx++;
        }
      }
    }
    
    for (let i = lineIdx * 6; i < LINE_COUNT * 6; i++) {
      linePosArr[i] = 0;
    }
    lineGeometry.attributes.position.needsUpdate = true;

    // Gentle camera sway
    camera.position.x += (mouse3D.x * 0.3 - camera.position.x) * 0.015;
    camera.position.y += (mouse3D.y * 0.2 - camera.position.y) * 0.015;
    camera.lookAt(0, 0, 0);

    particles.rotation.y += 0.0002;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
