import {Chess} from './vendor/chess.js';

export function squareCenter(square,flipped=false){
 if(!/^[a-h][1-8]$/.test(square))return null;
 const file=square.charCodeAt(0)-97,rank=Number(square[1])-1;
 return [(flipped?7-file:file)*100+50,(flipped?rank:7-rank)*100+50];
}
function legalMove(fen,move){
 try{const c=new Chess(fen);return c.move({from:move.from,to:move.to,promotion:move.promotion||'q'})}catch{return null}
}
export function reviewArrows({fen,previous,next,played,comparison=false}){
 const out=[];
 const upcoming=next&&legalMove(fen,next);
 if(upcoming)out.push({...upcoming,kind:'next',label:comparison?'Alternativa suggerita':'Prossima mossa della variante'});
 const actual=comparison&&played&&legalMove(fen,played);
 if(actual&&(!upcoming||actual.from!==upcoming.from||actual.to!==upcoming.to||actual.promotion!==upcoming.promotion))out.unshift({...actual,kind:'played',label:'Mossa giocata in partita'});
 if(!out.length&&previous){const checked=legalMove(previous.before,previous);if(checked&&checked.after===fen)out.push({...checked,kind:'played',label:'Mossa appena mostrata'});}
 return out;
}
export function arrowGeometry(move,flipped=false){
 const from=squareCenter(move.from,flipped),to=squareCenter(move.to,flipped);
 if(!from||!to||move.from===move.to)return null;
 const dx=to[0]-from[0],dy=to[1]-from[1];
 // Knights follow a right-angle path, so the destination remains unmistakable.
 const knight=Math.abs(dx)*Math.abs(dy)===20000&&[100,200].includes(Math.abs(dx));
 const bend=knight?(Math.abs(dx)>Math.abs(dy)?[to[0],from[1]]:[from[0],to[1]]):from;
 const length=Math.hypot(to[0]-bend[0],to[1]-bend[1]),ux=(to[0]-bend[0])/length,uy=(to[1]-bend[1])/length;
 const tip=[to[0]-ux*9,to[1]-uy*9],neck=[to[0]-ux*36,to[1]-uy*36];
 return {path:`M ${from.join(' ')} ${knight?'L '+bend.join(' ')+' ':''}L ${neck.join(' ')}`,head:[tip,[neck[0]-uy*20,neck[1]+ux*20],[neck[0]+uy*20,neck[1]-ux*20]].map(p=>p.join(',')).join(' ')};
}
export function renderReviewArrows(board,arrows,flipped){
 board.querySelector('.review-arrows')?.remove();
 if(!arrows.length)return;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 800 800');svg.setAttribute('class','review-arrows');svg.setAttribute('aria-hidden','true');
 for(const arrow of arrows){const shape=arrowGeometry(arrow,flipped);if(!shape)continue;const g=document.createElementNS(ns,'g');g.setAttribute('class','review-arrow '+arrow.kind);const path=document.createElementNS(ns,'path');path.setAttribute('d',shape.path);const head=document.createElementNS(ns,'polygon');head.setAttribute('points',shape.head);g.append(path,head);svg.append(g);}
 board.append(svg);
}

// Geometric attacks and immediately legal captures are intentionally distinct.
export function attackArrows(fen,focus,includeEmpty=false){
 let c;try{c=new Chess(fen)}catch{return []}
 const piece=c.get(focus);if(!piece||c.isGameOver())return [];
 const captures=c.moves({verbose:true}).filter(m=>m.captured);
 const out=[];
 for(let f=0;f<8;f++)for(let r=1;r<=8;r++){
  const square=String.fromCharCode(97+f)+r,target=c.get(square);
  if(square===focus||target?.color===piece.color||(!target&&!includeEmpty))continue;
  if(!c.attackers(square,piece.color).includes(focus))continue;
  const legal=captures.some(m=>m.from===focus&&m.to===square);
  out.push({from:focus,to:square,kind:legal?'capture':target?'attack':'control',label:legal?'Cattura legale ora':target?'Pezzo sotto attacco':'Casa controllata · non una mossa'});
 }
 for(const m of captures)if((m.to===focus||(m.flags.includes('e')&&(m.from===focus||m.to[0]+m.from[1]===focus)))&&!out.some(a=>a.from===m.from&&a.to===m.to))out.push({from:m.from,to:m.to,kind:'capture',label:'Cattura legale ora'});
 return out;
}
