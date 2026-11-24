// Keep the live review document (and its Stockfish worker) mounted while visiting another tool.
import {navigationPage} from './navigation.js';
const pages=new Set(['coach.html','live.html','practice.html','progress.html','settings.html','openings.html','lessons.html','install.html']);
export function mountReviewNavigation(hasGame){
 let dialog,frame,returnTo,returnUrl;
 const close=()=>{if(!dialog)return;dialog.close();dialog.remove();dialog=null;frame=null;returnTo?.focus({preventScroll:true})};
 const visit=url=>{
  returnUrl=location.href;returnTo=document.activeElement;
  dialog=document.createElement('dialog');dialog.className='review-visit';
  frame=document.createElement('iframe');frame.name='plystreak-visit';frame.title='Plystreak';frame.src=url.href;
  frame.addEventListener('load',()=>{
   let page;try{page=frame?.contentWindow.location}catch{return}
   if(!page||page.origin!==location.origin)return;
   if(navigationPage(page.pathname)==='index.html'){
    if(page.search){location.replace(page.href);return}
    history.back();
   }
  });
  dialog.append(frame);document.body.append(dialog);
  history.pushState({plyReviewVisit:url.href},'',url.href);
  dialog.addEventListener('cancel',event=>{event.preventDefault();history.back()});
  dialog.showModal();
 };
 const open=url=>{if(!hasGame()||dialog||!pages.has(navigationPage(url.pathname))||url.origin!==location.origin)return false;visit(url);return true};
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target&&link.target!=='_self'||link.hasAttribute('download'))return;
  if(open(new URL(link.href)))event.preventDefault();
 },true);
 window.addEventListener('ply-open-settings',event=>{if(open(new URL(event.detail,location.href)))event.preventDefault()});
 window.addEventListener('ply-return-review',()=>{if(dialog){const originUrl=returnUrl;close();history.replaceState(null,'',originUrl)}});
 window.addEventListener('popstate',event=>{close();if(event.state?.plyReviewVisit)location.reload()});
}
