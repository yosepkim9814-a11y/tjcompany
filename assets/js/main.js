
(function () {
  const root = document.documentElement;
  const storageKey = 'tj-lang';
  let currentLang = 'ko';

  function safeGetLang() {
    try {
      return localStorage.getItem(storageKey) || root.getAttribute('data-lang') || 'ko';
    } catch (e) {
      return root.getAttribute('data-lang') || 'ko';
    }
  }

  function safeSetLang(lang) {
    try {
      localStorage.setItem(storageKey, lang);
    } catch (e) {}
  }

  function applyDataAttributes(lang) {
    document.querySelectorAll('[data-placeholder-ko]').forEach(function (el) {
      const value = lang === 'en' ? el.getAttribute('data-placeholder-en') : el.getAttribute('data-placeholder-ko');
      if (value) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-text-ko]').forEach(function (el) {
      const value = lang === 'en' ? el.getAttribute('data-text-en') : el.getAttribute('data-text-ko');
      if (value !== null) el.textContent = value;
    });

    document.querySelectorAll('[data-html-ko]').forEach(function (el) {
      const value = lang === 'en' ? el.getAttribute('data-html-en') : el.getAttribute('data-html-ko');
      if (value !== null) el.innerHTML = value;
    });

    document.querySelectorAll('[data-aria-ko]').forEach(function (el) {
      const value = lang === 'en' ? el.getAttribute('data-aria-en') : el.getAttribute('data-aria-ko');
      if (value) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-title-ko]').forEach(function (el) {
      const value = lang === 'en' ? el.getAttribute('data-title-en') : el.getAttribute('data-title-ko');
      if (value && el.hasAttribute('title')) el.setAttribute('title', value);
    });
  }

  function applyLang(lang) {
    currentLang = lang === 'en' ? 'en' : 'ko';
    root.setAttribute('data-lang', currentLang);
    root.setAttribute('lang', currentLang);
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === currentLang);
    });
    applyDataAttributes(currentLang);
    safeSetLang(currentLang);
  }

  const menuBtn = document.querySelector('[data-menu-btn]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        document.body.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav] a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = lightbox ? lightbox.querySelector('[data-lightbox-img]') : null;
  const lightboxTitle = lightbox ? lightbox.querySelector('[data-lightbox-title]') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;

  function getLangTitle(el) {
    return currentLang === 'en'
      ? (el.getAttribute('data-title-en') || el.getAttribute('data-title') || '')
      : (el.getAttribute('data-title-ko') || el.getAttribute('data-title') || '');
  }

  function openLightbox(src, title) {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = title || '';
    if (lightboxTitle) lightboxTitle.textContent = title || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () {
      lightboxImg.src = '';
      lightboxImg.alt = '';
      if (lightboxTitle) lightboxTitle.textContent = '';
    }, 120);
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-open-lightbox]');
    if (trigger) {
      event.preventDefault();
      const src = trigger.getAttribute('data-src') || trigger.getAttribute('href');
      openLightbox(src, getLangTitle(trigger));
      return;
    }

    const langBtn = event.target.closest('[data-lang-btn]');
    if (langBtn) {
      applyLang(langBtn.getAttribute('data-lang-btn'));
      return;
    }

    if (lightbox && event.target === lightbox) closeLightbox();
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeLightbox();
  });

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const track = slider.querySelector('[data-slider-track]');
    const slides = Array.from(slider.querySelectorAll('[data-slide]'));
    const dotsWrap = slider.querySelector('[data-slider-dots]');
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    let index = 0;

    if (!track || !slides.length) return;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, i) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        btn.classList.toggle('active', i === index);
        btn.addEventListener('click', function () {
          go(i);
        });
        dotsWrap.appendChild(btn);
      });
    }

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      renderDots();
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', function (event) {
      touchEndX = event.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) < 40) return;
      if (delta < 0) go(index + 1);
      if (delta > 0) go(index - 1);
    }, { passive: true });

    go(0);
  });

  applyLang(safeGetLang());
})();
