import {Chess} from './vendor/chess.js';
import {uciOf} from './best-comparison.js';


const square=(x,y)=>x>=0&&x<8&&y>=0&&y<8?'abcdefgh'[x]+(y+1):null;
const leaps=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];

// Construct a fork or skewer. Keep it only if every legal defence leaves a safe queen capture.
export function composeTactic(seed,theme){
 let state=seed>>>0;
 const pick=n=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return Math.floor(state*n/4294967296)};
 for(let trial=0;trial<120;trial++){
  const x=pick(8),y=pick(8),to=square(x,y),side=pick(2)?'w':'b',enemy=side==='w'?'b':'w';
  if(theme==='pin'){
   const dx=pick(2)?1:-1,dy=pick(2)?1:-1;
   const pinned=square(x+dx,y+dy),king=square(x+2*dx,y+2*dy);
   if(!king)continue;
   const [nx,ny]=leaps[pick(8)],qx=x+dx+nx,qy=y+dy+ny;
   const queen=square(qx,qy),rook=pick(2)?square(pick(8),qy):square(qx,pick(8)),own=square(pick(8),pick(8));
   if(!queen||!rook||new Set([to,pinned,king,queen,rook,own]).size!==6)continue;
   const game=new Chess();game.clear();
   for(const [sq,type,color] of [[to,'b',side],[rook,'r',side],[own,'k',side],[king,'k',enemy],[queen,'q',enemy],[pinned,'n',enemy]])game.put({type,color},sq);
   const fen=game.fen().replace(' w ',' '+side+' ');game.load(fen);
   if(game.isCheck()||game.isAttacked(king,side))continue;
   const capture=game.moves({square:rook,verbose:true}).find(m=>m.to===queen&&m.captured==='q');
   if(!capture)continue;
   game.move(capture.san);
   if(game.moves({verbose:true}).some(m=>m.to===queen&&m.captured))continue;
   return {id:'compose-'+seed+'-pin',fen,theme,source:'catalog',difficulty:2,target:queen,objective:'Sfrutta l’inchiodatura per catturare la donna.',solution:uciOf(capture),line:[uciOf(capture)],goal:'queen-recovery',composed:true};
  }
  let from,king,queen;
  if(theme==='fork'){
   const targets=leaps.map(([dx,dy])=>square(x+dx,y+dy)).filter(Boolean);
   if(targets.length<3)continue;
   const take=()=>targets.splice(pick(targets.length),1)[0];
   from=take();king=take();queen=take();
  }else{
   const sign=pick(2)?1:-1,vertical=pick(2),gap=2+pick(3),span=gap+1+pick(3);
   king=square(x+(vertical?0:sign*gap),y+(vertical?sign*gap:0));
   queen=square(x+(vertical?0:sign*span),y+(vertical?sign*span:0));
   from=vertical?square(pick(8),y):square(x,pick(8));
  }
  const own=square(pick(8),pick(8));
  if(!king||!queen||new Set([king,queen,from,to,own]).size!==5)continue;
  const game=new Chess();game.clear();
  for(const [sq,type,color] of [[from,theme==='fork'?'n':'r',side],[own,'k',side],[king,'k',enemy],[queen,'q',enemy]])game.put({type,color},sq);
  const fen=game.fen().replace(' w ',' '+side+' ');
  game.load(fen);
  if(game.isCheck()||game.isAttacked(king,side)||game.isAttacked(queen,side))continue;
  const first=game.moves({square:from,verbose:true}).find(m=>m.to===to);
  if(!first)continue;
  game.move(uciOf(first));
  if(!game.isCheck())continue;
  const replies=game.moves({verbose:true});if(!replies.length)continue;
  let line;
  const forced=replies.every(reply=>{
   const branch=new Chess(reply.after);
   const capture=branch.moves({square:to,verbose:true}).find(m=>m.to===queen&&m.captured==='q');
   if(!capture)return false;
   const end=new Chess(capture.after);
   if(end.moves({verbose:true}).some(m=>m.to===queen&&m.captured))return false;
   line??=[uciOf(first),uciOf(reply),uciOf(capture)];return true;
  });
  if(forced)return {id:'compose-'+seed+'-'+theme,fen,theme,source:'catalog',difficulty:theme==='fork'?1:2,
   objective:theme==='fork'?'Trova il doppio attacco e cattura la donna.':'Trova l’infilata e cattura la donna.',solution:line[0],line,goal:'queen-recovery',composed:true};
 }
 return null;
}
