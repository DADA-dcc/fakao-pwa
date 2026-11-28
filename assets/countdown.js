/* ============================================================
 * 法考倒计时（原生实现）
 * - 顶部导航「倒计时」按钮 + 弹层
 * - 客观题 / 主观题 双阶段切换
 * - 设置：自定义考试名称 + 目标日期时间，localStorage 记忆
 * - 过期态「已开考」、移动端 2×2 自适应、法谚轮播
 * - 跟随站点主题（日间/深色/护眼）：全部使用 CSS 变量，无外链、离线可用
 * ============================================================ */
(function () {
  'use strict';
  if (window.__fkcdInit) return;
  window.__fkcdInit = true;

  var LS_KEY = 'fakao_countdown_v1';
  var DEFAULTS = {
    current: 'subjective',
    phases: {
      objective: { label: '客观题', name: '国家统一法律职业资格考试 · 客观题', target: '2026-09-20T09:00' },
      subjective: { label: '主观题', name: '国家统一法律职业资格考试 · 主观题', target: '2026-11-30T18:00' }
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
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && s.phases && s.phases.objective && s.phases.subjective &&
          s.phases.objective.target && s.phases.subjective.target) {
        if (!s.current) s.current = 'subjective';
        return s;
      }
    } catch (e) {}
    return deepDefault();
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

  var state = load();
  var els = {};
  var tickTimer = null, quoteTimer = null, quoteIdx = 0, isOpen = false;

  function pad(n, w) { n = String(Math.max(0, n)); while (n.length < w) n = '0' + n; return n; }

  function weekday(d) { return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]; }

  function fmtExam(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' +
      weekday(d) + ' · ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ' 开考';
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  /* ---------- 样式（跟随主题变量） ---------- */
  function injectStyles() {
    if (document.getElementById('fkcdStyles')) return;
    var css = ''
      + '.fkcd-examline{font-size:12px;color:var(--text-muted);text-align:center;margin:10px 0 2px;line-height:1.5}'
      + '.fkcd-count{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0 2px}'
      + '@media(max-width:430px){.fkcd-count{grid-template-columns:repeat(2,1fr);gap:8px}}'
      + '.fkcd-box{background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:12px;padding:14px 6px 10px;text-align:center;transition:background-color .2s ease,border-color .2s ease}'
      + '.fkcd-num{display:block;font-size:clamp(26px,7.6vw,42px);font-weight:900;line-height:1;color:var(--text-main);font-variant-numeric:tabular-nums;letter-spacing:-.02em}'
      + '.fkcd-box.is-sec .fkcd-num{color:var(--brand-accent)}'
      + '.fkcd-lbl{display:block;font-size:11px;font-weight:700;color:var(--text-muted);margin-top:6px}'
      + '.fkcd-lbl-en{display:block;font-size:8px;letter-spacing:.12em;color:var(--text-muted);opacity:.55;margin-top:2px}'
      + '.fkcd-meta{text-align:center;font-size:11px;color:var(--text-muted);margin-top:10px}'
      + '.fkcd-state{margin-top:10px;text-align:center;font-weight:800;font-size:13px;color:var(--brand-accent)}'
      + '.fkcd-quote{text-align:center;font-size:13px;color:var(--text-main);margin-top:14px;line-height:1.65;min-height:46px;border-top:1px dashed var(--border-color);padding-top:12px;position:relative;transition:opacity .35s ease}'
      + '.fkcd-quote .fkcd-q{opacity:1}'
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
      + '.fkcd-hint{font-size:10.5px;color:var(--text-muted);opacity:.8;margin-top:8px;text-align:center}';
    var st = document.createElement('style');
    st.id = 'fkcdStyles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- 顶部按钮 ---------- */
  function injectButton() {
    if (document.getElementById('fkcdOpenBtn')) return;
    var anchor = document.getElementById('openAiModalBtn') ||
                 document.getElementById('openReportModalBtn') ||
                 document.getElementById('openSyncModalBtn');
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
          '<button id="fkcdGear" type="button" class="fkcd-gear" aria-label="设置目标日期与名称" title="设置"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>' +
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
        '<div class="fkcd-quote" id="fkcdQuote"><span class="fkcd-q"></span><span class="fkcd-q-src"></span></div>' +
        '<div class="fkcd-settings hidden" id="fkcdSettings">' +
          '<label>考试名称<input id="fkcdNameInput" type="text" maxlength="40" placeholder="如：国家统一法律职业资格考试 · 主观题"></label>' +
          '<label>目标日期时间<input id="fkcdTargetInput" type="datetime-local"></label>' +
          '<div class="fkcd-set-actions"><button type="button" class="fkcd-btn primary" id="fkcdSaveBtn">保存</button><button type="button" class="fkcd-btn ghost" id="fkcdResetBtn">恢复默认</button></div>' +
          '<div class="fkcd-hint">保存后本机记住，换设备不跟随 · 完全离线</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    els.modal = wrap;
    els.sub = wrap.querySelector('#fkcdSub');
    els.examLine = wrap.querySelector('#fkcdExamLine');
    els.d = wrap.querySelector('#fkcdD');
    els.h = wrap.querySelector('#fkcdH');
    els.m = wrap.querySelector('#fkcdM');
    els.s = wrap.querySelector('#fkcdS');
    els.meta = wrap.querySelector('#fkcdMeta');
    els.state = wrap.querySelector('#fkcdState');
    els.quote = wrap.querySelector('#fkcdQuote');
    els.quoteText = wrap.querySelector('.fkcd-q');
    els.quoteSrc = wrap.querySelector('.fkcd-q-src');
    els.settings = wrap.querySelector('#fkcdSettings');
    els.nameInput = wrap.querySelector('#fkcdNameInput');
    els.targetInput = wrap.querySelector('#fkcdTargetInput');
    els.tabObj = wrap.querySelector('#fkcdTabObj');
    els.tabSubj = wrap.querySelector('#fkcdTabSubj');

    wrap.querySelector('#fkcdClose').addEventListener('click', closeModal);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    els.tabObj.addEventListener('click', function () { switchPhase('objective'); });
    els.tabSubj.addEventListener('click', function () { switchPhase('subjective'); });
    wrap.querySelector('#fkcdGear').addEventListener('click', function () {
      els.settings.classList.toggle('hidden');
      if (!els.settings.classList.contains('hidden')) fillSettings();
    });
    wrap.querySelector('#fkcdSaveBtn').addEventListener('click', saveSettings);
    wrap.querySelector('#fkcdResetBtn').addEventListener('click', function () {
      var c = state.current;
      state = deepDefault();
      state.current = c;
      save();
      fillSettings();
      render();
    });
  }

  function switchPhase(key) {
    if (!state.phases[key]) return;
    state.current = key;
    save();
    render();
  }

  function fillSettings() {
    var p = state.phases[state.current];
    els.nameInput.value = p.name || '';
    els.targetInput.value = p.target || '';
  }

  function saveSettings() {
    var p = state.phases[state.current];
    var name = els.nameInput.value.trim();
    var target = els.targetInput.value;
    if (target) p.target = target;
    if (name) p.name = name;
    save();
    els.settings.classList.add('hidden');
    render();
  }

  function setTabActive(key) {
    if (key === 'objective') { els.tabObj.classList.add('is-active'); els.tabSubj.classList.remove('is-active'); }
    else { els.tabSubj.classList.add('is-active'); els.tabObj.classList.remove('is-active'); }
  }

  function render() {
    var key = state.current;
    var p = state.phases[key];
    setTabActive(key);
    els.sub.textContent = (p.label || (key === 'objective' ? '客观题' : '主观题')) + ' · 备考倒计时';
    els.examLine.textContent = fmtExam(p.target);
    updateCountdown();
  }

  function updateCountdown() {
    var p = state.phases[state.current];
    var target = new Date(p.target).getTime();
    var ms = target - Date.now();
    if (isNaN(target)) { els.meta.textContent = '目标日期无效，请点右上角设置'; return; }
    if (ms <= 0) {
      els.d.textContent = '00'; els.h.textContent = '00'; els.m.textContent = '00'; els.s.textContent = '00';
      els.state.hidden = false;
      els.state.textContent = '已开考 · 全力以赴';
      els.meta.textContent = '距 ' + fmtExam(p.target).replace(' 开考', '') + ' 已过';
      return;
    }
    els.state.hidden = true;
    var totalSec = Math.floor(ms / 1000);
    var days = Math.floor(totalSec / 86400);
    var hours = Math.floor((totalSec % 86400) / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    els.d.textContent = pad(days, 2);
    els.h.textContent = pad(hours, 2);
    els.m.textContent = pad(mins, 2);
    els.s.textContent = pad(secs, 2);
    var totalHours = Math.floor(ms / 3600000);
    els.meta.textContent = '约 ' + totalHours + ' 小时 · 剩余 ' + days + ' 天 ' + hours + ' 时 ' + mins + ' 分 · 最后冲刺';
  }

  function renderQuote(animate) {
    var q = QUOTES[quoteIdx % QUOTES.length];
    if (animate) {
      els.quoteText.classList.add('fade');
      setTimeout(function () {
        els.quoteText.textContent = q[0];
        els.quoteSrc.textContent = '—— ' + q[1];
        els.quoteText.classList.remove('fade');
      }, 320);
    } else {
      els.quoteText.textContent = q[0];
      els.quoteSrc.textContent = '—— ' + q[1];
    }
  }

  function openModal() {
    buildModal();
    isOpen = true;
    els.modal.classList.remove('hidden');
    render();
    quoteIdx = 0; renderQuote(false);
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(updateCountdown, 1000);
    if (quoteTimer) clearInterval(quoteTimer);
    quoteTimer = setInterval(function () { quoteIdx++; renderQuote(true); }, 7000);
    var cb = document.getElementById('fkcdClose');
    if (cb) cb.focus();
  }

  function closeModal() {
    isOpen = false;
    if (els.modal) els.modal.classList.add('hidden');
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    if (quoteTimer) { clearInterval(quoteTimer); quoteTimer = null; }
  }

  function init() {
    injectStyles();
    buildModal();
    injectButton();
    // Esc 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
