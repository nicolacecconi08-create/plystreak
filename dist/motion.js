import {getSettings} from './settings.js';
import {Chess} from './vendor/chess.js';
const previous=new WeakMap();
const placement=fen=>fen.split(' ')[0];
function connectingMove(from,to){try{const c=new Chess(from);return c.moves({verbose:true}).find(m=>placement(m.after)===placement(to))}catch{return null}}
export function animateBoard(board,fen,flipped){
 const current={fen,flipped,rects:new Map([...board.querySelectorAll('[data-sq]')].map(s=>[s.dataset.sq,s.getBoundingClientRect()]))};
 const old=previous.get(board);previous.set(board,current);
 const c=new Chess(fen),mate=c.isCheckmate(),motion=getSettings().animation!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 board.dataset.mate=String(mate);
 if(mate){const king=c.board().flat().find(p=>p?.type==='k'&&p.color===c.turn()),square=board.querySelector(`[data-sq="${king.square}"]`);square?.classList.add('mate-king');
 if(motion&&old?.fen!==fen){board.animate([{boxShadow:'0 0 0 0 #d96b6300'},{boxShadow:'0 0 0 10px #d96b6366'},{boxShadow:'0 0 0 0 #d96b6300'}],{duration:900,easing:'ease-out'});square?.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:850,delay:220,easing:'ease-in-out'})}}

 if(getSettings().animation==='off'||!old||old.flipped!==flipped||placement(old.fen)===placement(fen)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let m=connectingMove(old.fen,fen),reverse=false;
 if(!m){m=connectingMove(fen,old.fen);reverse=true}if(!m)return;
 const pairs=[[m.from,m.to]];
 if(m.flags.includes('k'))pairs.push(['h'+m.from[1],'f'+m.from[1]]);
 if(m.flags.includes('q'))pairs.push(['a'+m.from[1],'d'+m.from[1]]);
 for(let [from,to] of pairs){if(reverse)[from,to]=[to,from];const image=board.querySelector(`[data-sq="${to}"] img`),a=old.rects.get(from),b=current.rects.get(to);if(!image||!a||!b)continue;
 const square=image.parentElement;square.style.zIndex='5';
 const animation=image.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px)`},{transform:'translate(0,0)'}],{duration:getSettings().animation==='slow'?380:220,easing:'cubic-bezier(.2,.7,.2,1)'});
 animation.onfinish=animation.oncancel=()=>{square.style.zIndex=''};
 }
}
