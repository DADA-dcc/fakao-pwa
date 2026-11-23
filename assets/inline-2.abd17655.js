
  document.documentElement.classList.add('fk-booting');
  /* 兜底：初始化异常时也不能让主内容长期不可见 */
  setTimeout(function(){ document.documentElement.classList.remove('fk-booting'); }, 1600);
  