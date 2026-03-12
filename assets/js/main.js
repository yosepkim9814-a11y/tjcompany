
(function(){
  const menuBtn = document.querySelector('[data-menu-btn]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if(menuBtn && mobileNav){
    menuBtn.addEventListener('click', function(){
      const isOpen = mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        mobileNav.classList.remove('open');
        document.body.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav] a').forEach(function(link){
    const href = link.getAttribute('href');
    if(href === current){
      link.classList.add('active');
    }
  });

  const year = document.getElementById('year');
  if(year){
    year.textContent = new Date().getFullYear();
  }

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = lightbox ? lightbox.querySelector('[data-lightbox-img]') : null;
  const lightboxTitle = lightbox ? lightbox.querySelector('[data-lightbox-title]') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;

  function openLightbox(src, title){
    if(!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = title || '';
    if(lightboxTitle){
      lightboxTitle.textContent = title || '';
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    if(!lightbox || !lightboxImg) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function(){
      lightboxImg.src = '';
      lightboxImg.alt = '';
      if(lightboxTitle){
        lightboxTitle.textContent = '';
      }
    }, 120);
  }

  document.addEventListener('click', function(event){
    const trigger = event.target.closest('[data-open-lightbox]');
    if(trigger){
      event.preventDefault();
      const src = trigger.getAttribute('data-src') || trigger.getAttribute('href');
      const title = trigger.getAttribute('data-title') || trigger.getAttribute('aria-label') || '';
      openLightbox(src, title);
      return;
    }

    if(lightbox && event.target === lightbox){
      closeLightbox();
    }
  });

  if(lightboxClose){
    lightboxClose.addEventListener('click', function(){
      closeLightbox();
    });
  }

  document.addEventListener('keydown', function(event){
    if(event.key === 'Escape'){
      closeLightbox();
    }
  });
})();
