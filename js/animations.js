// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS.JS — GSAP ScrollTrigger (with Hero Name Animation)
// ═══════════════════════════════════════════════════════════════════════════

(function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ——— Hero Section Animations ———
  function initHeroAnimations() {
    // Split headline text into chars
    document.querySelectorAll('[data-split]').forEach(line => {
      const text = line.textContent;
      line.textContent = '';
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${i * 0.03}s`;
        line.appendChild(span);
      });
    });

    // Hero timeline — triggered by preloader completion
    const heroTimeline = gsap.timeline({ paused: true });
    
    heroTimeline
      // 1. Name slides up first — the big "Soham Kangle"
      .add(() => {
        const nameLines = document.querySelectorAll('.name-line');
        nameLines.forEach((line, i) => {
          setTimeout(() => line.classList.add('revealed'), i * 150);
        });
      })
      // 2. Then the headline chars
      .add(() => {
        document.querySelectorAll('.headline-line .char').forEach(c => c.classList.add('revealed'));
      }, '+=0.5')
      // 3. Sub-elements
      .add(() => {
        document.querySelector('.hero-subheadline')?.classList.add('revealed');
      }, '-=0.2')
      .add(() => {
        document.querySelector('.hero-descriptor')?.classList.add('revealed');
      })
      .add(() => {
        document.querySelector('.hero-image-container')?.classList.add('revealed');
      })
      .add(() => {
        document.querySelector('.hero-terminal')?.classList.add('revealed');
        typeTerminalLines('.hero-terminal .terminal-line');
      }, '+=0.1')
      .add(() => {
        document.querySelector('.hero-cta')?.classList.add('revealed');
      }, '+=0.3');

    window._heroTimeline = heroTimeline;
  }

  // ——— Terminal Typing Effect ———
  function typeTerminalLines(selector) {
    const lines = document.querySelectorAll(selector);
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('typed'), i * 300);
    });
  }

  // ——— Section Heading Reveals ———
  function initHeadingAnimations() {
    document.querySelectorAll('[data-animate="heading"]').forEach(heading => {
      gsap.to(heading, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.2,
        ease: 'power4.inOut',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          once: true,
        },
        onStart: () => heading.classList.add('revealed')
      });
    });
  }

  // ——— About Section ———
  function initAboutAnimations() {
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
      ScrollTrigger.create({
        trigger: aboutText,
        start: 'top 80%',
        once: true,
        onEnter: () => aboutText.classList.add('revealed')
      });

      // Word-by-word highlight on scroll
      aboutText.querySelectorAll('p').forEach(p => {
        const words = p.textContent.split(' ');
        p.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
      });

      const allWords = aboutText.querySelectorAll('.word');
      ScrollTrigger.create({
        trigger: aboutText,
        start: 'top 70%',
        end: 'bottom 30%',
        onUpdate: (self) => {
          const progress = self.progress;
          const revealCount = Math.floor(progress * allWords.length);
          allWords.forEach((w, i) => {
            w.classList.toggle('highlighted', i < revealCount);
          });
        }
      });
    }

    // Stat cards — 3D flip entrance
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          setTimeout(() => {
            card.classList.add('revealed');
            const counter = card.querySelector('[data-counter]');
            if (counter) animateCounter(counter);
          }, i * 150);
        }
      });
    });
  }

  // ——— Counter Animation ———
  function animateCounter(el) {
    const target = parseInt(el.dataset.counter);
    const duration = 1500;
    const start = performance.now();
    
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ——— Skills Section ———
  function initSkillsAnimations() {
    const categories = document.querySelectorAll('.skill-category');
    
    // Proximity activation for skill blinking
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) {
      document.addEventListener('mousemove', (e) => {
        categories.forEach(cat => {
          const rect = cat.getBoundingClientRect();
          // Distance from cursor to the bounding box of the category
          const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
          const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 150) {
            cat.classList.add('proximity-active');
          } else {
            cat.classList.remove('proximity-active');
          }
        });
      });
    }

    categories.forEach((cat, catIdx) => {
      ScrollTrigger.create({
        trigger: cat,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(cat, {
            opacity: 1, y: 0,
            duration: 0.8,
            ease: 'expo.out',
            delay: catIdx * 0.1,
            onComplete: () => cat.classList.add('revealed')
          });
          
          const tags = cat.querySelectorAll('.skill-tag');
          tags.forEach((tag, tagIdx) => {
            setTimeout(() => tag.classList.add('revealed'), catIdx * 100 + tagIdx * 50 + 200);
          });
        }
      });
    });
  }

  // ——— Projects Section ———
  function initProjectAnimations() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
          onEnter: () => card.classList.add('revealed')
        },
        delay: i * 0.1
      });

      // Pipeline stage sequential glow (Continuous Loop)
      ScrollTrigger.create({
        trigger: card,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const stages = card.querySelectorAll('.pipeline-stage');
          if (!stages.length) return;
          
          function runLoop() {
            stages.forEach((stage, si) => {
              setTimeout(() => {
                stage.classList.add('active');
                setTimeout(() => stage.classList.remove('active'), 800);
              }, si * 300);
            });
            
            // Restart loop after all stages complete plus a small pause
            setTimeout(runLoop, stages.length * 300 + 1200);
          }
          
          runLoop();
        }
      });
    });

    initTiltEffect();
  }

  // ——— 3D Tilt Effect ———
  function initTiltEffect() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * 6;
        const tiltY = (x - 0.5) * 6;
        
        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        el.style.setProperty('--holo-angle', `${Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI)}deg`);
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    });
  }

  // ——— Achievements Section ———
  function initAchievementAnimations() {
    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
      ScrollTrigger.create({
        trigger: '.achievements-timeline',
        start: 'top 80%',
        once: true,
        onEnter: () => timelineLine.classList.add('drawn')
      });
    }

    document.querySelectorAll('.achievement-item').forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          setTimeout(() => item.classList.add('revealed'), i * 200);
        }
      });
    });
  }

  // ——— Certifications Section ———
  function initCertificationAnimations() {
    // Cert intro counter
    const certCount = document.querySelector('.cert-intro .cert-count[data-counter]');
    if (certCount) {
      ScrollTrigger.create({
        trigger: certCount,
        start: 'top 85%',
        once: true,
        onEnter: () => animateCounter(certCount)
      });
    }

    // Staggered cert card reveals
    const certCards = document.querySelectorAll('.cert-card');
    certCards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          setTimeout(() => {
            card.classList.add('revealed');
          }, i * 100);
        }
      });
    });
  }

  // ——— Education Section ———
  function initEducationAnimations() {
    const cards = document.querySelectorAll('.education-card');
    cards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          setTimeout(() => {
            card.classList.add('revealed');
          }, i * 200);
        }
      });
    });
  }

  // ——— Contact Section ———
  function initContactAnimations() {
    const terminal = document.querySelector('.contact-terminal');
    if (terminal) {
      ScrollTrigger.create({
        trigger: terminal,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          terminal.classList.add('revealed');
          typeTerminalLines('.contact-terminal .terminal-line');
        }
      });
    }

    // Contact form reveal
    const formWrapper = document.querySelector('.contact-form-wrapper');
    if (formWrapper) {
      ScrollTrigger.create({
        trigger: formWrapper,
        start: 'top 85%',
        once: true,
        onEnter: () => formWrapper.classList.add('revealed')
      });
    }

    const socials = document.querySelector('.social-links');
    if (socials) {
      ScrollTrigger.create({
        trigger: socials,
        start: 'top 85%',
        once: true,
        onEnter: () => socials.classList.add('revealed')
      });
    }
  }

  // ——— Scroll Progress Bar ———
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      }
    });
  }

  // ——— Nav Scroll ———
  function initNavAnimations() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        navbar.classList.toggle('scrolled', self.scroll() > 80);
      }
    });

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateActiveNav(section.id, navLinks),
        onEnterBack: () => updateActiveNav(section.id, navLinks),
      });
    });
  }

  function updateActiveNav(sectionId, links) {
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });
  }

  // ——— Parallax Background ———
  function initBackgroundParallax() {
    gsap.to('.glow-orb-1', {
      y: -120,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 1 }
    });

    gsap.to('.glow-orb-2', {
      y: 180,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 1.5 }
    });

    gsap.to('.dot-grid', {
      y: 100,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 2 }
    });
  }

  // ——— Init ———
  function init() {
    initHeroAnimations();
    initHeadingAnimations();
    initAboutAnimations();
    initSkillsAnimations();
    initProjectAnimations();
    initAchievementAnimations();
    initCertificationAnimations();
    initEducationAnimations();
    initContactAnimations();
    initScrollProgress();
    initNavAnimations();
    initBackgroundParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
