import {t,getLanguage} from './i18n.js';
import {localComment,pieceName} from './coach-localized.js';
import {Chess} from './vendor/chess.js';
import {decodeLine} from './explanations.js';
import {moveDescription,positionNarrative} from './position-narrative.js';
export const LEVELS=[{name:'Primi passi',skill:0,limits:[5,180],description:'Per prendere confidenza. Il motore commette più imprecisioni.'},{name:'Principiante',skill:3,limits:[8,300],description:'Un avversario accessibile per provare i fondamentali.'},{name:'Intermedio',skill:8,limits:[12,500],description:'Una sfida per mettere alla prova i tuoi piani.'},{name:'Avanzato',skill:14,limits:[16,900],description:'Più precisione: controlla bene tattiche e risposte.'},{name:'Esperto',skill:20,limits:[20,1800],description:'La massima forza disponibile con questi limiti di calcolo.'}];
export const pieceNames={p:'pedone',n:'cavallo',b:'alfiere',r:'torre',q:'donna',k:'re'};
export function gameOutcome(c){if(c.isCheckmate())return c.turn()==='w'?'Scacco matto. Vince il Nero.':'Scacco matto. Vince il Bianco.';if(c.isStalemate())return 'Patta per stallo.';if(c.isThreefoldRepetition())return 'Patta per triplice ripetizione.';if(c.isInsufficientMaterial())return 'Patta per materiale insufficiente.';if(c.isDrawByFiftyMoves())return 'Patta per la regola delle 50 mosse.';if(c.isDraw())return 'Patta.';return null}
export function hintsFor(c,result){const best=decodeLine(c.fen(),result?.lines?.[0]?.pv)[0];const tactical=c.moves({verbose:true}).filter(m=>m.captured||m.san.includes('+')||m.san.includes('#'));const first=c.isCheck()?'Il tuo re è sotto scacco. Cerca una risposta legale: spostare il re, catturare chi attacca o bloccare la linea.':tactical.length?`Prima del piano, controlla scacchi e catture: in questa posizione ci sono ${tactical.length} mosse di questo tipo. Non tutte sono convenienti.`:c.moveNumber()<=10?'Osserva quali pezzi devono ancora uscire e chi controlla il centro. Controlla sempre la risposta dell’avversario.':'Controlla prima i pezzi attaccati e la sicurezza del re. Poi chiediti quale pezzo potrebbe diventare più attivo.';return [first,best?`Concentrati sul ${pieceNames[best.piece]} in ${best.from}. Dove può andare per migliorare la posizione?`:'Analisi non disponibile: prova a elencare due mosse candidate.',best?`La prima scelta trovata da Stockfish è ${best.san}: ${best.from} → ${best.to}. È un suggerimento alla profondità raggiunta, non una garanzia.`:'Non ho ancora una mossa calcolata da mostrarti.']}
function lessonMoveText(move){
 if(getLanguage()==='it')return moveDescription(move);
 if(move.captured)return t('Presa in {0} con il pezzo da {1}.',[move.to,move.from]);
 return t('c.move',[pieceName(move.piece),move.from,move.to]);
}

export function lessonFor(move,before,after,grade){
 const review={move,before,after};
 const alternative=lessonCandidate(review,1),reply=lessonCandidate(review,2);
 const same=alternative?.uci===move.from+move.to+(move.promotion||'');
 const facts=positionNarrative(move,after);
 const observed=getLanguage()==='it'?facts[0]:localComment(move,before,after,grade,'direct');
 const detail=candidate=>[lessonMoveText(candidate),getLanguage()==='it'?positionNarrative(candidate)[0]:''].filter(Boolean).join(' ');
 const outcome=gameOutcome(new Chess(move.after));
 return [
  {title:t('La tua mossa · {0}',[move.san]),text:observed||lessonMoveText(move)},
  {title:alternative?t('Scelta di Stockfish · {0}',[alternative.san]):t('Scelta di Stockfish'),text:same?t('Stockfish sceglierebbe la stessa mossa.'):alternative?detail(alternative):t('Nessuna alternativa calcolata per questa posizione.')},
  {title:reply?t('Risposta possibile · {0}',[reply.san]):t('Risposta avversaria'),text:reply?detail(reply):outcome?t(outcome):t('Nessuna risposta calcolata per questa posizione.')},
  {title:t('Prima della prossima mossa'),text:reply?.captured?t('Controlla se puoi ricatturare in {0} e chi guadagna dallo scambio.',[reply.to]):reply?.san.includes('+')||reply?.san.includes('#')?t('Prima di giocare, verifica gli scacchi che lasci all’avversario.'):t('Prima di confermare la mossa, controlla scacchi e catture disponibili all’avversario.')}
 ];
}
export function undoTurn(chess,human){let removed=0;if(chess.history().length){chess.undo();removed++;while(chess.history().length&&chess.turn()!==human){chess.undo();removed++}}return removed}

export function needsLesson(mode,grade){
 return !!grade && (mode==='guided'||(mode==='critical'&&['miss','mistake','blunder'].includes(grade.type)));
}

function lessonCandidate({move,before,after},step){
 const fen=step===1?move.before:move.after,evaluation=step===1?before:after;
 if(evaluation?.fen&&evaluation.fen!==fen)return null;
 return decodeLine(fen,evaluation?.lines?.[0]?.pv)[0]||null;
}

// The caption and illustration use the same legal continuation.
export function lessonBoard(grade,step){
 const {move}=grade;
 const candidate=step===1||step===2?lessonCandidate(grade,step):null;
 if(!candidate)return {board:new Chess(move.after),move};
 const board=new Chess(candidate.before);
 return {board,move:board.move({from:candidate.from,to:candidate.to,promotion:candidate.promotion})};
}
