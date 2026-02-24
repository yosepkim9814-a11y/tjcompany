(function(){
  const btn = document.querySelector('[data-menu-btn]');
  const mobile = document.querySelector('[data-mobile-nav]');
  if(btn && mobile){
    btn.addEventListener('click', ()=> mobile.classList.toggle('open'));
  }

  // active nav highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll(`[data-nav] a`).forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });

  // Lightbox for product galleries
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
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLightbox(); });

  const y = document.getElementById('y');
  if(y) y.textContent = new Date().getFullYear();
})();