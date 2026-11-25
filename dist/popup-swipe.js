const popupSelector='dialog[open]:not(.review-visit), #moreNavigation, [data-swipe-notice]';

function dismiss(popup){
 if(!popup.isConnected)return;
 if(popup.matches('dialog')){
  if(!popup.open)return;
  // Use the same cancellation path as Escape (promotion, consent, resign, etc.).
  if(popup.dispatchEvent(new Event('cancel',{cancelable:true}))&&popup.open)popup.close();
 }else if(popup.id==='moreNavigation'){
  if(typeof popup.hidePopover==='function'){if(popup.matches(':popover-open'))popup.hidePopover()}
  else if(!popup.hidden)document.getElementById('moreNavigationButton')?.click();
 }else popup.remove();
}

let cancelActive;
document.addEventListener('touchstart',start,{passive:true,capture:true});
function start(event){
 cancelActive?.();
 if(event.touches.length!==1||!matchMedia('(max-width: 900px), (pointer: coarse)').matches)return;
 const popup=event.target.closest?.(popupSelector);
 if(!popup||event.target.closest('input,textarea,select,[contenteditable=true],.board')||popup.dataset.swiping)return;
 const touch=event.touches[0],x=touch.clientX,y=touch.clientY;
 // A tap on the modal backdrop is outside the card.
 const rect=popup.getBoundingClientRect();
 if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return;
 let dragging=false,offset=0;
 cancelActive=cancel;
 popup.addEventListener('touchmove',move,{passive:false});
 popup.addEventListener('touchend',end,{passive:false});
 popup.addEventListener('touchcancel',cancel,{passive:true});
 function cleanup(){
  cancelActive=undefined;
  popup.removeEventListener('touchmove',move);
  popup.removeEventListener('touchend',end);
  popup.removeEventListener('touchcancel',cancel);
 }
 function restore(){popup.style.removeProperty('translate');delete popup.dataset.swiping}
 function cancel(){cleanup();restore()}
 function move(e){
  if(e.touches.length!==1){cancel();return}
  const dx=e.touches[0].clientX-x,dy=e.touches[0].clientY-y;
  if(!dragging){
   if(Math.max(Math.abs(dx),Math.abs(dy))<10)return;
   if(Math.abs(dx)<Math.abs(dy)*1.35){cancel();return}
   dragging=true;popup.dataset.swiping='true';
  }
  if(e.cancelable)e.preventDefault();
  offset=dx;popup.style.translate=dx+'px 0';
 }
 function end(e){
  cleanup();
  if(!dragging)return;
  if(e.cancelable)e.preventDefault();
  const dx=e.changedTouches[0].clientX-x;
  const accepted=Math.abs(dx)>=Math.max(44,Math.min(88,rect.width*.23));
  const dest=accepted?Math.sign(dx)*(innerWidth+rect.width)/2:0;
  const effect=popup.animate([{translate:offset+'px 0'},{translate:dest+'px 0'}],{duration:accepted?150:130,easing:'ease-out',fill:'forwards'});
  effect.onfinish=()=>{if(accepted)dismiss(popup);restore();effect.cancel()};
 }
}
