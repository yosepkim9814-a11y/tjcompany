
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

(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('tj-lang') || 'ko';
  function applyLang(lang){
    root.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-lang-btn]').forEach(btn=>btn.classList.toggle('active', btn.getAttribute('data-lang-btn')===lang));
    localStorage.setItem('tj-lang', lang);
  }
  document.addEventListener('click', function(e){
    const btn=e.target.closest('[data-lang-btn]');
    if(btn){ applyLang(btn.getAttribute('data-lang-btn')); }
  });
  applyLang(saved);
  document.querySelectorAll('[data-slider]').forEach(function(slider){
    const track=slider.querySelector('[data-slider-track]');
    const slides=Array.from(slider.querySelectorAll('[data-slide]'));
    const dotsWrap=slider.querySelector('[data-slider-dots]');
    let index=0;
    if(!track || !slides.length) return;
    function renderDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML='';
      slides.forEach(function(_,i){
        const b=document.createElement('button'); b.type='button';
        if(i===index) b.classList.add('active');
        b.addEventListener('click',()=>go(i));
        dotsWrap.appendChild(b);
      });
    }
    function go(i){ index=(i+slides.length)%slides.length; track.style.transform='translateX(' + (-100*index) + '%)'; renderDots(); }
    const prev=slider.querySelector('[data-prev]'); const next=slider.querySelector('[data-next]');
    if(prev) prev.addEventListener('click',()=>go(index-1));
    if(next) next.addEventListener('click',()=>go(index+1));
    go(0);
  });
})();
