import {Chess} from './vendor/chess.js';
const noun=p=>({p:'il pedone',n:'il cavallo',b:'l’alfiere',r:'la torre',q:'la donna',k:'il re'})[p];
export function positionalFacts(move){
 const old=new Chess(move.before),now=new Chess(move.after),side=move.color,out=[];
 if(now.isGameOver())return out;
 const rights=side==='w'?/[KQ]/:/[kq]/;
 if(move.piece==='k'&&!/[kq]/.test(move.flags)&&rights.test(move.before.split(' ')[2])&&!rights.test(move.after.split(' ')[2]))out.push('Muovendo il re rinunci definitivamente all’arrocco, anche se tornerà nella casa di partenza. Dovrai proteggerlo e far entrare in gioco le torri in un altro modo.');
 const captures=now.moves({verbose:true}).filter(m=>m.captured);
 // Describe an actual legal capture, never an attack by an absolutely pinned piece.
 for(const p of now.board().flat().filter(p=>p&&p.color===side&&p.type!=='k'&&p.square!==move.to)){
  if(old.get(p.square)?.type===p.type&&old.attackers(p.square,side).includes(move.from)&&!now.isAttacked(p.square,side)&&captures.some(m=>m.to===p.square)){
   out.push(`Spostando ${noun(move.piece)} lasci ${noun(p.type)} senza protezione: l’avversario può catturarlo già al prossimo turno. Prima di attaccare altrove, controlla se hai una risposta che compensi l’eventuale perdita.`);break;
  }
 }
 if(move.piece==='p'&&!move.promotion){
  const file=move.to.charCodeAt(0),rank=+move.to[1],direction=side==='w'?1:-1;
  const blockers=now.board().flat().some(p=>p&&p.color!==side&&p.type==='p'&&Math.abs(p.square.charCodeAt(0)-file)<=1&&(+p.square[1]-rank)*direction>0);
  if(!blockers)out.push('Questo pedone non ha pedoni avversari davanti, né sulla sua colonna né sulle due vicine. Può diventare una minaccia avanzando verso la promozione, ma il re e gli altri pezzi avversari possono ancora fermarlo.');
 }
 if(move.piece==='r'){
  const file=move.to[0],pawns=now.board().flat().filter(p=>p?.type==='p'&&p.square[0]===file);
  if(!pawns.length)out.push('La torre si trova su una colonna senza pedoni: può cercare di entrare nella metà avversaria. Controlla però gli altri pezzi lungo il percorso: una colonna aperta non significa che il passaggio sia già libero.');
 }
 if(move.piece==='p'&&!move.promotion){
  for(const bishop of now.board().flat().filter(p=>p?.color===side&&p.type==='b')){

   // Count newly reachable empty squares along unobstructed diagonals, not invented legal moves.
   const space=c=>{let n=0;for(const [dx,dy]of [[1,1],[1,-1],[-1,1],[-1,-1]]){let x=bishop.square.charCodeAt(0)-97,y=+bishop.square[1]-1;while((x+=dx)>=0&&x<8&&(y+=dy)>=0&&y<8){if(c.get('abcdefgh'[x]+(y+1)))break;n++;}}return n;};
   if(old.get(bishop.square)?.type==='b'&&space(now)-space(old)>=2){out.push('Il pedone libera una diagonale all’alfiere, che può uscire e partecipare al gioco. Controlla però che la casa scelta sia sicura.');break;}
  }
 }
 return out.slice(0,2);
}
