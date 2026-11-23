
(function(){
  var btn=document.getElementById('aiqa-btn'), panel=document.getElementById('aiqa-panel'), msgs=document.getElementById('aiqa-msgs'), inp=document.getElementById('aiqa-in'), send=document.getElementById('aiqa-send'), close=document.getElementById('aiqa-close'), chips=document.getElementById('aiqa-chips');
  if(!btn||!panel) return;
  var history=[{role:'system',content:'你是「法考答疑助手」，专门服务国家统一法律职业资格考试（客观题与主观题）。要求：1) 先给结论，再给依据；2) 引用法条必须写明法律名称与条文号（如《民法典》第577条），不确定就直说，严禁编造；3) 讲题按「考点→法条→逐项分析→结论」；4) 用简洁中文，适合手机阅读；5) 只回答法考与法律学习相关问题，无关话题礼貌拒绝。'}];
  // 快捷提问
  var quickTexts=['讲一下当前这道题','总结一个法考知识点','给我出一道练习题','我的错题怎么做','还剩多久考试'];
  quickTexts.forEach(function(t){ var b=document.createElement('button'); b.type='button'; b.className='aiqa-chip'; b.textContent=t; b.addEventListener('click',function(){ inp.value=''; askWith(t); }); chips.appendChild(b); });
  function add(role,text,btnFn){ var d=document.createElement('div'); d.className='aiqa-m '+(role==='user'?'aiqa-u':'aiqa-a'); d.textContent=text; if(btnFn){ var b=document.createElement('button'); b.className='aiqa-save'; b.textContent='存成笔记'; b.type='button'; b.addEventListener('click',btnFn); d.appendChild(document.createElement('br')); d.appendChild(b); } msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; }
  function saveToNote(ansText){
    try{
      var text=ansText||'';
      if(typeof userNotes!=='undefined' && typeof STORAGE_KEYS!=='undefined' && typeof safeSaveJSON!=='undefined'){
        var q=(typeof filteredQuestions!=='undefined'&&typeof currentIndex!=='undefined')?filteredQuestions[currentIndex]:null;
        var stamped='\n\n['+(new Date().toLocaleString())+' · AI答疑]\n'+text;
        var key=q?q.id:'ai_general';
        userNotes[key]=(userNotes[key]?userNotes[key]:'')+stamped;
        safeSaveJSON(STORAGE_KEYS.NOTES,userNotes);
        if (typeof showToast === "function") showToast(q ? "已保存到本页题目笔记" : '已保存到"AI答疑"通用笔记', "success");
      } else { if (typeof showToast === "function") showToast("笔记系统未就绪", "warn"); }
    }catch(e){ if (typeof showToast === "function") showToast("保存失败: " + e.message, "error"); }
  }
  btn.addEventListener('click',function(){ panel.classList.toggle('open'); if(panel.classList.contains('open')) inp.focus(); });
  close.addEventListener('click',function(){ panel.classList.remove('open'); });
  // 读取当前题 / 错题上下文
  function getCurrentQuestion(){
    try{ if(typeof filteredQuestions!=='undefined' && typeof currentIndex!=='undefined' && filteredQuestions[currentIndex]){
      var q=filteredQuestions[currentIndex];
      var opts=q.options; var optTxt='';
      if(Array.isArray(opts)){ opts.forEach(function(o,i){ optTxt+='\n'+String.fromCharCode(65+i)+'. '+o; }); }
      else if(opts && typeof opts==='object'){ Object.keys(opts).forEach(function(k){ optTxt+='\n'+k+'. '+opts[k]; }); }
      return '当前题目：'+(q.stem||'')+(optTxt?'\n选项：'+optTxt:'')+(q.answer?'\n标准答案:'+q.answer:'')+(q.explanation?'\n解析:'+q.explanation:'')+'\n';
    }}catch(e){}
    return '';
  }
  function getWrongSummary(){
    try{
      var wrongs=(typeof wrongQuestions!=='undefined'?wrongQuestions:[])||[];
      if(!wrongs.length) return '当前错题本为空。\n';
      var ids=wrongs.slice(0,8); var parts=[];
      ids.forEach(function(id){ var q=(typeof questions!=='undefined')?(questions.find||questions.filter)(function(x){return x.id===id;}) : null; if(q){ parts.push(q.stem||id); } });
      return '我的错题（取前几个题干）：'+parts.join(' / ')+'\n共'+wrongs.length+'题错题，请给复习建议。\n';
    }catch(e){ return ''; }
  }
  function getWrongSubjects(){
    try{
      var wrongs=(typeof wrongQuestions!=='undefined'?wrongQuestions:[])||[];
      var subs=[];
      wrongs.slice(0,12).forEach(function(id){ var q=(typeof questions!=='undefined')?(questions.find||questions.filter)(function(x){return x.id===id;}):null; if(q&&q.subject&&subs.indexOf(q.subject)<0) subs.push(q.subject); });
      return subs.length?subs.join('、'):'';
    }catch(e){ return ''; }
  }
  function askWith(q){
    if(!q||!q.trim()||send.disabled) return;
    var realQ=q;
    if(q==='讲一下当前这道题') realQ='请讲一下这道题：\n'+getCurrentQuestion()+'\n按「考点→法条→逐项分析→结论」讲解。';
    else if(q==='我的错题怎么做') realQ='分析我的错题本并给出复习计划：'+getWrongSummary();
    else if(q==='给我出一道练习题'){ var wsub=getWrongSubjects(); realQ=(wsub?'根据我常错的科目（'+wsub+'），出一道有针对性的法考练习题，含选项、正确答案和解析。':'给出一道理科综合性法考单选题，含选项、正确答案和解析。'); }
    inp.value=''; add('user',realQ); history.push({role:'user',content:realQ});
    send.disabled=true;
    var thinking=document.createElement('div'); thinking.className='aiqa-m aiqa-a'; thinking.textContent='思考中…'; msgs.appendChild(thinking); msgs.scrollTop=msgs.scrollHeight;
    window.XS_AI.chat(history,{maxTokens:900})
      .then(function(ans){ thinking.remove(); var saved=ans; add('assistant',ans,function(){ saveToNote(saved); }); history.push({role:'assistant',content:ans}); })
      .catch(function(e){ thinking.remove(); add('assistant','请求失败：'+(e.name==='AbortError'?'超时':e.message)); })
      .finally(function(){ send.disabled=false; inp.focus(); });
  }
  send.addEventListener('click',function(){ askWith(inp.value); });
  inp.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); askWith(inp.value); } });
})();
