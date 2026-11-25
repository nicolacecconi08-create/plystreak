// A fast navigation finishes before the overlay is shown.
(()=>{
 // Paint the entry screen before the application modules mount.
 function isEntry(){
  if(window.top!==window)return false;
  const navigation=performance.getEntriesByType('navigation')[0]?.type;
  if(navigation==='back_forward')return false;
  try{
   const visited=sessionStorage.getItem('plystreak-welcome');
   if(visited&&document.referrer&&new URL(document.referrer).origin===location.origin&&navigation!=='reload')return false;
   sessionStorage.setItem('plystreak-welcome','1');
  }catch{}
  return true;
 }
 if(isEntry()){
  const panel=document.createElement('dialog');
  panel.className='welcome-panel';panel.setAttribute('aria-label','Plystreak');
  panel.innerHTML='<div class="welcome-stage"><div class="welcome-stack"><span class="ply-loading-mark welcome-mark" aria-hidden="true"></span><div class="welcome-content" hidden></div></div></div>';
  document.body.append(panel);panel.showModal();
  const started=performance.now();
  const fallback=setTimeout(()=>{panel.close();panel.remove()},10000);
  window.plyClaimWelcome=()=>{clearTimeout(fallback);delete window.plyClaimWelcome;return {panel,started}};
 }
 const pending=new Set();
 let timer,overlay,exit;
 function begin(){
  const key=Symbol();pending.add(key);
  if(exit){exit.cancel();exit=null;overlay.style.pointerEvents='';}
  if(!timer&&!overlay)timer=setTimeout(()=>{
   timer=null;overlay=document.createElement('div');overlay.className='ply-loading-screen';
   overlay.setAttribute('role','status');overlay.setAttribute('aria-label',({it:'Caricamento',en:'Loading',de:'Laden',fr:'Chargement',es:'Cargando'})[document.documentElement.lang]||'Loading');
   overlay.innerHTML='<span class="ply-loading-mark" aria-hidden="true"></span>';
   document.body.append(overlay);
  },220);
  return ()=>{if(!pending.delete(key))return;if(!pending.size){clearTimeout(timer);timer=null;
   if(!overlay)return;
   overlay.style.pointerEvents='none';
   exit=overlay.animate([{opacity:1},{opacity:0}],{duration:140,easing:'ease-out',fill:'forwards'});
   exit.onfinish=()=>{if(!pending.size){overlay.remove();overlay=null;exit=null}}}};
 }
 window.plyBeginLoading=begin;
 const finish=begin();window.addEventListener('load',finish,{once:true});window.addEventListener('pagehide',finish,{once:true});
})();
