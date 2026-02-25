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

/* ===== v12: robust lightbox close ===== */
(function(){
  const lb = document.querySelector('[data-lightbox]');
  if(!lb) return;
  const img = lb.querySelector('img');
  const closeBtn = lb.querySelector('[data-lightbox-close]');

  function open(src, alt){
    if(!img) return;
    img.src = src;
    img.alt = alt || '';
    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('open');
    if(img) img.src = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // Event delegation: any click on [data-open-lightbox]
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('[data-open-lightbox]');
    if(a){
      e.preventDefault();
      const src = a.getAttribute('data-src') || a.getAttribute('href');
      const alt = a.getAttribute('data-alt') || a.getAttribute('aria-label') || '';
      open(src, alt);
      return;
    }
  });

  // Close by X
  if(closeBtn){
    closeBtn.addEventListener('click', (e)=>{ e.preventDefault(); close(); });
  }

  // Close by clicking backdrop (not the frame/image)
  lb.addEventListener('click', (e)=>{
    if(e.target === lb) close();
  });

  // ESC closes
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && lb.classList.contains('open')) close();
  });
})();


/* ===== v12: lookbook autoplay (one-by-one) ===== */
(function(){
  const look = document.querySelector('[data-lookbook]');
  if(!look) return;
  const track = look.querySelector('[data-track]');
  const slides = track ? Array.from(look.querySelectorAll('[data-slide]')) : [];
  const prev = look.querySelector('[data-prev]');
  const next = look.querySelector('[data-next]');
  const dotsWrap = look.querySelector('[data-dots]');
  const intervalMs = parseInt(look.getAttribute('data-autoplay'),10) || 5500;

  if(!track || slides.length === 0) return;

  let idx = 0;
  let timer = null;

  if(dotsWrap && dotsWrap.childElementCount === 0){
    slides.forEach((_,i)=>{
      const d = document.createElement('div');
      d.className = 'dot' + (i===0 ? ' on' : '');
      d.addEventListener('click', ()=>go(i,true));
      dotsWrap.appendChild(d);
    });
  }

  function updateDots(){
    if(!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((el,i)=> el.classList.toggle('on', i===idx));
  }

  function go(i, user=false){
    idx = (i + slides.length) % slides.length;
    const w = look.clientWidth;
    track.scrollTo({left: idx * w, behavior:'smooth'});
    updateDots();
    if(user) stop();
  }

  function start(){
    if(timer) return;
    timer = setInterval(()=>go(idx+1,false), intervalMs);
  }
  function stop(){
    if(timer){ clearInterval(timer); timer=null; }
  }

  prev && prev.addEventListener('click', (e)=>{e.preventDefault(); go(idx-1,true);});
  next && next.addEventListener('click', (e)=>{e.preventDefault(); go(idx+1,true);});

  look.addEventListener('mouseenter', stop);
  look.addEventListener('mouseleave', start);
  look.addEventListener('focusin', stop);
  look.addEventListener('focusout', start);
  track.addEventListener('wheel', stop, {passive:true});
  track.addEventListener('touchstart', stop, {passive:true});
  look.addEventListener('pointerdown', stop, {passive:true});
  window.addEventListener('resize', ()=>go(idx,false));

  start();
})();


/* ===== v14: ensure slider arrows work (lookbook) ===== */
(function(){
  document.querySelectorAll('.lookbook').forEach(slider=>{
    const track = slider.querySelector('[data-track], .sliderTrack');
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    if(!track || !prev || !next) return;

    const page = ()=>slider.clientWidth;

    prev.addEventListener('click', (e)=>{
      e.preventDefault();
      track.scrollBy({left: -page(), behavior:'smooth'});
    });
    next.addEventListener('click', (e)=>{
      e.preventDefault();
      track.scrollBy({left:  page(), behavior:'smooth'});
    });
  });
})();
