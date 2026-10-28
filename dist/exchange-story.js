import {Chess} from './vendor/chess.js';
import {playUci} from './tactics.js';
const values={p:1,n:3,b:3,r:5,q:9,k:0};
const piece={p:'il pedone',n:'il cavallo',b:'l’alfiere',r:'la torre',q:'la donna',k:'il re'};
const balance=(c,side)=>c.board().flat().filter(Boolean).reduce((s,p)=>s+(p.color===side?1:-1)*values[p.type],0);
// Describe only a contiguous, legal capture/recapture sequence. A PV is an example,
// not evidence that the opponent is forced to cooperate or that the game is won.
export function exchangeStory(move,after){
 const c=new Chess(move.after),start=new Chess(move.before),pv=after?.lines?.[0]?.pv||[];
 if(c.isGameOver())return null;
 const reply=playUci(c,pv[0]);if(!reply?.captured)return null;
 const chain=[reply];let last=reply;
 for(const u of pv.slice(1,6)){
  const next=new Chess(c.fen()),m=playUci(next,u);
  if(!m?.captured||m.to!==last.to)break;
  c.load(next.fen());chain.push(m);last=m;
 }
 const related=!!move.captured&&reply.to===move.to;
 const opening=related?`Nella variante mostrata, l’avversario ricattura ${piece[reply.captured]} con ${piece[reply.piece]}.`:`L’avversario può catturare ${piece[reply.captured]} con ${piece[reply.piece]}.`;
 if(chain.length===1&&!related){
  const canRecapture=c.moves({verbose:true}).some(m=>m.captured&&m.to===reply.to);
  return {kind:'capture',text:opening+(canRecapture?' Puoi ricatturare sulla stessa casa: prima di parlare di perdita, confronta ciò che viene scambiato.':' Non hai una ricattura immediata legale sulla stessa casa. Eventuali compensi vanno cercati altrove, senza darli per scontati.')};
 }
 const delta=balance(c,move.color)-balance(start,move.color);
 const more=c.moves({verbose:true}).some(m=>m.captured&&m.to===last.to);
 const recap=chain.length>1?` Nella continuazione riprendi ${piece[chain[1].captured]} con ${piece[chain[1].piece]}.`:'';
 const result=delta===0?'Il bilancio materiale torna pari':delta>0?'Il bilancio materiale di questa sequenza è a tuo favore':'In questa sequenza cedi più materiale di quanto recuperi';
 return {kind:'exchange',delta,text:opening+recap+' '+result+(more?', ma sono ancora possibili ricatture: il conto non è concluso.':'. Questo conto non basta a dire chi sta meglio: contano anche i pezzi rimasti e la sicurezza dei re.')};
}
