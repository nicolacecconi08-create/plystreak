import {getSettings} from './settings.js';
import {Chess} from './vendor/chess.js';
const previous=new WeakMap();
const placement=fen=>fen.split(' ')[0];
function connectingMove(from,to){try{const c=new Chess(from);return c.moves({verbose:true}).find(m=>placement(m.after)===placement(to))}catch{return null}}
export function animateBoard(board,fen,flipped,options={}){
 const current={fen,flipped,rects:new Map([...board.querySelectorAll('[data-sq]')].map(s=>[s.dataset.sq,s.getBoundingClientRect()]))};
 const old=previous.get(board);previous.set(board,current);
 if(old?.fen!==fen)for(const animation of old?.drawAnimations||[])animation.cancel();
 else{current.drawAnimations=old?.drawAnimations;current.drawCelebrated=old?.drawCelebrated;}
 const c=new Chess(fen),mate=c.isCheckmate(),motion=getSettings().animation!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 board.dataset.mate=String(mate);
 const draw=!mate&&(options.draw??c.isDraw());board.dataset.draw=String(draw);
 if(draw&&motion&&!options.rapid&&!current.drawCelebrated){
  current.drawCelebrated=true;const color='#b7a77b';
  const targets=[board,...c.board().flat().filter(p=>p?.type==='k').map(p=>board.querySelector(`[data-sq="${p.square}"]`)).filter(Boolean)];
  current.drawAnimations=targets.map((target,i)=>target.animate(i?[{boxShadow:`inset 0 0 0 0 ${color}00`},{boxShadow:`inset 0 0 26px 9px ${color}aa`,offset:.45},{boxShadow:`inset 0 0 0 0 ${color}00`}]:[{boxShadow:`0 0 0 0 ${color}00`},{boxShadow:`0 0 0 7px ${color}77`,offset:.45},{boxShadow:`0 0 0 0 ${color}00`}],{duration:1100,easing:'ease-in-out',fill:'none'}));
 }
 if(!draw){current.drawCelebrated=false;for(const animation of current.drawAnimations||[])animation.cancel();current.drawAnimations=[];}
 if(mate){const king=c.board().flat().find(p=>p?.type==='k'&&p.color===c.turn()),square=board.querySelector(`[data-sq="${king.square}"]`);square?.classList.add('mate-king');
 if(motion&&!options.rapid&&old?.fen!==fen){board.animate([{boxShadow:'0 0 0 0 #d96b6300'},{boxShadow:'0 0 0 10px #d96b6366'},{boxShadow:'0 0 0 0 #d96b6300'}],{duration:900,easing:'ease-out'});square?.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:850,delay:220,easing:'ease-in-out'})}}

 if(getSettings().animation==='off'||!old||old.flipped!==flipped||placement(old.fen)===placement(fen)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let m=connectingMove(old.fen,fen),reverse=false;
 if(!m){m=connectingMove(fen,old.fen);reverse=true}if(!m)return;
 const pairs=[[m.from,m.to]];
 if(m.flags.includes('k'))pairs.push(['h'+m.from[1],'f'+m.from[1]]);
 if(m.flags.includes('q'))pairs.push(['a'+m.from[1],'d'+m.from[1]]);
 for(let [from,to] of pairs){if(reverse)[from,to]=[to,from];const image=board.querySelector(`[data-sq="${to}"] img`),a=old.rects.get(from),b=current.rects.get(to);if(!image||!a||!b)continue;
 const square=image.parentElement;square.style.zIndex='5';
 const animation=image.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px)`},{transform:'translate(0,0)'}],{duration:options.duration??(getSettings().animation==='slow'?380:220),easing:'cubic-bezier(.2,.7,.2,1)'});
 animation.onfinish=animation.oncancel=()=>{square.style.zIndex=''};
 }
}
