// A fast navigation finishes before the overlay is shown.
(()=>{
 const pending=new Set();
 let timer,overlay;
 function begin(){
  const key=Symbol();pending.add(key);
  if(!timer&&!overlay)timer=setTimeout(()=>{
   timer=null;overlay=document.createElement('div');overlay.className='ply-loading-screen';
   overlay.setAttribute('role','status');overlay.setAttribute('aria-label',({it:'Caricamento',en:'Loading',de:'Laden',fr:'Chargement',es:'Cargando'})[document.documentElement.lang]||'Loading');
   overlay.innerHTML='<span class="ply-loading-mark" aria-hidden="true"></span>';
   document.body.append(overlay);
  },220);
  return ()=>{pending.delete(key);if(!pending.size){clearTimeout(timer);timer=null;overlay?.remove();overlay=null}};
 }
 window.plyBeginLoading=begin;
 const finish=begin();window.addEventListener('load',finish,{once:true});window.addEventListener('pagehide',finish,{once:true});
})();
