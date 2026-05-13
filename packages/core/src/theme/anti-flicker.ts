export const antiFlickerScript = `
(function(){
  try{
    var key='theme';
    var attr='data-theme';
    var t=localStorage.getItem(key)||'system';
    if(t==='system'){
      t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
    }
    document.documentElement.setAttribute(attr,t);
  }catch(e){}
})();
`.trim();