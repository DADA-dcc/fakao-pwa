
/* 统一 AI 入口：同源 /api/*（Cloudflare Pages Functions）。密钥仅存服务端环境变量，前端不接触任何令牌。 */
window.XS_AI = (function(){
  function post(path, body, timeoutMs){
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ ctrl.abort(); }, timeoutMs || 40000);
    return fetch(path, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body), signal:ctrl.signal })
      .then(function(r){ return r.json().catch(function(){return {};}).then(function(j){ if(!r.ok) throw new Error(j&&j.error?j.error:("AI 接口 HTTP "+r.status)); return j; }); })
      .finally(function(){ clearTimeout(timer); });
  }
  function contentOf(j){ if(!j||!j.content) throw new Error("AI 返回为空"); return j.content; }
  return {
    chat: function(messages, opts){ return post("/api/ai",{messages:messages},(opts||{}).timeoutMs).then(contentOf); },
    explain: function(prompt, followup, opts){ return post("/api/ai",{prompt:prompt,followup:followup||""},(opts||{}).timeoutMs).then(contentOf); },
    grade: function(payload, opts){ return post("/api/grade",payload,(opts||{}).timeoutMs||45000); }
  };
})();
