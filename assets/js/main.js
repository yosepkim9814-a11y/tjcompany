(function(){
  // Mobile menu toggle
  const btn = document.querySelector('[data-menu-btn]');
  const mobile = document.querySelector('[data-mobile-nav]');
  if(btn && mobile){
    btn.addEventListener('click', ()=> mobile.classList.toggle('open'));
  }

  // Active nav highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav] a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });

  // ---------- Lightbox (auto-create) ----------
  let lb = document.querySelector('.lightbox');
  if(!lb){
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <div class="lightboxInner">
        <button class="lightboxClose" type="button" aria-label="Close">×</button>
        <img alt="" />
      </div>`;
    document.body.appendChild(lb);
  }
  const lbImg = lb.querySelector('img');
  const lbClose = lb.querySelector('.lightboxClose');

  function openLightbox(src, title){
    if(!src) return;
    lbImg.src = src;
    lbImg.alt = title || '';
    lb.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeLightbox(){
    lb.classList.remove('open');
    document.body.style.overflow='';
  }

  // legacy (data-lb-src) + new (data-lightbox + data-src)
  document.querySelectorAll('[data-lb-src]').forEach(el=>{
    el.addEventListener('click', ()=>{
      openLightbox(el.getAttribute('data-lb-src'), el.getAttribute('data-lb-title'));
    });
  });
  document.querySelectorAll('[data-lightbox][data-src]').forEach(el=>{
    el.addEventListener('click', ()=>{
      openLightbox(el.getAttribute('data-src'), el.getAttribute('data-title'));
    });
  });

  if(lbClose) lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });

  // ---------- Generic sliders ----------
  function scrollByCard(track, dir){
    const first = track.querySelector('.slide');
    const amount = first ? (first.getBoundingClientRect().width + 12) : (track.clientWidth * 0.9);
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-slide-prev]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const track = btn.parentElement?.querySelector('.sliderTrack');
      if(track) scrollByCard(track, -1);
    });
  });
  document.querySelectorAll('[data-slide-next]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const track = btn.parentElement?.querySelector('.sliderTrack');
      if(track) scrollByCard(track, 1);
    });
  });

  // ---------- Lookbook dots (if present) ----------
  const track = document.querySelector('[data-slider-track]');
  if(track){
    const slides = Array.from(track.querySelectorAll('[data-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-dot]'));
    const prev = document.querySelector('[data-slider-prev]');
    const next = document.querySelector('[data-slider-next]');

    function setActive(i){ dots.forEach((d,idx)=> d.classList.toggle('active', idx===i)); }
    function currentIndex(){
      if(slides.length === 0) return 0;
      const slideW = slides[0].getBoundingClientRect().width + 14;
      return Math.round(track.scrollLeft / slideW);
    }
    function go(i){
      if(slides.length === 0) return;
      const slideW = slides[0].getBoundingClientRect().width + 14;
      track.scrollTo({left: slideW*i, behavior:'smooth'});
      setActive(i);
    }
    track.addEventListener('scroll', ()=> setActive(currentIndex()));
    if(prev) prev.addEventListener('click', ()=> go(Math.max(0, currentIndex()-1)));
    if(next) next.addEventListener('click', ()=> go(Math.min(slides.length-1, currentIndex()+1)));
    dots.forEach((d,idx)=> d.addEventListener('click', ()=> go(idx)));
    setActive(0);
  }

  // Footer year
  const y = document.getElementById('y');
  if(y) y.textContent = new Date().getFullYear();
})();

/* ===== v8: lightbox + sliders ===== */
(function(){
  const lb = document.querySelector('[data-lightbox]');
  const lbImg = lb ? lb.querySelector('img') : null;
  const lbClose = lb ? lb.querySelector('[data-lightbox-close]') : null;

  function openLightbox(src, alt){
    if(!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    if(!lb || !lbImg) return;
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-lightbox]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      e.preventDefault();
      const src = el.getAttribute('data-src') || el.getAttribute('href');
      const alt = el.getAttribute('data-alt') || el.getAttribute('aria-label') || '';
      openLightbox(src, alt);
    });
  });

  if(lb){
    lb.addEventListener('click', (e)=>{
      // clicking backdrop closes
      if(e.target === lb) closeLightbox();
    });
  }
  if(lbClose){
    lbClose.addEventListener('click', (e)=>{
      e.preventDefault();
      closeLightbox();
    });
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeLightbox();
  });

  // Slider buttons: scroll container by width
  document.querySelectorAll('[data-slider]').forEach(slider=>{
    const track = slider.querySelector('[data-track]');
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    if(!track) return;

    const scrollByPage = (dir)=>{
      const w = track.clientWidth;
      track.scrollBy({left: dir * w, behavior:'smooth'});
    };
    prev && prev.addEventListener('click', ()=>scrollByPage(-1));
    next && next.addEventListener('click', ()=>scrollByPage( 1));
  });
})();



/* ===== v10: slider autoplay ===== */
(function(){
  document.querySelectorAll('[data-slider][data-autoplay]').forEach(slider=>{
    const track = slider.querySelector('[data-track]');
    if(!track) return;

    const intervalMs = parseInt(slider.getAttribute('data-autoplay'), 10) || 5500;
    let timer = null;
    let userInteracted = false;

    const getNextScrollLeft = ()=>{
      const w = track.clientWidth;
      const maxScroll = track.scrollWidth - track.clientWidth;
      // If near end, go to start
      if(track.scrollLeft >= maxScroll - 5) return 0;
      return Math.min(track.scrollLeft + w, maxScroll);
    };

    const tick = ()=>{
      if(userInteracted) return;
      track.scrollTo({left: getNextScrollLeft(), behavior:'smooth'});
    };

    const start = ()=>{
      if(timer) return;
      timer = setInterval(tick, intervalMs);
    };
    const stop = ()=>{
      if(timer){
        clearInterval(timer);
        timer = null;
      }
    };

    // pause on hover/focus
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    // if user clicks arrows or scrolls manually, stop autoplay
    slider.addEventListener('pointerdown', ()=>{ userInteracted = true; stop(); }, {passive:true});
    track.addEventListener('wheel', ()=>{ userInteracted = true; stop(); }, {passive:true});
    track.addEventListener('touchstart', ()=>{ userInteracted = true; stop(); }, {passive:true});

    start();
  });
})();
