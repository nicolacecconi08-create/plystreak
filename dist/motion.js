import {getSettings} from './settings.js';
import {Chess} from './vendor/chess.js';
const previous=new WeakMap();
function kingEffect(square,symbol,color){if(!square?.animate)return;const img=square.querySelector?.('img');img?.animate([{transform:'scale(1) rotate(0deg)'},{transform:'scale(1.18) rotate(-8deg)',offset:.35},{transform:'scale(1) rotate(0deg)'}],{duration:1400,easing:'ease-out'});const mark=square.ownerDocument?.createElement('span');if(!mark)return;mark.textContent=symbol;mark.setAttribute('aria-hidden','true');mark.style.cssText=`position:absolute;z-index:12;right:4%;top:4%;color:${color};font:bold clamp(18px,3vw,30px) system-ui;text-shadow:0 2px 8px #000;pointer-events:none`;square.append(mark);const animation=mark.animate([{opacity:0,transform:'translateY(10px) scale(.5)'},{opacity:1,transform:'translateY(-6px) scale(1.2)',offset:.35},{opacity:0,transform:'translateY(-22px) scale(1)'}],{duration:1600,easing:'ease-out'});animation.onfinish=animation.oncancel=()=>mark.remove()}
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
 const outcome=options.outcome||'';board.dataset.outcome=outcome;
 if(outcome&&outcome!==old?.outcome&&motion&&!options.rapid&&!mate&&!draw){board.animate([{boxShadow:'0 0 0 0 #e9a17300',filter:'brightness(1)'},{boxShadow:'0 0 0 8px #e9a17388',filter:'brightness(1.13)',offset:.38},{boxShadow:'0 0 0 0 #e9a17300',filter:'brightness(1)'}],{duration:1300,easing:'ease-out',fill:'none'})}
 current.outcome=outcome;
 if(draw&&motion&&!options.rapid&&!current.drawCelebrated){
  current.drawCelebrated=true;const color='#e9c992';
  for(const p of c.board().flat().filter(p=>p?.type==='k'))kingEffect(board.querySelector(`[data-sq="${p.square}"]`),'½',color);
  const targets=[board,...c.board().flat().filter(p=>p?.type==='k').map(p=>board.querySelector(`[data-sq="${p.square}"]`)).filter(Boolean)];
  current.drawAnimations=targets.map((target,i)=>target.animate(i?[{boxShadow:`inset 0 0 0 0 ${color}00`},{boxShadow:`inset 0 0 26px 9px ${color}aa`,offset:.45},{boxShadow:`inset 0 0 0 0 ${color}00`}]:[{boxShadow:`0 0 0 0 ${color}00`},{boxShadow:`0 0 0 7px ${color}77`,offset:.45},{boxShadow:`0 0 0 0 ${color}00`}],{duration:1500,easing:'ease-in-out',fill:'none'}));
 }
 if(!draw){current.drawCelebrated=false;for(const animation of current.drawAnimations||[])animation.cancel();current.drawAnimations=[];}
 if(mate){const king=c.board().flat().find(p=>p?.type==='k'&&p.color===c.turn()),square=board.querySelector(`[data-sq="${king.square}"]`);square?.classList.add('mate-king');
 if(motion&&!options.rapid&&old?.fen!==fen){kingEffect(square,'✦','#e9a173');board.animate([{boxShadow:'0 0 0 0 #d96b6300'},{boxShadow:'0 0 0 12px #e9a17399',offset:.38},{boxShadow:'0 0 0 0 #d96b6300'}],{duration:1250,easing:'ease-out',fill:'none'});square?.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:850,delay:220,easing:'ease-in-out'})}}

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
