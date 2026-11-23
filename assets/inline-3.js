
  // P2-22：法考客观题按「9 月第三个周六 09:00」推算（具体以司法部官方公告为准）。
  // 全局函数声明：开屏脚本与主脚本（renderHeroCountdown）共用，不硬编码年份。
  function getThirdSaturdayOfSeptember(year){
    var first=new Date(year,8,1,9,0,0,0);
    var offset=(6-first.getDay()+7)%7;           // 9 月 1 日到第一个周六的天数
    return new Date(year,8,1+offset+14,9,0,0,0);  // 第一个周六 + 14 天 = 第三个周六
  }
  function getNextExamDate(now){
    var ref=(now instanceof Date)?now:new Date(typeof now==='number'?now:Date.now());
    var exam=getThirdSaturdayOfSeptember(ref.getFullYear());
    if(ref.getTime()>=exam.getTime()) exam=getThirdSaturdayOfSeptember(ref.getFullYear()+1); // 今年已开考 → 取次年
    return exam;
  }
  function getPrevExamDate(next){
    var n=(next instanceof Date)?next:getNextExamDate();
    return getThirdSaturdayOfSeptember(n.getFullYear()-1);
  }
  (function(){
    // 开屏：每次完整打开 index.html（含 Electron 启动 / 刷新）都会显示；点按任意处或 3 秒后淡出。
    var overlay=document.getElementById('splashCover');
    if(!overlay) return;
    var canvas=document.getElementById('splashCoverCanvas'), ctx=canvas.getContext('2d');
    var CYCLE=4.8;
    var BLOBS=[
      {c:'#b23a5b',x:.24,y:.24,r:.55,ax:.10,ay:.10,ph:0.0},
      {c:'#e8a6b8',x:.80,y:.18,r:.50,ax:.09,ay:.11,ph:2.1},
      {c:'#c89b3c',x:.74,y:.74,r:.56,ax:.12,ay:.10,ph:4.2},
      {c:'#ead3a0',x:.20,y:.80,r:.52,ax:.08,ay:.11,ph:1.0}
    ];
    var W=0,H=0,dpr=1;
    function resize(){ dpr=Math.min(window.devicePixelRatio||1,2); W=Math.max(1,window.innerWidth); H=Math.max(1,window.innerHeight); canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr); }
    function draw(u){ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.fillStyle='#f8efe6'; ctx.fillRect(0,0,W,H); var a=2*Math.PI*u/CYCLE, R=Math.max(W,H); for(var i=0;i<BLOBS.length;i++){ var b=BLOBS[i]; var cx=(b.x+b.ax*Math.cos(a+b.ph))*W; var cy=(b.y+b.ay*Math.sin(a+b.ph))*H; var rad=b.r*R; var g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad); g.addColorStop(0,b.c); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.globalAlpha=0.8; ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; } }
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resize();
    if(reduce){ draw(0.9); } else { var t0=performance.now(); (function loop(){ if(!document.body.contains(overlay)) return; draw(((performance.now()-t0)/1000)%CYCLE); requestAnimationFrame(loop); })(); }
    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ resize(); if(reduce) draw(0.9); },120); });
    // 倒计时（P2-22：下一次 9 月第三个周六 09:00，具体以官方公告为准）
    var cdD=document.getElementById('scCdDays');
    var examNext=getNextExamDate();
    var cdY=document.getElementById('scCdYear');
    if(cdY){ cdY.textContent=' '+examNext.getFullYear()+' '; }
    if(cdD){ var target=examNext.getTime(); cdD.textContent=Math.max(0,Math.ceil((target-Date.now())/86400000)); }
    // 关闭：淡出 600ms 后移除节点，并释放开屏 3D 的 WebGL 资源（P2-9）
    var closed=false;
    var releaseSplash3D=null; // initSplash3D 创建 renderer 后注册释放函数
    function close(){ if(closed) return; closed=true; document.removeEventListener('keydown',close); overlay.classList.add('sc-hide'); setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); if(releaseSplash3D){ var fn=releaseSplash3D; releaseSplash3D=null; try{ fn(); }catch(e){} } },600); }
    document.getElementById('splashEnter').addEventListener('click',function(e){ e.stopPropagation(); close(); });
    overlay.addEventListener('click',close);
    document.addEventListener('keydown',close);
    setTimeout(close,3000);
    // ── 开屏 3D：Blender 建模的天平+法槌（Three.js 动态加载，失败自动回退渐变）──
    function hideSplashModel(){ var m=document.getElementById('scModel'); if(m){ m.style.display='none'; } }
    function initSplash3D(){
      var wrap=document.getElementById('scModel'), cv=document.getElementById('scModelCanvas');
      if(!wrap||!cv||!window.THREE){ hideSplashModel(); return; }
      if(closed||!document.body.contains(overlay)){ hideSplashModel(); return; } // 脚本到达前开屏已关闭：不再创建 WebGL 上下文
      var THREE=window.THREE, renderer, disposed=false, rafId=0, onResize=null;
      try{ renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true}); }catch(e){ hideSplashModel(); return; }
      // P2-9：释放 WebGL —— 停 rAF、移除监听、遍历释放 geometry/material/texture，最后 dispose + forceContextLoss
      function disposeMaterial(m){ if(!m) return; for(var k in m){ var v=m[k]; if(v&&v.isTexture){ try{ v.dispose(); }catch(e){} } } try{ m.dispose(); }catch(e){} }
      function disposeTree(root){ if(!root||!root.traverse) return; root.traverse(function(o){ if(o.geometry){ try{ o.geometry.dispose(); }catch(e){} } if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(disposeMaterial); } }); }
      function dispose(){
        if(disposed) return; disposed=true;
        if(rafId){ cancelAnimationFrame(rafId); rafId=0; }
        if(onResize){ window.removeEventListener('resize',onResize); onResize=null; }
        if(scene){
          try{ disposeTree(scene); }catch(e){}
          try{ scene.environment=null; }catch(e){}
          try{ while(scene.children.length) scene.remove(scene.children[0]); }catch(e){}
        }
        try{ if(envRT) envRT.dispose(); }catch(e){}
        try{ if(renderer.renderLists) renderer.renderLists.dispose(); }catch(e){}
        try{ renderer.dispose(); }catch(e){}
        try{ renderer.forceContextLoss(); }catch(e){}
        renderer=null;
      }
      releaseSplash3D=dispose;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setClearColor(0x000000,0);
      if('outputEncoding' in renderer) renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
      var scene=new THREE.Scene();
      var camera=new THREE.PerspectiveCamera(38,1,0.1,200); camera.position.set(0,0.1,5);
      function makeEnv(){ var c=document.createElement('canvas'); c.width=1024; c.height=512; var g=c.getContext('2d'); var grd=g.createLinearGradient(0,0,0,512); grd.addColorStop(0,'#fff3e2'); grd.addColorStop(.45,'#f0d9bd'); grd.addColorStop(.55,'#b9825f'); grd.addColorStop(1,'#3a1620'); g.fillStyle=grd; g.fillRect(0,0,1024,512); var rg=g.createRadialGradient(700,130,0,700,130,340); rg.addColorStop(0,'rgba(255,255,255,.95)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(0,0,1024,512); var tex=new THREE.CanvasTexture(c); tex.mapping=THREE.EquirectangularReflectionMapping; return tex; }
      try{ var pmrem=new THREE.PMREMGenerator(renderer); var envTex=makeEnv(); var envRT=pmrem.fromEquirectangular(envTex); scene.environment=envRT.texture; envTex.dispose(); pmrem.dispose(); }catch(e){}
      scene.add(new THREE.HemisphereLight(0xfff3e2,0x3a0d18,0.85));
      var kl=new THREE.DirectionalLight(0xfff0d8,1.7); kl.position.set(3.5,5.5,4); scene.add(kl);
      var rl=new THREE.DirectionalLight(0xffd9b0,1.1); rl.position.set(-4,2.5,-3.5); scene.add(rl);
      scene.add(new THREE.AmbientLight(0xffffff,0.30));
      var pivot=new THREE.Group(); scene.add(pivot);
      function resize(){ var r=wrap.getBoundingClientRect(); var w=Math.max(1,Math.round(r.width)), h=Math.max(1,Math.round(r.height)); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
      function frame(model){ var box=new THREE.Box3().setFromObject(model); var size=new THREE.Vector3(); box.getSize(size); var center=new THREE.Vector3(); box.getCenter(center); model.position.sub(center); pivot.add(model); var md=Math.max(size.x,size.y,size.z)||1; var fov=camera.fov*Math.PI/180; var dist=(md*0.5)/Math.tan(fov/2)*1.22; camera.position.set(0,md*0.08,dist); camera.lookAt(0,0,0); pivot.rotation.x=-0.04; }
      var t0=performance.now();
      function animate(){ rafId=0; if(disposed) return; if(!document.body.contains(overlay)){ dispose(); return; } rafId=requestAnimationFrame(animate); var t=(performance.now()-t0)/1000; pivot.rotation.y=t*0.55; pivot.position.y=Math.sin(t*1.1)*0.035; renderer.render(scene,camera); }
      resize();
      var loader=new THREE.GLTFLoader();
      loader.load('./assets/models/legal.glb', function(gltf){ if(disposed||closed){ disposeTree(gltf&&gltf.scene); if(!document.body.contains(overlay)) dispose(); return; } var model=gltf.scene; model.traverse(function(o){ if(o.isMesh) o.frustumCulled=false; }); frame(model); resize(); wrap.classList.add('is-ready'); try{ localStorage.setItem('fk_splash3d_done','1'); }catch(e){} if(reduce){ renderer.render(scene,camera); } else { animate(); } }, undefined, function(err){ if(window.console) console.warn('[splash3d] 模型加载失败，回退渐变开屏',err); try{ localStorage.setItem('fk_splash3d_done','1'); }catch(e){} hideSplashModel(); dispose(); });
      onResize=function(){ if(disposed) return; resize(); if(reduce) renderer.render(scene,camera); };
      window.addEventListener('resize', onResize);
    }
    function loadScriptOnce(src, ok, fail){ var s=document.createElement('script'); s.src=src; s.async=false; s.onload=ok; s.onerror=fail||function(){}; (document.head||document.documentElement).appendChild(s); }
    // ── 3D 加载策略（省流量版）──
    // 1) 本机只在首次访问加载一次开屏 3D（three 147KB + loader 22KB + 模型 426KB），之后进站直接走渐变开屏（P2-9：改用 localStorage）
    // 2) 系统省流量模式 / 2G-3G 网络直接跳过，不做 3D（不写标记，换到好网络后仍有一次机会）
    (function(){
      var SKIP_KEY = 'fk_splash3d_done';
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
      var slow = !!conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '');
      var seen = false;
      try { seen = localStorage.getItem(SKIP_KEY) === '1'; } catch(e) {}
      if (slow || seen) { hideSplashModel(); return; }
      // 注意：标记不在这里写。开屏 3 秒就自动关闭，而模型 426KB 往往来不及加载完；
      // 若在此处标记，用户将永远看不到 3D。改由 initSplash3D 在模型真正显示（is-ready）
      // 或明确失败（onerror）时写入 —— 见 loader.load 的两个回调。
      loadScriptOnce('./vendor/three.r128.min.js', function(){ loadScriptOnce('./vendor/GLTFLoader.js', initSplash3D, hideSplashModel); }, hideSplashModel);
    })();
  })();
  