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

  // Hover: EN -> KO label
  document.querySelectorAll('[data-nav] a').forEach(a=>{
    const en = a.querySelector('.nav-en');
    const ko = a.querySelector('.nav-ko');
    if(!en || !ko) return;
    a.addEventListener('mouseenter', ()=>{ en.style.display='none'; ko.style.display='inline'; });
    a.addEventListener('mouseleave', ()=>{ en.style.display='inline'; ko.style.display='none'; });
    // default: show EN
    en.style.display='inline'; ko.style.display='none';
  });

  // Lightbox (shared for products / about galleries)
  const lb = document.querySelector('[data-lightbox]');
  const lbImg = document.querySelector('[data-lightbox-img]');
  const lbTitle = document.querySelector('[data-lightbox-title]');
  const closeBtn = document.querySelector('[data-lightbox-close]');

  function openLightbox(src, title){
    if(!lb || !lbImg) return;
    lbImg.src = src;
    if(lbTitle) lbTitle.textContent = title || '';
    lb.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeLightbox(){
    if(!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow='';
  }

  document.querySelectorAll('[data-lb-src]').forEach(el=>{
    el.addEventListener('click', ()=>{
      openLightbox(el.getAttribute('data-lb-src'), el.getAttribute('data-lb-title'));
    });
  });
  if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if(lb) lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });

  // Lookbook slider
  const track = document.querySelector('[data-slider-track]');
  if(track){
    const slides = Array.from(track.querySelectorAll('[data-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-dot]'));
    const prev = document.querySelector('[data-slider-prev]');
    const next = document.querySelector('[data-slider-next]');

    function setActive(i){ dots.forEach((d,idx)=> d.classList.toggle('active', idx===i)); }
    function currentIndex(){ const w = track.clientWidth || 1; return Math.round(track.scrollLeft / w); }
    function go(i){
      const w = track.clientWidth || 1;
      track.scrollTo({left: w*i, behavior:'smooth'});
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