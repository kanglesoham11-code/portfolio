// ═══════════════════════════════════════════════════════════════════════════
// CURSOR.JS — Magnetic Cursor with Morph States
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
  if (isMobile) return;

  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor-dot');
  const circle = cursor.querySelector('.cursor-circle');
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let circleX = 0, circleY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Magnetic effect for [data-magnetic] elements
  const magneticElements = document.querySelectorAll('[data-magnetic]');
  
  magneticElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      el.style.transform = '';
    });
    
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = (e.clientX - centerX) * 0.2;
      const distY = (e.clientY - centerY) * 0.2;
      el.style.transform = `translate(${distX}px, ${distY}px)`;
      el.style.transition = 'transform 0.2s ease-out';
    });
  });

  // Click effect
  document.addEventListener('mousedown', () => cursor.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('cursor-click'));

  // Animation loop
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;
    dot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    
    circleX += (mouseX - circleX) * 0.12;
    circleY += (mouseY - circleY) * 0.12;
    circle.style.transform = `translate(${circleX - 20}px, ${circleY - 20}px)`;
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
})();
