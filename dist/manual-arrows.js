import {arrowGeometry,dismissArrows,resumeArrows} from './review-arrows.js';
// Manual annotations are independent of engine output and chess legality.
export function toggleArrow(arrows,from,to){if(!/^[a-h][1-8]$/.test(from)||!/^[a-h][1-8]$/.test(to)||from===to)return arrows;return arrows.some(a=>a.from===from&&a.to===to)?arrows.filter(a=>a.from!==from||a.to!==to):[...arrows,{from,to}]}
export function pointFor(s,flip=false){const f=s.charCodeAt(0)-97,r=+s[1]-1;return[(flip?7-f:f)*100+50,(flip?r:7-r)*100+50]}
const mounted=new WeakSet();
export function mountAnnotations(board){if(mounted.has(board))return;mounted.add(board);let arrows=[],start=null,preview=null,mode=false,signature='',tap=null;const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 800 800');svg.setAttribute('aria-hidden','true');svg.classList.add('manual-arrows');const toolbar=document.createElement('div');toolbar.className='annotation-tools';toolbar.innerHTML='<button type="button" aria-pressed="false">Disegna frecce</button><button type="button">Cancella frecce</button><small>Tasto destro e trascina · clic sinistro su una casa vuota per cancellare · su touch attiva e tocca due case</small>';const[toggle,clear]=toolbar.querySelectorAll('button');(board.closest('.board-wrap')||board).after(toolbar);
 function paint(){const flip=board.querySelector('[data-sq]')?.dataset.sq==='h1';svg.replaceChildren();for(const a of [...arrows,...(preview?[preview]:[])]){const shape=arrowGeometry(a,flip);if(!shape)continue;const g=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'path'),head=document.createElementNS(ns,'polygon');g.setAttribute('class','manual-arrow');g.setAttribute('opacity',a===preview?'.55':'.92');path.setAttribute('d',shape.path);head.setAttribute('points',shape.head);g.append(path,head);svg.append(g)}if(svg.parentElement!==board)board.append(svg)}
 function clearAll(){arrows=[];tap=null;preview=null;start=null;dismissArrows(board);paint()}

 function square(e){const r=board.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*8),y=Math.floor((e.clientY-r.top)/r.height*8);if(x<0||x>7||y<0||y>7)return null;const flip=board.querySelector('[data-sq]')?.dataset.sq==='h1';return'abcdefgh'[flip?7-x:x]+(flip?y+1:8-y)}
 toggle.onclick=()=>{mode=!mode;tap=null;board.classList.toggle('annotating',mode);toggle.setAttribute('aria-pressed',String(mode));toggle.textContent=mode?'Termina disegno':'Disegna frecce'};clear.onclick=clearAll;board.addEventListener('contextmenu',e=>e.preventDefault());
 board.addEventListener('pointerdown',e=>{if(e.button!==2&&!mode)return;start=square(e);if(!start)return;e.preventDefault();e.stopImmediatePropagation();board.setPointerCapture(e.pointerId)},true);
 board.addEventListener('pointermove',e=>{if(!start)return;const to=square(e);preview=to&&to!==start?{from:start,to}:null;paint();e.preventDefault()},true);
 board.addEventListener('pointerup',e=>{if(!start)return;e.preventDefault();e.stopImmediatePropagation();const to=square(e);if(to&&start!==to){arrows=toggleArrow(arrows,start,to);tap=null}else if(mode&&to){if(tap&&tap!==to){arrows=toggleArrow(arrows,tap,to);tap=null}else tap=to}start=null;preview=null;paint();if(board.hasPointerCapture(e.pointerId))board.releasePointerCapture(e.pointerId)},true);
 board.addEventListener('pointercancel',()=>{start=null;preview=null;paint()});board.addEventListener('click',e=>{
  if(mode){e.preventDefault();e.stopImmediatePropagation();return}
  const cell=e.target.closest('[data-sq]');if(!cell||e.button!==0)return;
  if(cell.querySelector(':scope > img')){resumeArrows(board);return}
  // Legal empty destinations must still play the selected move (including en passant).
  if(e.pointerType!=='touch'&&!cell.classList.contains('legal')){clearAll();e.preventDefault();e.stopImmediatePropagation()}
 },true);
 board.addEventListener('board-updated',()=>{const next=[...board.querySelectorAll('[data-sq]')].map(s=>s.dataset.sq+':'+(s.querySelector('img')?.getAttribute('src')||'')).sort().join('|');if(signature&&signature!==next){resumeArrows(board);arrows=[];tap=null;preview=null;start=null}signature=next;paint()});paint();
}
if(typeof document!=='undefined')document.querySelectorAll('.board').forEach(mountAnnotations);
