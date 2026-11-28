/* ============================================================
 * 法考倒计时（原生实现 · v2）
 * - 顶部导航「倒计时」按钮 + 弹层；开屏那句也升级为完整实时倒计时
 * - 客观题 / 主观题 双阶段切换；设置自定义考试名称 / 目标时间 / 备考开始日
 * - 备考进度环 + 每日打卡（连续/累计）+ 生成分享卡片（Canvas 导出 PNG）
 * - 目标日期「跨年自动顺延」：年份落后于当前年时自动跟随到今年，无需手改
 * - 过期态「已开考」、移动端 2×2、法谚轮播、Esc/遮罩关闭
 * - 跟随站点主题（日间/深色/护眼）：全部使用 CSS 变量，无外链、离线可用
 * ============================================================ */
(function () {
  'use strict';
  if (window.__fkcdInit) return;
  window.__fkcdInit = true;

  var LS_KEY = 'fakao_countdown_v1';
  var DEFAULTS = {
    current: 'subjective',
    checkins: {},
    phases: {
      objective: { label: '客观题', name: '国家统一法律职业资格考试 · 客观题', target: '2026-09-20T09:00', start: '2025-10-01' },
      subjective: { label: '主观题', name: '国家统一法律职业资格考试 · 主观题', target: '2026-11-30T18:00', start: '2026-01-01' }
    }
  };
  var QUOTES = [
    ['法律不保护躺在权利上睡觉的人。', '法谚'],
    ['法者，天下之程式，万事之仪表也。', '《管子·明法解》'],
    ['正义不仅应当得到实现，而且应以人们看得见的方式实现。', '法谚'],
    ['法不阿贵，绳不挠曲。', '《韩非子·有度》'],
    ['你此刻背下的每一个字，都是将来替别人撑腰的底气。', '备考寄语'],
    ['法律的生命不在于逻辑，而在于经验。', '霍姆斯'],
    ['每一次真题的复盘，都是考场上少挖的一个坑。', '备考寄语'],
    ['徒法不足以自行。', '《孟子·离娄上》'],
    ['沉住气，每一步都算数。', '备考寄语'],
    ['法者，定分止争也。', '《管子》']
  ];

  function deepDefault() { return JSON.parse(JSON.stringify(DEFAULTS)); }
  function load() {
    var d = deepDefault();
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && s.phases) {
        if (s.current) d.current = s.current;
        ['objective', 'subjective'].forEach(function (k) {
          var sp = s.phases[k];
          if (sp) {
            if (sp.name) d.phases[k].name = sp.name;
            if (sp.target) d.phases[k].target = sp.target;
            if (sp.start) d.phases[k].start = sp.start;
            if (sp.label) d.phases[k].label = sp.label;
          }
        });
        if (s.checkins && typeof s.checkins === 'object') d.checkins = s.checkins;
      }
    } catch (e) {}
    return d;
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  var state = load();
  var els = {};
  var tickTimer = null, quoteTimer = null, quoteIdx = 0, isOpen = false, splashTimer = null;

  function pad(n, w) { n = String(Math.max(0, n)); while (n.length < w) n = '0' + n; return n; }
  function weekday(d) { return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); }

  /* 跨年自动顺延：设定年份早于当前年 → 顺延到当前年（保持月日时分） */
  function resolveTarget(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return d;
    var now = new Date();
    if (d.getFullYear() < now.getFullYear()) {
      d = new Date(now.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
    }
    return d;
  }
  function fmtExam(dateObj) {
    var d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
    if (isNaN(d.getTime())) return String(dateObj);
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' +
      weekday(d) + ' · ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ' 开考';
  }
  function parts(ms) {
    var ts = Math.floor(ms / 1000);
    return { d: Math.floor(ts / 86400), h: Math.floor((ts % 86400) / 3600), m: Math.floor((ts % 3600) / 60), s: ts % 60, hours: Math.floor(ms / 3600000) };
  }

  /* ---------- 样式 ---------- */
  function injectStyles() {
    if (document.getElementById('fkcdStyles')) return;
    var css = ''
      + '.fkcd-examline{font-size:12px;color:var(--text-muted);text-align:center;margin:10px 0 2px;line-height:1.5}'
      + '.fkcd-count{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0 2px}'
      + '@media(max-width:430px){.fkcd-count{grid-template-columns:repeat(2,1fr);gap:8px}}'
      + '.fkcd-box{background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:12px;padding:14px 6px 10px;text-align:center}'
      + '.fkcd-num{display:block;font-size:clamp(26px,7.6vw,42px);font-weight:900;line-height:1;color:var(--text-main);font-variant-numeric:tabular-nums;letter-spacing:-.02em}'
      + '.fkcd-box.is-sec .fkcd-num{color:var(--brand-accent)}'
      + '.fkcd-lbl{display:block;font-size:11px;font-weight:700;color:var(--text-muted);margin-top:6px}'
      + '.fkcd-lbl-en{display:block;font-size:8px;letter-spacing:.12em;color:var(--text-muted);opacity:.55;margin-top:2px}'
      + '.fkcd-meta{text-align:center;font-size:11px;color:var(--text-muted);margin-top:10px}'
      + '.fkcd-state{margin-top:8px;text-align:center;font-weight:800;font-size:13px;color:var(--brand-accent)}'
      + '.fkcd-stats{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;margin-top:14px;padding:12px;border-radius:12px;background:var(--bg-subtle);border:1px solid var(--border-color)}'
      + '.fkcd-ring{position:relative;width:88px;height:88px;flex:0 0 auto}'
      + '.fkcd-ring svg{width:88px;height:88px;transform:rotate(-90deg)}'
      + '.fkcd-ring .fkcd-ring-track{fill:none;stroke:var(--border-color);stroke-width:8}'
      + '.fkcd-ring .fkcd-ring-arc{fill:none;stroke:var(--brand-accent);stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset .6s ease}'
      + '.fkcd-ring-txt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}'
      + '.fkcd-ring-txt b{font-size:18px;font-weight:900;color:var(--text-main)}'
      + '.fkcd-ring-txt span{font-size:9px;color:var(--text-muted);margin-top:2px}'
      + '.fkcd-check{min-width:0}'
      + '.fkcd-check .fkcd-check-title{font-size:12px;font-weight:800;color:var(--text-main);display:flex;align-items:center;gap:6px}'
      + '.fkcd-check .fkcd-check-sub{font-size:11px;color:var(--text-muted);margin-top:4px}'
      + '.fkcd-mini{padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;border:1px solid var(--brand-accent);background:var(--brand-accent);color:#fff;margin-top:8px}'
      + '.fkcd-mini.done{background:var(--bg-card);color:var(--text-muted);border-color:var(--border-color);cursor:default}'
      + '.fkcd-actions{display:flex;gap:8px;margin-top:12px}'
      + '.fkcd-act{flex:1;padding:9px 10px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-main);display:inline-flex;align-items:center;justify-content:center;gap:6px}'
      + '.fkcd-act.primary{background:var(--brand-accent);border-color:var(--brand-accent);color:#fff}'
      + '.fkcd-quote{text-align:center;font-size:13px;color:var(--text-main);margin-top:14px;line-height:1.65;min-height:46px;border-top:1px dashed var(--border-color);padding-top:12px}'
      + '.fkcd-quote .fkcd-q{opacity:1;transition:opacity .35s ease}'
      + '.fkcd-quote .fkcd-q.fade{opacity:0}'
      + '.fkcd-q-src{display:block;font-size:10.5px;color:var(--text-muted);margin-top:6px;opacity:.8}'
      + '.fkcd-gear{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-muted);cursor:pointer}'
      + '.fkcd-gear:hover{color:var(--text-main)}'
      + '.fkcd-settings{margin-top:14px;padding:12px;border-radius:12px;background:var(--bg-subtle);border:1px solid var(--border-color)}'
      + '.fkcd-settings label{display:block;font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:10px}'
      + '.fkcd-settings input{display:block;width:100%;margin-top:5px;padding:8px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-main);font-size:13px}'
      + '.fkcd-set-actions{display:flex;gap:8px;margin-top:4px}'
      + '.fkcd-btn{flex:1;padding:8px 10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid var(--border-color)}'
      + '.fkcd-btn.primary{background:var(--brand-accent);border-color:var(--brand-accent);color:#fff}'
      + '.fkcd-btn.ghost{background:var(--bg-card);color:var(--text-main)}'
      + '.fkcd-hint{font-size:10.5px;color:var(--text-muted);opacity:.8;margin-top:8px;text-align:center}'
      + '.fkcd-cardwrap{margin-top:14px;border-top:1px dashed var(--border-color);padding-top:12px}'
      + '.fkcd-cardwrap canvas{width:100%;max-width:300px;display:block;margin:0 auto;border-radius:12px;box-shadow:0 10px 30px -16px rgba(2,8,23,.6)}'
      + '.fkcd-cardwrap .fkcd-card-actions{display:flex;gap:8px;margin-top:10px;justify-content:center}';
    var st = document.createElement('style');
    st.id = 'fkcdStyles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- 顶部按钮 ---------- */
  function injectButton() {
    if (document.getElementById('fkcdOpenBtn')) return;
    var anchor = document.getElementById('openAiModalBtn') || document.getElementById('openReportModalBtn') || document.getElementById('openSyncModalBtn');
    if (!anchor || !anchor.parentNode) return;
    var btn = document.createElement('button');
    btn.id = 'fkcdOpenBtn';
    btn.type = 'button';
    btn.title = '法考倒计时';
    btn.className = 'px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1 transition';
    btn.innerHTML = '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="hidden sm:inline">倒计时</span>';
    btn.addEventListener('click', openModal);
    anchor.parentNode.insertBefore(btn, anchor);
  }

  /* ---------- 弹层 ---------- */
  function buildModal() {
    if (document.getElementById('fkcdModal')) return;
    var wrap = document.createElement('div');
    wrap.id = 'fkcdModal';
    wrap.className = 'hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'fkcdTitle');
    wrap.innerHTML =
      '<div class="theme-card w-full max-w-xl rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[88vh] overflow-y-auto shadow-2xl">' +
        '<div class="modal-head">' +
          '<div class="modal-head-main">' +
            '<span class="modal-head-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>' +
            '<div class="min-w-0"><h3 class="modal-title" id="fkcdTitle">法考倒计时</h3><p class="modal-sub" id="fkcdSub">主观题 · 备考倒计时</p></div>' +
          '</div>' +
          '<button id="fkcdClose" type="button" class="modal-close" aria-label="关闭倒计时"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
        '</div>' +
        '<div class="modal-tabs flex items-center gap-1.5 pt-2.5">' +
          '<button id="fkcdTabObj" type="button" class="m-tab">客观题</button>' +
          '<button id="fkcdTabSubj" type="button" class="m-tab is-active">主观题</button>' +
          '<button id="fkcdGear" type="button" class="fkcd-gear" aria-label="设置" title="设置名称/目标日期/备考开始日"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>' +
        '</div>' +
        '<div class="fkcd-examline" id="fkcdExamLine"></div>' +
        '<div class="fkcd-count" id="fkcdCount">' +
          '<div class="fkcd-box"><span class="fkcd-num" id="fkcdD">00</span><span class="fkcd-lbl">天</span><span class="fkcd-lbl-en">DAYS</span></div>' +
          '<div class="fkcd-box"><span class="fkcd-num" id="fkcdH">00</span><span class="fkcd-lbl">时</span><span class="fkcd-lbl-en">HOURS</span></div>' +
          '<div class="fkcd-box"><span class="fkcd-num" id="fkcdM">00</span><span class="fkcd-lbl">分</span><span class="fkcd-lbl-en">MIN</span></div>' +
          '<div class="fkcd-box is-sec"><span class="fkcd-num" id="fkcdS">00</span><span class="fkcd-lbl">秒</span><span class="fkcd-lbl-en">SEC</span></div>' +
        '</div>' +
        '<div class="fkcd-meta" id="fkcdMeta"></div>' +
        '<div class="fkcd-state" id="fkcdState" hidden></div>' +
        '<div class="fkcd-stats">' +
          '<div class="fkcd-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="fkcd-ring-track" cx="50" cy="50" r="42"></circle><circle class="fkcd-ring-arc" id="fkcdRingArc" cx="50" cy="50" r="42"></circle></svg><div class="fkcd-ring-txt"><b id="fkcdRingPct">0%</b><span>备考进度</span></div></div>' +
          '<div class="fkcd-check"><div class="fkcd-check-title">📅 每日打卡</div><div class="fkcd-check-sub" id="fkcdCheckSub">连续 0 天 · 累计 0 天</div><button type="button" class="fkcd-mini" id="fkcdCheckBtn">今日打卡</button></div>' +
        '</div>' +
        '<div class="fkcd-actions"><button type="button" class="fkcd-act primary" id="fkcdShareBtn">生成分享卡片</button></div>' +
        '<div class="fkcd-quote" id="fkcdQuote"><span class="fkcd-q"></span><span class="fkcd-q-src"></span></div>' +
        '<div class="fkcd-settings hidden" id="fkcdSettings">' +
          '<label>考试名称<input id="fkcdNameInput" type="text" maxlength="40" placeholder="如：国家统一法律职业资格考试 · 主观题"></label>' +
          '<label>目标日期时间<input id="fkcdTargetInput" type="datetime-local"></label>' +
          '<label>备考开始日（用于进度环）<input id="fkcdStartInput" type="date"></label>' +
          '<div class="fkcd-set-actions"><button type="button" class="fkcd-btn primary" id="fkcdSaveBtn">保存</button><button type="button" class="fkcd-btn ghost" id="fkcdResetBtn">恢复默认</button></div>' +
          '<div class="fkcd-hint">保存后本机记住，换设备不跟随 · 完全离线 · 目标日期跨年自动顺延</div>' +
        '</div>' +
        '<div class="fkcd-cardwrap hidden" id="fkcdCardWrap">' +
          '<canvas id="fkcdCardCanvas"></canvas>' +
          '<div class="fkcd-card-actions"><button type="button" class="fkcd-btn primary" id="fkcdDownloadBtn">下载 PNG</button><button type="button" class="fkcd-btn ghost" id="fkcdCardCloseBtn">收起</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    els.modal = wrap;
    els.sub = wrap.querySelector('#fkcdSub');
    els.examLine = wrap.querySelector('#fkcdExamLine');
    els.d = wrap.querySelector('#fkcdD'); els.h = wrap.querySelector('#fkcdH'); els.m = wrap.querySelector('#fkcdM'); els.s = wrap.querySelector('#fkcdS');
    els.meta = wrap.querySelector('#fkcdMeta'); els.state = wrap.querySelector('#fkcdState');
    els.quote = wrap.querySelector('#fkcdQuote'); els.quoteText = wrap.querySelector('.fkcd-q'); els.quoteSrc = wrap.querySelector('.fkcd-q-src');
    els.settings = wrap.querySelector('#fkcdSettings');
    els.nameInput = wrap.querySelector('#fkcdNameInput'); els.targetInput = wrap.querySelector('#fkcdTargetInput'); els.startInput = wrap.querySelector('#fkcdStartInput');
    els.tabObj = wrap.querySelector('#fkcdTabObj'); els.tabSubj = wrap.querySelector('#fkcdTabSubj');
    els.ringArc = wrap.querySelector('#fkcdRingArc'); els.ringPct = wrap.querySelector('#fkcdRingPct');
    els.checkSub = wrap.querySelector('#fkcdCheckSub'); els.checkBtn = wrap.querySelector('#fkcdCheckBtn');
    els.cardWrap = wrap.querySelector('#fkcdCardWrap'); els.cardCanvas = wrap.querySelector('#fkcdCardCanvas');
    els.RING_CIRC = 2 * Math.PI * 42;

    wrap.querySelector('#fkcdClose').addEventListener('click', closeModal);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    els.tabObj.addEventListener('click', function () { switchPhase('objective'); });
    els.tabSubj.addEventListener('click', function () { switchPhase('subjective'); });
    wrap.querySelector('#fkcdGear').addEventListener('click', function () {
      els.settings.classList.toggle('hidden');
      if (!els.settings.classList.contains('hidden')) fillSettings();
    });
    wrap.querySelector('#fkcdSaveBtn').addEventListener('click', saveSettings);
    wrap.querySelector('#fkcdResetBtn').addEventListener('click', function () { var c = state.current; state = deepDefault(); state.current = c; save(); fillSettings(); render(); });
    els.checkBtn.addEventListener('click', doCheckin);
    wrap.querySelector('#fkcdShareBtn').addEventListener('click', generateShareCard);
    wrap.querySelector('#fkcdCardCloseBtn').addEventListener('click', function () { els.cardWrap.classList.add('hidden'); });
    wrap.querySelector('#fkcdDownloadBtn').addEventListener('click', downloadCard);
  }

  function switchPhase(key) { if (!state.phases[key]) return; state.current = key; save(); render(); }
  function fillSettings() {
    var p = state.phases[state.current];
    els.nameInput.value = p.name || '';
    els.targetInput.value = p.target || '';
    els.startInput.value = (p.start || '').slice(0, 10);
    els.settings.classList.remove('hidden');
  }
  function saveSettings() {
    var p = state.phases[state.current];
    if (els.targetInput.value) p.target = els.targetInput.value;
    if (els.nameInput.value.trim()) p.name = els.nameInput.value.trim();
    if (els.startInput.value) p.start = els.startInput.value;
    save(); els.settings.classList.add('hidden'); render();
  }
  function setTabActive(key) {
    if (key === 'objective') { els.tabObj.classList.add('is-active'); els.tabSubj.classList.remove('is-active'); }
    else { els.tabSubj.classList.add('is-active'); els.tabObj.classList.remove('is-active'); }
  }

  function render() {
    var key = state.current, p = state.phases[key];
    setTabActive(key);
    els.sub.textContent = (p.label || (key === 'objective' ? '客观题' : '主观题')) + ' · 备考倒计时';
    els.examLine.textContent = fmtExam(resolveTarget(p.target));
    updateCountdown();
    updateRing();
    renderCheckin();
  }

  function updateCountdown() {
    var p = state.phases[state.current];
    var tgt = resolveTarget(p.target);
    var ms = tgt.getTime() - Date.now();
    if (isNaN(tgt.getTime())) { els.meta.textContent = '目标日期无效，请点右上角设置'; return; }
    if (ms <= 0) {
      els.d.textContent = '00'; els.h.textContent = '00'; els.m.textContent = '00'; els.s.textContent = '00';
      els.state.hidden = false; els.state.textContent = '已开考 · 全力以赴';
      els.meta.textContent = '距 ' + fmtExam(tgt).replace(' 开考', '') + ' 已过';
      return;
    }
    els.state.hidden = true;
    var q = parts(ms);
    els.d.textContent = pad(q.d, 2); els.h.textContent = pad(q.h, 2); els.m.textContent = pad(q.m, 2); els.s.textContent = pad(q.s, 2);
    els.meta.textContent = '约 ' + q.hours + ' 小时 · 剩余 ' + q.d + ' 天 ' + q.h + ' 时 ' + q.m + ' 分 · 最后冲刺';
  }

  function updateRing() {
    var p = state.phases[state.current];
    var tgt = resolveTarget(p.target);
    var storedT = new Date(p.target), storedS = new Date(p.start);
    var span = storedT.getTime() - storedS.getTime();
    if (!(span > 0)) span = 180 * 86400000;
    var start = tgt.getTime() - span;
    var now = Date.now();
    var pct = (now - start) / span;
    if (pct < 0) pct = 0; if (pct > 1) pct = 1;
    var circ = els.RING_CIRC;
    els.ringArc.setAttribute('stroke-dasharray', circ.toFixed(1));
    els.ringArc.setAttribute('stroke-dashoffset', (circ * (1 - pct)).toFixed(1));
    els.ringPct.textContent = Math.round(pct * 100) + '%';
  }

  function computeStreak() {
    var d = new Date();
    if (!state.checkins[dateKey(d)]) d.setDate(d.getDate() - 1);
    var n = 0;
    while (state.checkins[dateKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderCheckin() {
    var total = Object.keys(state.checkins || {}).length;
    var streak = computeStreak();
    var today = !!state.checkins[dateKey(new Date())];
    els.checkSub.textContent = '连续 ' + streak + ' 天 · 累计 ' + total + ' 天' + (today ? ' · 今日已打卡 ✓' : '');
    els.checkBtn.textContent = today ? '今日已打卡' : '今日打卡';
    els.checkBtn.classList.toggle('done', today);
  }
  function doCheckin() {
    var k = dateKey(new Date());
    if (state.checkins[k]) return;
    state.checkins[k] = true; save(); renderCheckin();
  }

  function renderQuote(animate) {
    var q = QUOTES[quoteIdx % QUOTES.length];
    if (animate) {
      els.quoteText.classList.add('fade');
      setTimeout(function () { els.quoteText.textContent = q[0]; els.quoteSrc.textContent = '—— ' + q[1]; els.quoteText.classList.remove('fade'); }, 320);
    } else { els.quoteText.textContent = q[0]; els.quoteSrc.textContent = '—— ' + q[1]; }
  }

  /* ---------- 分享卡片（Canvas 绘制 → PNG） ---------- */
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawCard() {
    var cv = els.cardCanvas;
    var W = 720, H = 1000, scale = 2;
    cv.width = W * scale; cv.height = H * scale;
    var ctx = cv.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    // 背景
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0a1420'); g.addColorStop(0.55, '#12233b'); g.addColorStop(1, '#0a1420');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(W * 0.78, H * 0.16, 0, W * 0.78, H * 0.16, 420);
    rg.addColorStop(0, 'rgba(201,155,60,0.28)'); rg.addColorStop(1, 'rgba(201,155,60,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    // 细金边
    ctx.strokeStyle = 'rgba(201,155,60,0.5)'; ctx.lineWidth = 2; rr(ctx, 28, 28, W - 56, H - 56, 22); ctx.stroke();
    var p = state.phases[state.current];
    var tgt = resolveTarget(p.target);
    var ms = tgt.getTime() - Date.now();
    ctx.textAlign = 'center';
    // 顶部品牌
    ctx.fillStyle = '#c9a24b'; ctx.font = '600 22px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('法考智练 · 陪你稳过法考', W / 2, 92);
    // 标题
    ctx.fillStyle = '#f3e6c4'; ctx.font = '700 34px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText((p.label || '主观题') + '考试倒计时', W / 2, 168);
    // 考试名称（可能换行）
    ctx.fillStyle = 'rgba(243,230,196,0.78)'; ctx.font = '400 20px "PingFang SC","Microsoft YaHei",sans-serif';
    wrapText(ctx, p.name || '', W / 2, 210, W - 160, 28);
    // 大数字
    var y0 = 340;
    var labY = 300;
    if (ms <= 0) {
      ctx.fillStyle = '#e9c766'; ctx.font = '900 64px "PingFang SC",sans-serif';
      ctx.fillText('已开考 · 全力以赴', W / 2, y0 + 40);
    } else {
      var q = parts(ms);
      var cells = [[pad(q.d, 2), '天'], [pad(q.h, 2), '时'], [pad(q.m, 2), '分'], [pad(q.s, 2), '秒']];
      var cw = 150, gap = 14, totalW = cw * 4 + gap * 3, x0 = (W - totalW) / 2;
      for (var i = 0; i < 4; i++) {
        var bx = x0 + i * (cw + gap);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        rr(ctx, bx, y0, cw, 150, 16); ctx.fill();
        ctx.strokeStyle = i === 3 ? 'rgba(233,199,102,0.85)' : 'rgba(201,155,60,0.35)'; ctx.lineWidth = 2;
        rr(ctx, bx, y0, cw, 150, 16); ctx.stroke();
        ctx.fillStyle = i === 3 ? '#f2cf6a' : '#f3e6c4';
        ctx.font = '900 66px "PingFang SC",sans-serif';
        ctx.fillText(cells[i][0], bx + cw / 2, y0 + 92);
        ctx.fillStyle = 'rgba(243,230,196,0.72)'; ctx.font = '700 20px "PingFang SC",sans-serif';
        ctx.fillText(cells[i][1], bx + cw / 2, y0 + 128);
      }
    }
    // 开考时间
    ctx.fillStyle = 'rgba(243,230,196,0.9)'; ctx.font = '600 24px "PingFang SC",sans-serif';
    ctx.fillText(fmtExam(tgt), W / 2, 580);
    // 分隔
    ctx.strokeStyle = 'rgba(201,155,60,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(120, 630); ctx.lineTo(W - 120, 630); ctx.stroke();
    // 法谚
    var qq = QUOTES[quoteIdx % QUOTES.length];
    ctx.fillStyle = '#f3e6c4'; ctx.font = '400 24px "PingFang SC","Microsoft YaHei",sans-serif';
    wrapText(ctx, '「' + qq[0] + '」', W / 2, 700, W - 180, 38);
    ctx.fillStyle = 'rgba(201,162,75,0.9)'; ctx.font = '400 18px "PingFang SC",sans-serif';
    ctx.fillText('—— ' + qq[1], W / 2, 830);
    // 底部
    ctx.fillStyle = 'rgba(243,230,196,0.55)'; ctx.font = '400 18px "PingFang SC",sans-serif';
    ctx.fillText(dateKey(new Date()) + ' · 距离法考还有 ' + (ms > 0 ? parts(ms).d + ' 天' : '0 天'), W / 2, 900);
    ctx.fillStyle = '#c9a24b'; ctx.font = '700 20px "PingFang SC",sans-serif';
    ctx.fillText('法考智练 FAKAO · 刷题 · 背诵 · 错题 · 离线守护', W / 2, 936);
  }
  function wrapText(ctx, text, cx, y, maxW, lh) {
    var chars = String(text).split('');
    var line = '', lines = [];
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = chars[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], cx, y + j * lh);
  }
  function generateShareCard() {
    drawCard();
    els.cardWrap.classList.remove('hidden');
    try { els.cardWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  }
  function downloadCard() {
    try {
      var url = els.cardCanvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = url; a.download = '法考倒计时_' + dateKey(new Date()) + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) {}
  }

  /* ---------- 开屏那句 → 完整实时倒计时 ---------- */
  function enhanceSplash() {
    var count = document.querySelector('#splashCover .sc-count');
    if (!count) return;
    count.innerHTML = '<span class="sc-spark" aria-hidden="true">✦</span><span>距离<span id="scCdYearX"></span>法考还有 <b id="scCdDaysX">—</b> 天 <span id="scCdHX">—</span> 时 <span id="scCdMX">—</span> 分 <span id="scCdSX">—</span> 秒</span>';
    function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }
    function tick() {
      var host = document.getElementById('scCdDaysX');
      if (!host || !document.body.contains(count)) { if (splashTimer) { clearInterval(splashTimer); splashTimer = null; } return; }
      var p = state.phases[state.current];
      var tgt = resolveTarget(p.target);
      var ms = tgt.getTime() - Date.now();
      set('scCdYearX', ' ' + tgt.getFullYear() + ' ');
      if (isNaN(tgt.getTime())) return;
      if (ms <= 0) { set('scCdDaysX', '0'); set('scCdHX', '00'); set('scCdMX', '00'); set('scCdSX', '00'); return; }
      var q = parts(ms);
      set('scCdDaysX', q.d); set('scCdHX', pad(q.h, 2)); set('scCdMX', pad(q.m, 2)); set('scCdSX', pad(q.s, 2));
    }
    tick();
    if (splashTimer) clearInterval(splashTimer);
    splashTimer = setInterval(tick, 1000);
  }

  /* ---------- 开关 ---------- */
  function openModal() {
    buildModal(); isOpen = true;
    els.modal.classList.remove('hidden');
    render(); quoteIdx = 0; renderQuote(false); els.cardWrap.classList.add('hidden');
    if (tickTimer) clearInterval(tickTimer); tickTimer = setInterval(function () { updateCountdown(); updateRing(); }, 1000);
    if (quoteTimer) clearInterval(quoteTimer); quoteTimer = setInterval(function () { quoteIdx++; renderQuote(true); }, 7000);
  }
  function closeModal() {
    isOpen = false; if (els.modal) els.modal.classList.add('hidden');
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    if (quoteTimer) { clearInterval(quoteTimer); quoteTimer = null; }
  }

  function init() {
    injectStyles(); buildModal(); injectButton(); enhanceSplash();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closeModal(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
