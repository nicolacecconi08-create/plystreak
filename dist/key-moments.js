import {Chess} from './vendor/chess.js';
import {pins,forkTargets,opposite,playUci} from './tactics.js';
const memo=new WeakMap();
export function importantReason(move,grade,after){
 if(!move||!grade)return null;
 const cached=memo.get(move);if(cached?.grade===grade&&cached?.after===after)return cached.reason;
 const reason=findReason(move,grade,after);memo.set(move,{grade,after,reason});return reason;
}
function findReason(move,grade,after){
 const labels={brilliant:'Sacrificio classificato come geniale',great:'Scelta decisiva tra le alternative analizzate',mistake:'Errore da rivedere',blunder:'Grave errore da rivedere',miss:'Occasione mancata'};
 if(labels[grade.type])return labels[grade.type];
 const old=new Chess(move.before),now=new Chess(move.after),side=move.color;
 if(now.isCheckmate())return 'Scacco matto';
 if(now.isStalemate())return 'Stallo';
 const currentPins=pins(now,side);
 if(currentPins.some(p=>!pins(old,side).some(q=>q.attacker.square===p.attacker.square&&q.pinned.square===p.pinned.square)))return 'Nuova inchiodatura al re';
 const fork=forkTargets(now,move.to);
 if(fork.length>=2&&!pins(now,opposite(side)).some(p=>p.pinned.square===move.to)&&forkTargets(old,move.from).length<2)return 'Nuovo doppio attacco';
 const oldRights=move.before.split(' ')[2],newRights=move.after.split(' ')[2],rights=side==='w'?/[KQ]/:/[kq]/;
 if(move.piece==='k'&&!/[kq]/.test(move.flags)&&rights.test(oldRights)&&!rights.test(newRights))return 'Il re perde la possibilità di arroccare';
 const reply=playUci(now,after?.lines?.[0]?.pv?.[0]);
 if(reply&&now.isCheckmate())return 'Minaccia immediata di matto';
 return null;
}
export function nextImportant(moves,grades,results,index){
 for(let i=index;i<moves.length;i++){const reason=importantReason(moves[i],grades[i],grades[i]?.reviewAfter||results[i+1]);if(reason)return {index:i+1,reason};}
 return null;
}
