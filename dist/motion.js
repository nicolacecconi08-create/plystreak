import {Chess} from './vendor/chess.js';
const previous=new WeakMap();
const flights=new WeakMap();
function kingEffect(square,symbol,color){if(!square?.animate)return;const img=square.querySelector?.('img');if(symbol!=='✦')img?.animate([{transform:'scale(1) rotate(0deg)'},{transform:'scale(1.18) rotate(-8deg)',offset:.35},{transform:'scale(1) rotate(0deg)'}],{duration:1000,easing:'ease-out'});const mark=square.ownerDocument?.createElement('span');if(!mark)return;mark.textContent=symbol;mark.setAttribute('aria-hidden','true');mark.style.cssText=`position:absolute;z-index:12;right:4%;top:4%;color:${color};font:bold clamp(18px,3vw,30px) system-ui;text-shadow:0 2px 8px #000;pointer-events:none`;square.append(mark);const animation=mark.animate([{opacity:0,transform:'translateY(10px) scale(.5)'},{opacity:1,transform:'translateY(-6px) scale(1.2)',offset:.35},{opacity:0,transform:'translateY(-22px) scale(1)'}],{duration:1150,easing:'ease-out'});animation.onfinish=animation.oncancel=()=>mark.remove()}
function ripple(square,kind,duration){
 if(!square?.ownerDocument)return;
 const mark=square.ownerDocument.createElement('span');
 mark.className='board-ripple ripple-'+kind;
 mark.setAttribute('aria-hidden','true');
 square.append(mark);
 const tilt=kind==='promotion'?45:0;
 const a=mark.animate([{opacity:0,transform:'scale(.32)'},{opacity:.88,offset:.22},{opacity:0,transform:'scale(1.2) rotate('+tilt+'deg)'}],{duration,easing:'ease-out'});
 a.onfinish=a.oncancel=()=>mark.remove();
 return a;
}
const placement=fen=>fen.split(' ')[0];
function connectingMove(from,to){try{const c=new Chess(from);return c.moves({verbose:true}).find(m=>placement(m.after)===placement(to))}catch{return null}}
export function animateBoard(board,fen,flipped,options={}){
 const current={fen,flipped};
 const old=previous.get(board);previous.set(board,current);
 if(old?.fen!==fen)for(const animation of old?.drawAnimations||[])animation.cancel();
 else{current.drawAnimations=old?.drawAnimations;current.drawCelebrated=old?.drawCelebrated;}
 if(old?.fen===fen&&old.flipped===flipped&&!options.rapid)current.ripples=old.ripples;
 else for(const a of old?.ripples||[])a?.cancel();
 const c=new Chess(fen),mate=c.isCheckmate();
 board.dataset.mate=String(mate);
 const draw=!mate&&(options.draw??c.isDraw());board.dataset.draw=String(draw);
 const outcome=options.outcome||'';board.dataset.outcome=outcome;
 if(outcome&&outcome!==old?.outcome&&!options.rapid&&!mate&&!draw){board.animate([{boxShadow:'0 0 0 0 #e9a17300',filter:'brightness(1)'},{boxShadow:'0 0 0 8px #e9a17388',filter:'brightness(1.13)',offset:.38},{boxShadow:'0 0 0 0 #e9a17300',filter:'brightness(1)'}],{duration:1300,easing:'ease-out',fill:'none'})}
 current.outcome=outcome;
 if(draw&&!options.rapid&&!current.drawCelebrated){
  current.drawCelebrated=true;const color='#e9c992';
  for(const p of c.board().flat().filter(p=>p?.type==='k'))kingEffect(board.querySelector(`[data-sq="${p.square}"]`),'½',color);
  const targets=[board,...c.board().flat().filter(p=>p?.type==='k').map(p=>board.querySelector(`[data-sq="${p.square}"]`)).filter(Boolean)];
  current.drawAnimations=targets.map((target,i)=>target.animate(i?[{boxShadow:`inset 0 0 0 0 ${color}00`},{boxShadow:`inset 0 0 26px 9px ${color}aa`,offset:.45},{boxShadow:`inset 0 0 0 0 ${color}00`}]:[{boxShadow:`0 0 0 0 ${color}00`},{boxShadow:`0 0 0 7px ${color}77`,offset:.45},{boxShadow:`0 0 0 0 ${color}00`}],{duration:1150,easing:'ease-in-out',fill:'none'}));
 }
 if(!draw){current.drawCelebrated=false;for(const animation of current.drawAnimations||[])animation.cancel();current.drawAnimations=[];}
 if(mate){const king=c.board().flat().find(p=>p?.type==='k'&&p.color===c.turn()),square=board.querySelector(`[data-sq="${king.square}"]`);square?.classList.add('mate-king');square?.classList.toggle?.('fallen-king',!options.rapid);
 if(!options.rapid&&old?.fen!==fen){kingEffect(square,'✦','#e9a173');board.animate([{boxShadow:'0 0 0 0 #d96b6300'},{boxShadow:'0 0 0 12px #e9a17399',offset:.38},{boxShadow:'0 0 0 0 #d96b6300'}],{duration:1250,easing:'ease-out',fill:'none'});square?.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:850,delay:220,easing:'ease-in-out'})}}

 if(!old||old.flipped!==flipped||placement(old.fen)===placement(fen))return;
 let m=connectingMove(old.fen,fen),reverse=false;
 if(!m){m=connectingMove(fen,old.fen);reverse=true}if(!m)return;
 if(!reverse&&!options.rapid){
  const effects=[];
  if(m.captured)effects.push([m.flags.includes('e')?m.to[0]+m.from[1]:m.to,'capture',360]);
  if(m.promotion)effects.push([m.to,'promotion',760]);
  if(m.flags.includes('k')||m.flags.includes('q'))effects.push([m.to,'castle',520],[(m.flags.includes('k')?'f':'d')+m.from[1],'castle',660]);
  if(c.isCheck()&&!mate){
   const king=c.board().flat().find(p=>p?.type==='k'&&p.color===c.turn());
   if(king)effects.push([king.square,'check',720]);
  }
  if(!effects.length)effects.push([m.to,'move',300]);
  current.ripples=effects.map(([sq,kind,ms])=>ripple(board.querySelector('[data-sq="'+sq+'"]'),kind,ms));
 }
 const pairs=[[m.from,m.to]];
 if(m.flags.includes('k'))pairs.push(['h'+m.from[1],'f'+m.from[1]]);
 if(m.flags.includes('q'))pairs.push(['a'+m.from[1],'d'+m.from[1]]);
 for(let [from,to] of pairs){
  if(reverse)[from,to]=[to,from];
  const image=board.querySelector(`[data-sq="${to}"] img`);
  if(!image)continue;
  const origin=board.querySelector(`[data-sq="${from}"]`).getBoundingClientRect();
  const square=image.parentElement,destination=square.getBoundingClientRect();
  let x=origin.left-destination.left,y=origin.top-destination.top;
  const prior=flights.get(image);
  if(prior){
   // A second move can arrive while this piece is still crossing the board.
   const offset=getComputedStyle(image).translate.split(' ').map(parseFloat);
   x+=offset[0]||0;y+=offset[1]||0;
   prior.stop();
  }
  const distance=Math.hypot(from.charCodeAt(0)-to.charCodeAt(0),Number(from[1])-Number(to[1]));
  const duration=options.duration??Math.min(275,145+distance*20);
  const animation=image.animate([{translate:x+'px '+y+'px'},{translate:'0px 0px'}],{duration,easing:'cubic-bezier(.22,.76,.23,1)'});
  square.style.zIndex='5';
  const flight={stop(){animation.cancel();finish()}};
  function finish(){if(flights.get(image)!==flight)return;flights.delete(image);square.style.zIndex=''}
  flights.set(image,flight);animation.onfinish=animation.oncancel=finish;
 }
}
