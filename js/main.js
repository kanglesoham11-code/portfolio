// ═══════════════════════════════════════════════════════════════════════════
// MAIN.JS — Preloader, Lenis Smooth Scroll, Mobile Menu, Contact Form
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  // ——— Preloader ———
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloader-fill');
    const percent = document.getElementById('preloader-percent');
    
    if (!preloader) return;

    let progress = 0;
    const duration = 2000;
    const start = performance.now();

    function updateProgress(now) {
      const elapsed = now - start;
      progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const displayPercent = Math.round(easedProgress * 100);
      
      if (fill) fill.style.width = displayPercent + '%';
      if (percent) percent.textContent = displayPercent + '%';

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          preloader.classList.add('done');
          document.body.style.overflow = '';
          
          if (window._heroTimeline) {
            setTimeout(() => window._heroTimeline.play(), 300);
          }
        }, 300);
      }
    }

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(updateProgress);
  }

  // ——— Lenis Smooth Scroll ———
  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -80 });
          closeMobileMenu();
        }
      });
    });

    window._lenis = lenis;
  }

  // ——— Mobile Menu ———
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger) hamburger.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ——— Button Ripple Effect ———
  function initRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--ripple-x', x + '%');
        btn.style.setProperty('--ripple-y', y + '%');
      });
    });
  }

  // ——— Footer Year ———
  function initFooterYear() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ——— Contact Form (Web3Forms) ———
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'TRANSMITTING...';

      // Hide previous messages
      if (successEl) successEl.classList.remove('visible');
      if (errorEl) errorEl.classList.remove('visible');

      try {
        const formData = new FormData(form);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          if (successEl) successEl.classList.add('visible');
          form.reset();
        } else {
          if (errorEl) errorEl.classList.add('visible');
        }
      } catch (err) {
        if (errorEl) errorEl.classList.add('visible');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;
      }
    });
  }

  // ——— Init ———
  function init() {
    initPreloader();
    initLenis();
    initMobileMenu();
    initRipple();
    initFooterYear();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
