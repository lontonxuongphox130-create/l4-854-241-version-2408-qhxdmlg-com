(function(){
  function q(sel, root){ return (root||document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  qa('[data-mobile-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var nav = q('[data-mobile-nav]');
      if(nav) nav.classList.toggle('is-open');
    });
  });

  qa('[data-fallback-img]').forEach(function(img){
    img.addEventListener('error', function(){
      var frame = img.closest('.poster-frame') || img.parentElement;
      if(frame) frame.classList.add('poster-missing');
      img.style.display = 'none';
    }, {once:true});
  });

  qa('[data-hero-slider]').forEach(function(slider){
    var slides = qa('.hero-slide', slider);
    var dots = qa('[data-hero-dot]', slider);
    var idx = 0;
    if(!slides.length) return;
    function show(next){
      idx = (next + slides.length) % slides.length;
      slides.forEach(function(s,i){ s.classList.toggle('is-active', i===idx); });
      dots.forEach(function(d,i){ d.classList.toggle('is-active', i===idx); });
    }
    var timer = setInterval(function(){ show(idx+1); }, 5200);
    function restart(){ clearInterval(timer); timer = setInterval(function(){ show(idx+1); }, 5200); }
    qa('[data-hero-next]', slider).forEach(function(btn){ btn.addEventListener('click', function(){ show(idx+1); restart(); }); });
    qa('[data-hero-prev]', slider).forEach(function(btn){ btn.addEventListener('click', function(){ show(idx-1); restart(); }); });
    dots.forEach(function(dot,i){ dot.addEventListener('click', function(){ show(i); restart(); }); });
    show(0);
  });

  function setupFilters(root){
    var input = q('[data-filter-input]', root), region = q('[data-filter-region]', root), type = q('[data-filter-type]', root), year = q('[data-filter-year]', root), reset = q('[data-filter-reset]', root), count = q('[data-filter-count]', root);
    var cards = qa('[data-card]', root);
    var no = q('[data-no-results]', root);
    if(!cards.length || (!input && !region && !type && !year)) return;

    try{
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');
      if(queryFromUrl && input && !input.value){ input.value = queryFromUrl; }
    }catch(e){}
    function val(el){ return el ? String(el.value || '').trim().toLowerCase() : ''; }
    function run(){
      var kw = val(input), rg = val(region), tp = val(type), yr = val(year);
      var shown = 0;
      cards.forEach(function(card){
        var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
        var ok = true;
        if(kw && hay.indexOf(kw) === -1) ok = false;
        if(rg && String(card.dataset.region||'').toLowerCase() !== rg) ok = false;
        if(tp && String(card.dataset.type||'').toLowerCase().indexOf(tp) === -1) ok = false;
        if(yr && String(card.dataset.year||'').toLowerCase().indexOf(yr) === -1) ok = false;
        card.classList.toggle('hidden-by-filter', !ok);
        if(ok) shown++;
      });
      if(count) count.textContent = shown;
      if(no) no.classList.toggle('is-visible', shown === 0);
    }
    [input, region, type, year].forEach(function(el){ if(el){ el.addEventListener('input', run); el.addEventListener('change', run); }});
    if(reset) reset.addEventListener('click', function(){ [input, region, type, year].forEach(function(el){ if(el) el.value=''; }); run(); });
    run();
  }
  setupFilters(document);

  var back = q('[data-back-top]');
  if(back){
    window.addEventListener('scroll', function(){ back.classList.toggle('is-visible', window.scrollY > 420); });
    back.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  }

  function playVideo(shell){
    var video = q('video', shell);
    var cover = q('.player-cover', shell);
    var src = shell.getAttribute('data-src');
    if(!video || !src) return;
    if(cover) cover.classList.add('is-hidden');
    var started = false;
    function safePlay(){
      if(started) return; started = true;
      var p = video.play();
      if(p && p.catch) p.catch(function(){ video.controls = true; });
    }
    if(window.Hls && window.Hls.isSupported()){
      var hls = new Hls({enableWorker:true, lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, safePlay);
      hls.on(Hls.Events.ERROR, function(_, data){
        if(data && data.fatal){ try{ hls.destroy(); }catch(e){} video.src = src; safePlay(); }
      });
    } else {
      video.src = src;
      safePlay();
    }
  }
  qa('[data-player]').forEach(function(shell){
    var cover = q('.player-cover', shell);
    if(cover){ cover.addEventListener('click', function(){ playVideo(shell); }); }
  });
})();
