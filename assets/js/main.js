(function(){
  const btn = document.querySelector('[data-menu-btn]');
  const mobile = document.querySelector('[data-mobile-nav]');
  if(btn && mobile){
    btn.addEventListener('click', ()=>{
      mobile.classList.toggle('open');
    });
  }

  // active nav highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll(`[data-nav] a`).forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });
})();
