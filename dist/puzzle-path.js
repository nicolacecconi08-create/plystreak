import {Chess} from './vendor/chess.js';
import {legalVariation,uciOf} from './best-comparison.js';
// A bounded training line ends on the learner's turn, never on an unseen reply.
export function trainingPath(fen,pv,maxPlies=5){
 const requested=pv.slice(0,maxPlies),line=legalVariation(fen,requested);
 if(line.moves.length!==requested.length)throw Error('La variante contiene un passaggio non valido: serve una nuova verifica.');
 if(line.moves.length%2===0)throw Error('La variante si interrompe prima della tua risposta: soluzione incompleta.');
 if(!line.moves.length)throw Error('La variante non contiene una soluzione legale.');
 return line;
}
export function pathMove(line,ply,uci){return line?.moves[ply]&&uciOf(line.moves[ply])===uci;}
export function pathComplete(line,ply){return !!line?.moves.length&&ply===line.moves.length;}
export function verifiedPath(fen,pv){const line=legalVariation(fen,pv);return line.moves.length===pv.length&&line.moves.length%2===1?line:null;}
export function pathEnd(line){return new Chess(line.positions.at(-1));}
export function goalReached(card,line){
 if(card.source==='personal')return true;
 if(card.theme==='king')return pathEnd(line).isCheckmate();
 if(card.goal==='promotion')return line.moves.some(m=>m.promotion&&m.color===new Chess(line.positions[0]).turn());
 if(card.goal==='queen-recovery')return line.moves.some(m=>m.captured==='q'&&m.color===new Chess(line.positions[0]).turn());
 return true;
}
