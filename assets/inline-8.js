
(function () {
  var box = null, timer = null, pb = null, pt = null;
  function n(v) { return Math.round(v * 10) / 10; }
  function rect(el) { return el ? el.getBoundingClientRect() : null; }
  function snapshot() {
    var vv = window.visualViewport, ta = document.getElementById('subjectiveInput');
    var nav = document.querySelector('nav.fixed.bottom-0');
    var rs = getComputedStyle(document.documentElement);
    var tr = rect(ta), nr = rect(nav);
    return {
      time: new Date().toISOString(),
      ua: navigator.userAgent,
      dpr: window.devicePixelRatio,
      innerWidth: innerWidth, innerHeight: innerHeight,
      screen: screen.width + 'x' + screen.height,
      vvHeight: vv ? n(vv.height) : null,
      vvOffsetTop: vv ? n(vv.offsetTop || 0) : null,
      vvScale: vv ? n(vv.scale || 1) : null,
      keyboardInsetReal: vv ? n(innerHeight - (vv.height + (vv.offsetTop || 0))) : null,
      safeAreaBottom: pb ? getComputedStyle(pb).paddingBottom : null,
      safeAreaTop: pt ? getComputedStyle(pt).paddingTop : null,
      cssVVHeight: rs.getPropertyValue('--app-vv-height').trim(),
      cssKBInset: rs.getPropertyValue('--app-kb-inset').trim(),
      textareaMaxHeight: ta ? getComputedStyle(ta).maxHeight : null,
      textareaHeight: tr ? n(tr.height) : null,
      textareaBottom: tr ? n(tr.bottom) : null,
      navHeight: nr ? n(nr.height) : null,
      navTop: nr ? n(nr.top) : null,
      activeElement: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null,
      orientation: (screen.orientation && screen.orientation.type) || String(window.orientation || '')
    };
  }
  function paint() {
    if (!box) return;
    box.querySelector('pre').textContent = JSON.stringify(snapshot(), null, 2);
  }
  function copyText(t, btn) {
    function fallback() {
      var a = document.createElement('textarea');
      a.value = t; a.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(a); a.focus(); a.select();
      try { document.execCommand('copy'); btn.textContent = '已复制读数'; }
      catch (e) { btn.textContent = '复制失败，请长按上方文本'; }
      a.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { btn.textContent = '已复制读数'; }, fallback);
    } else fallback();
  }
  function show() {
    if (box) return;
    pb = document.createElement('div');
    pb.style.cssText = 'position:fixed;left:-9999px;top:0;padding-bottom:env(safe-area-inset-bottom)';
    pt = document.createElement('div');
    pt.style.cssText = 'position:fixed;left:-9999px;top:0;padding-top:env(safe-area-inset-top)';
    document.body.appendChild(pb); document.body.appendChild(pt);
    box = document.createElement('div');
    box.id = 'iosDiagBox';
    box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483000;'
      + 'background:rgba(8,16,30,.94);color:#d8f3ff;padding:8px 10px 10px;'
      + 'font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;'
      + 'border-bottom:2px solid #38bdf8;max-height:46vh;overflow:auto';
    box.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">'
      + '<b style="color:#7dd3fc;font-size:12px">iOS 真机读数 #iosdiag</b>'
      + '<button id="iosDiagCopy" style="padding:5px 10px;min-height:32px;border:0;border-radius:6px;background:#0ea5e9;color:#fff;font:600 11px system-ui">复制读数</button>'
      + '<button id="iosDiagClose" style="padding:5px 10px;min-height:32px;border:0;border-radius:6px;background:#334155;color:#fff;font:600 11px system-ui">关闭</button>'
      + '</div><pre style="margin:0;white-space:pre-wrap;word-break:break-all"></pre>';
    document.body.appendChild(box);
    box.querySelector('#iosDiagCopy').addEventListener('click', function () {
      copyText(JSON.stringify(snapshot(), null, 2), this);
    });
    box.querySelector('#iosDiagClose').addEventListener('click', function () {
      location.hash = '';
    });
    paint();
    timer = setInterval(paint, 300);
  }
  function hide() {
    if (timer) { clearInterval(timer); timer = null; }
    if (box) { box.remove(); box = null; }
    if (pb) { pb.remove(); pb = null; }
    if (pt) { pt.remove(); pt = null; }
  }
  function sync() { if (location.hash === '#iosdiag') show(); else hide(); }
  window.addEventListener('hashchange', sync);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
    // =========================================================================
    // 模拟考试引擎（P1-3）：组卷 / 限时 / 交卷判分 / 断点续考 / 成绩历史
    // =========================================================================
    (function () {
      const SKEY = "fakao_exam_session_v1";
      const HKEY = "fakao_exam_history_v1";

      const optList = (q) => {
        const o = q && q.options;
        if (Array.isArray(o)) return o.map((x, i) => ({
          key: (x && (x.id || x.key || x.label)) || "ABCDEFGH"[i] || String(i + 1),
          text: String((x && (x.text != null ? x.text : x.content)) != null ? (x.text != null ? x.text : x.content) : x || "")
        }));
        if (o && typeof o === "object") return Object.keys(o).map((k) => ({ key: k, text: String(o[k]) }));
        return [];
      };
      const ansList = (q) => {
        const a = q && q.answer;
        if (Array.isArray(a)) return a.map((x) => String(x).trim().toUpperCase()).filter(Boolean);
        if (typeof a === "string") return a.toUpperCase().replace(/[^A-Z]/g, "").split("").filter(Boolean);
        return [];
      };
      const isMulti = (q) => /多|不定/.test(String(q && q.type || ""));
      const titleOf = (q) => String((q && (q.title || q.question || q.content || q.q || q.stem)) || "");

      let session = null;
      let timerId = null;
      let root = null;

      const loadSession = () => { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } };
      const saveSession = () => { try { localStorage.setItem(SKEY, JSON.stringify(session)); } catch (e) {} };
      const clearSession = () => { try { localStorage.removeItem(SKEY); } catch (e) {} };
      const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HKEY) || "[]"); } catch (e) { return []; } };
      const saveHistory = (rec) => { try { const h = loadHistory(); h.unshift(rec); localStorage.setItem(HKEY, JSON.stringify(h.slice(0, 20))); } catch (e) {} };

      const remaining = () => (session ? Math.max(0, session.durationSec - Math.floor((Date.now() - session.startedAt) / 1000)) : 0);
      const fmt = (sec) => {
        const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
        return (h > 0 ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(s).padStart(2, "0");
      };

      function el(tag, style, html) {
        const n = document.createElement(tag);
        if (style) n.setAttribute("style", style);
        if (html != null) n.innerHTML = html;
        return n;
      }

      function ensureRoot() {
        if (root && document.body.contains(root)) return root;
        root = el("div", "position:fixed;inset:0;z-index:99999;background:rgba(8,10,16,.72);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(2px)");
        root.id = "examOverlay";
        document.body.appendChild(root);
        return root;
      }
      function closeOverlay() { if (timerId) { clearInterval(timerId); timerId = null; } if (root) { root.remove(); root = null; } }

      function panel(title) {
        const r = ensureRoot();
        r.innerHTML = "";
        const box = el("div", "background:#171a21;color:#e7e9ef;width:min(880px,100%);max-height:92vh;overflow:auto;border-radius:14px;border:1px solid #2b3040;box-shadow:0 20px 60px rgba(0,0,0,.5)");
        const head = el("div", "display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #262b39");
        head.appendChild(el("div", "font-size:15px;font-weight:700", title));
        const x = el("button", "background:transparent;border:0;color:#9aa3b2;font-size:20px;cursor:pointer;line-height:1", "&times;");
        x.onclick = () => { if (session && !session.submitted) { if (!confirm("考试进行中，关闭后可在刷新后继续。确定关闭？")) return; } closeOverlay(); };
        head.appendChild(x);
        box.appendChild(head);
        const body = el("div", "padding:16px 18px");
        box.appendChild(body);
        r.appendChild(box);
        return body;
      }

      function renderSetup() {
        const body = panel("模拟考试");
        const subjects = ["全部", ...new Set(allQuestions.map((q) => q.subject).filter(Boolean))];
        const wrap = el("div", "display:grid;gap:14px");
        const mk = (label, opts, val) => {
          const row = el("div", "display:grid;grid-template-columns:110px 1fr;align-items:center;gap:10px");
          row.appendChild(el("div", "font-size:13px;opacity:.85", label));
          const sel = document.createElement("select");
          sel.setAttribute("style", "background:#0f1218;color:#e7e9ef;border:1px solid #2b3040;border-radius:9px;padding:8px 10px;font-size:13px");
          opts.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; if (v === val) o.selected = true; sel.appendChild(o); });
          row.appendChild(sel);
          wrap.appendChild(row);
          return sel;
        };
        const selScope = mk("科目范围", subjects.map((s) => [s, s]), "全部");
        const selCount = mk("题目数量", [["50", "50 题"], ["100", "100 题"], ["150", "150 题"], ["200", "200 题"]], "100");
        const selDur = mk("考试时长", [["60", "60 分钟"], ["120", "120 分钟"], ["180", "180 分钟"], ["240", "240 分钟"]], "180");
        body.appendChild(wrap);

        const tip = el("div", "margin-top:14px;font-size:12px;line-height:1.7;opacity:.7",
          "说明：只抽客观题（单选/多选/不定项）；倒计时按时间戳计算，切后台不漂移；交卷后按题判分并记入成绩历史；考试作答不写入日常练习记录。");
        body.appendChild(tip);

        const btn = el("button", "margin-top:16px;width:100%;padding:11px;border-radius:10px;border:0;background:#4f6bff;color:#fff;font-size:14px;font-weight:700;cursor:pointer", "开始考试");
        btn.onclick = () => startExam(selScope.value, Number(selCount.value), Number(selDur.value) * 60);
        body.appendChild(btn);

        const hist = loadHistory();
        if (hist.length) {
          const hw = el("div", "margin-top:18px;border-top:1px solid #262b39;padding-top:12px");
          hw.appendChild(el("div", "font-size:13px;font-weight:700;margin-bottom:8px", "最近成绩"));
          hist.slice(0, 5).forEach((h) => {
            hw.appendChild(el("div", "font-size:12px;opacity:.8;padding:4px 0",
              new Date(h.at).toLocaleString() + "　" + h.scope + "　" + h.score + "/" + h.total + "　正确率 " + h.rate + "%"));
          });
          body.appendChild(hw);
        }
      }

      function startExam(scope, count, durationSec) {
        let pool = allQuestions.filter((q) => {
          if (/主观/.test(String(q.type || ""))) return false;
          if (scope !== "全部" && q.subject !== scope) return false;
          return true;
        });
        if (pool.length < 10) { showToast("当前范围可用题目太少，请切换科目范围", "warn"); return; }
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        const picked = pool.slice(0, Math.min(count, pool.length));
        session = {
          id: "exam-" + Date.now(),
          startedAt: Date.now(),
          durationSec,
          scope,
          ids: picked.map((q) => q.id),
          answers: {},
          submitted: false,
          idx: 0
        };
        saveSession();
        renderRun();
      }

      function byId(id) { return getQById(id); }

      function renderRun() {
        if (!session) return renderSetup();
        if (remaining() <= 0) return submitExam(true);
        const body = panel("模拟考试 · " + session.scope);
        const top = el("div", "display:flex;align-items:center;justify-content:space-between;margin-bottom:12px");
        const prog = el("div", "font-size:13px;opacity:.85", "第 " + (session.idx + 1) + " / " + session.ids.length + " 题");
        const clock = el("div", "font-family:ui-monospace,monospace;font-size:18px;font-weight:800;color:#ff6b81", fmt(remaining()));
        top.appendChild(prog); top.appendChild(clock);
        body.appendChild(top);

        const q = byId(session.ids[session.idx]);
        if (!q) {
          // 题库可能仍在分科渐进加载，该题尚未进内存：只等待重试，绝不重置题号
          body.appendChild(el("div", "padding:24px 0;text-align:center;font-size:13px;opacity:.8", "题库加载中，请稍候…"));
          if (timerId) { clearInterval(timerId); timerId = null; }
          setTimeout(() => { if (session && root) renderRun(); }, 800);
          return;
        }
        body.appendChild(el("div", "font-size:14px;line-height:1.8;margin:6px 0 14px;white-space:pre-wrap", titleOf(q).replace(/</g, "&lt;")));

        const cur = new Set(session.answers[q.id] || []);
        const multi = isMulti(q);
        const optsWrap = el("div", "display:grid;gap:8px");
        optList(q).forEach((o) => {
          const picked = cur.has(o.key);
          const row = el("button",
            "text-align:left;display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:13px;line-height:1.6;" +
            "border:1px solid " + (picked ? "#4f6bff" : "#2b3040") + ";background:" + (picked ? "rgba(79,107,255,.18)" : "#12161d") + ";color:#e7e9ef");
          const k = el("span", "font-weight:800;min-width:18px", o.key);
          const t = el("span", "flex:1;white-space:pre-wrap", String(o.text).replace(/</g, "&lt;"));
          row.appendChild(k); row.appendChild(t);
          row.onclick = () => {
            const set = new Set(session.answers[q.id] || []);
            if (multi) { set.has(o.key) ? set.delete(o.key) : set.add(o.key); }
            else { set.clear(); set.add(o.key); }
            session.answers[q.id] = [...set];
            saveSession();
            renderRun();
          };
          optsWrap.appendChild(row);
        });
        body.appendChild(optsWrap);
        body.appendChild(el("div", "margin-top:8px;font-size:11px;opacity:.6", multi ? "多选题：可多选，选完点下一题" : "单选题：点选即记录"));

        // 题号网格
        const grid = el("div", "display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;padding-top:12px;border-top:1px solid #262b39");
        session.ids.forEach((id, i) => {
          const answered = (session.answers[id] || []).length > 0;
          const b = el("button",
            "width:30px;height:30px;border-radius:7px;font-size:11px;cursor:pointer;border:1px solid " + (i === session.idx ? "#4f6bff" : "#2b3040") + ";" +
            "background:" + (i === session.idx ? "#4f6bff" : answered ? "rgba(61,214,140,.22)" : "#12161d") + ";color:#e7e9ef", String(i + 1));
          b.onclick = () => { session.idx = i; saveSession(); renderRun(); };
          grid.appendChild(b);
        });
        body.appendChild(grid);

        const bar = el("div", "display:flex;gap:10px;margin-top:14px");
        const prev = el("button", "flex:1;padding:10px;border-radius:10px;border:1px solid #2b3040;background:#12161d;color:#e7e9ef;cursor:pointer", "上一题");
        prev.onclick = () => { session.idx = Math.max(0, session.idx - 1); saveSession(); renderRun(); };
        const next = el("button", "flex:1;padding:10px;border-radius:10px;border:1px solid #2b3040;background:#12161d;color:#e7e9ef;cursor:pointer", "下一题");
        next.onclick = () => { session.idx = Math.min(session.ids.length - 1, session.idx + 1); saveSession(); renderRun(); };
        const sub = el("button", "flex:1.2;padding:10px;border-radius:10px;border:0;background:#e05561;color:#fff;font-weight:700;cursor:pointer", "交卷");
        sub.onclick = () => submitExam(false);
        bar.appendChild(prev); bar.appendChild(next); bar.appendChild(sub);
        body.appendChild(bar);

        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
          if (!session) return;
          const rem = remaining();
          if (clock) clock.textContent = fmt(rem);
          if (rem <= 0) submitExam(true);
        }, 1000);
      }

      function submitExam(auto) {
        if (!session) return;
        const unanswered = session.ids.length - Object.keys(session.answers).filter((k) => (session.answers[k] || []).length).length;
        if (!auto) {
          const msg = "还有 " + unanswered + " 题未作答。确定交卷？交卷后不可修改。";
          if (!confirm(msg)) return;
        }
        const bySubject = {};
        let correct = 0, objective = 0;
        const wrong = [];
        session.ids.forEach((id) => {
          const q = byId(id);
          if (!q) return;
          objective++;
          const right = ansList(q).sort().join("");
          const mine = (session.answers[id] || []).map((x) => String(x).toUpperCase()).sort().join("");
          const ok = right && mine && right === mine;
          if (ok) correct++;
          else wrong.push({ id, title: titleOf(q).slice(0, 60), right, mine: mine || "(未答)" });
          const s = q.subject || "未分类";
          if (!bySubject[s]) bySubject[s] = { total: 0, correct: 0 };
          bySubject[s].total++;
          if (ok) bySubject[s].correct++;
        });
        const rate = objective ? Math.round((correct / objective) * 1000) / 10 : 0;
        const result = { score: correct, total: objective, rate, bySubject, wrong, scope: session.scope, at: Date.now(), auto: !!auto };
        saveHistory(result);
        clearSession();
        session = null;
        if (timerId) { clearInterval(timerId); timerId = null; }
        renderResult(result);
      }

      function renderResult(r) {
        const body = panel("考试成绩");
        body.appendChild(el("div", "text-align:center;padding:8px 0 14px",
          '<div style="font-size:40px;font-weight:800;color:' + (r.rate >= 60 ? "#3dd68c" : "#ff6b81") + '">' + r.score + " / " + r.total + "</div>" +
          '<div style="font-size:13px;opacity:.8;margin-top:4px">正确率 ' + r.rate + "%　·　" + r.scope + "　·　" + (r.auto ? "时间到自动交卷" : "手动交卷") + "</div>"));

        const subj = Object.keys(r.bySubject).sort();
        if (subj.length) {
          body.appendChild(el("div", "font-size:13px;font-weight:700;margin:6px 0 8px", "分科得分"));
          const t = el("div", "display:grid;gap:5px");
          subj.forEach((s) => {
            const x = r.bySubject[s];
            t.appendChild(el("div", "display:flex;justify-content:space-between;font-size:12px;padding:4px 8px;background:#12161d;border-radius:7px",
              "<span>" + s + "</span><span>" + x.correct + " / " + x.total + "（" + (x.total ? Math.round((x.correct / x.total) * 100) : 0) + "%）</span>"));
          });
          body.appendChild(t);
        }
        if (r.wrong.length) {
          body.appendChild(el("div", "font-size:13px;font-weight:700;margin:14px 0 8px", "错题 " + r.wrong.length + " 道"));
          const w = el("div", "display:grid;gap:5px;max-height:220px;overflow:auto");
          r.wrong.forEach((x) => {
            w.appendChild(el("div", "font-size:12px;padding:5px 8px;background:#12161d;border-radius:7px;border-left:3px solid #e05561",
              "id " + x.id + "　" + x.title + "…　<span style='color:#9aa3b2'>你的:" + x.mine + " 正确:" + x.right + "</span>"));
          });
          body.appendChild(w);
        }
        const bar = el("div", "display:flex;gap:10px;margin-top:16px");
        const again = el("button", "flex:1;padding:10px;border-radius:10px;border:0;background:#4f6bff;color:#fff;font-weight:700;cursor:pointer", "再考一次");
        again.onclick = () => renderSetup();
        const close = el("button", "flex:1;padding:10px;border-radius:10px;border:1px solid #2b3040;background:#12161d;color:#e7e9ef;cursor:pointer", "关闭");
        close.onclick = () => closeOverlay();
        bar.appendChild(again); bar.appendChild(close);
        body.appendChild(bar);
      }

      window.__openExam = function () {
        if (allQuestions.length < 10) { showToast("题库尚在加载，请稍候再开始模拟考试", "warn"); return; }
        session = loadSession();
        if (session && !session.submitted && remaining() > 0) renderRun();
        else { if (session) clearSession(); session = null; renderSetup(); }
      };

      // 断点续考：轮询等题库就绪后调用 __openExam()（其内部会按时间戳恢复剩余时间与题号）
      (function resumeIfNeeded() {
        const s = loadSession();
        if (!s || s.submitted) return;
        const rem = Math.max(0, (s.durationSec || 0) - Math.floor((Date.now() - (s.startedAt || 0)) / 1000));
        if (rem <= 0) return; // 时间已过，不再恢复
        let tries = 0;
        const tick = () => {
          if (allQuestions && allQuestions.length >= 10) {
            try { window.__openExam(); } catch (e) {}
            return;
          }
          if (++tries > 120) return; // 最多等 60 秒
          setTimeout(tick, 500);
        };
        setTimeout(tick, 300);
      })();
    })();

