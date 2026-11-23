
(function(){
  var el=document.getElementById('verBadge'); if(!el) return;
  function paint(v){ if(v){ el.textContent='v'+String(v).replace(/^v/,''); } }
  function fromCache(){
    if(!('caches' in window)){ paint('?'); return; }
    caches.keys().then(function(keys){
      var hit=null; for(var i=0;i<keys.length;i++){ var m=keys[i].match(/fakao-(v\d+)-/); if(m && (!hit || +m[1].slice(1) > +hit.slice(1))){ hit=m[1]; } }
      paint(hit || '?');
    }).catch(function(){ paint('?'); });
  }
  // 以线上 sw.js 为准，避免旧缓存把角标误显示成旧版本；离线时再回退到本地缓存。
  (window.__fkSwVersion ? window.__fkSwVersion() : fetch('./sw.js',{cache:'no-store'}).then(function(r){return r.text();}).then(function(t){var m=t.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);return m?m[1]:null;}))
      .then(function(v){ var mm=v&&String(v).match(/fakao-(v\d+)/); if(mm){ paint(mm[1]); } else { fromCache(); } }).catch(fromCache);
})();
