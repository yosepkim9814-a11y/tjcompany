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


/* ===== v13: fix nav lag (lightbox) + safer close ===== */
(function(){
  if(window.__TJ_LIGHTBOX_V13) return;
  window.__TJ_LIGHTBOX_V13 = true;

  const lb = document.querySelector('[data-lightbox]');
  if(!lb) return;
  const img = lb.querySelector('img');
  const closeBtn = lb.querySelector('[data-lightbox-close]');

  function lockScroll(on){
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
  }

  function open(src, alt){
    if(!img) return;
    img.src = src;
    img.alt = alt || '';
    lb.classList.add('open');
    lockScroll(true);
  }

  function close(){
    lb.classList.remove('open');
    lockScroll(false);
    setTimeout(()=>{ if(img) img.src=''; }, 120);
  }

  // capture-phase delegation to avoid conflicts
  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-open-lightbox]');
    if(opener){
      e.preventDefault();
      const src = opener.getAttribute('data-src') || opener.getAttribute('href');
      const alt = opener.getAttribute('data-alt') || opener.getAttribute('aria-label') || '';
      open(src, alt);
      return;
    }
    if(lb.classList.contains('open') && e.target === lb){
      e.preventDefault();
      close();
      return;
    }
  }, true);

  if(closeBtn){
    closeBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      close();
    }, true);
  }

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && lb.classList.contains('open')) close();
  });

  window.addEventListener('hashchange', ()=>lockScroll(false));
})();

/* ===== v16 lightbox: use full-res src + prevent click block ===== */
(function(){
  if(window.__TJ_LB_V16) return; window.__TJ_LB_V16 = true;
  const lb = document.querySelector('[data-lightbox]');
  if(!lb) return;
  const img = lb.querySelector('img');
  const closeBtn = lb.querySelector('[data-lightbox-close]');
  const lock = (on)=>{document.documentElement.style.overflow = on?'hidden':''; document.body.style.overflow = on?'hidden':'';};

  function open(src, alt){
    if(!img) return;
    img.src = src; img.alt = alt || '';
    lb.classList.add('open'); lock(true);
  }
  function close(){
    lb.classList.remove('open'); lock(false);
    setTimeout(()=>{ if(img) img.src=''; }, 120);
  }

  document.addEventListener('click', (e)=>{
    const opener = e.target.closest('[data-open-lightbox]');
    if(opener){
      e.preventDefault();
      const src = opener.getAttribute('data-src-full') || opener.getAttribute('data-src') || opener.getAttribute('href');
      const alt = opener.getAttribute('data-alt') || opener.getAttribute('aria-label') || '';
      open(src, alt); return;
    }
    if(lb.classList.contains('open') && e.target === lb){ e.preventDefault(); close(); return; }
  }, true);

  if(closeBtn){
    closeBtn.addEventListener('click', (e)=>{e.preventDefault(); e.stopPropagation(); close();}, true);
  }
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && lb.classList.contains('open')) close(); });
  window.addEventListener('hashchange', ()=>lock(false));
})();


/* ===== v17: force unlock navigation on production ===== */
(function(){
  function unlock(){
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    const lb = document.querySelector('[data-lightbox]');
    if(lb) lb.classList.remove('open');
  }
  window.addEventListener('pageshow', unlock);
  document.addEventListener('DOMContentLoaded', unlock);

  // If some invisible element covers the header, make it non-interactive.
  document.addEventListener('DOMContentLoaded', ()=>{
    const header = document.querySelector('.header');
    if(!header) return;
    const r = header.getBoundingClientRect();
    const x = Math.min(window.innerWidth-5, Math.max(5, r.left + 40));
    const y = Math.min(window.innerHeight-5, Math.max(5, r.top + 20));
    const el = document.elementFromPoint(x, y);
    if(el && !header.contains(el)){
      // don't break legitimate header overlays; only if it's a big fixed layer
      const st = window.getComputedStyle(el);
      if(st.position === 'fixed' && parseInt(st.zIndex || '0',10) >= 1000){
        el.style.pointerEvents = 'none';
      }
    }
  });
})();

/* ===== v18 nav unblocker: remove invisible overlay that eats clicks ===== */
(function(){
  function unblock(){
    const header = document.querySelector('.header');
    if(!header) return;
    const y = 22;
    const xs = [60, 220, 420, 620, 820, 980, 1120].map(x=>Math.min(window.innerWidth-5, x));
    xs.forEach(x=>{
      const el = document.elementFromPoint(x, y);
      if(!el) return;
      if(header.contains(el)) return;
      const st = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const big = (r.width > window.innerWidth*0.6 && r.height > 40);
      const fixedish = (st.position === 'fixed' || st.position === 'absolute');
      if(fixedish && big){
        el.style.pointerEvents = 'none';
      }
    });
  }
  window.addEventListener('DOMContentLoaded', unblock);
  window.addEventListener('load', unblock);
  window.addEventListener('resize', unblock);
  document.addEventListener('click', ()=>setTimeout(unblock, 0), true);
})();



/* ===== v20: disable lookbook autoplay when data-autoplay is 0 ===== */
(function(){
  const look = document.querySelector('[data-lookbook]');
  if(!look) return;
  const v = parseInt(look.getAttribute('data-autoplay')||'0',10);
  if(v <= 0){
    // No autoplay; swipe only
    look.setAttribute('data-autoplay-disabled','1');
  }
})();
