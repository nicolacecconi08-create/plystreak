import {reviewQueue,schedules} from './repetition.js';
export const LEVELS={1:'Essenziale',2:'Intermedio',3:'Sfida'};
export const cardDifficulty=card=>[1,2,3].includes(card.difficulty)?card.difficulty:card.source==='personal'?2:1;
export function difficultyProgress(cards,attempts){
 const byId=new Map(cards.map(c=>[c.id,c])),latest=new Map(),seen=new Set();
 for(const a of [...attempts].filter(a=>Number.isFinite(a.at)).sort((a,b)=>a.at-b.at)){
  const c=byId.get(a.cardId);if(!c||c.source==='personal')continue;
  const attemptKey=a.cardId+':'+(a.sessionId||a.id);if(seen.has(attemptKey))continue;seen.add(attemptKey);
  latest.set(cardDifficulty(c)+':'+(c.family||c.id.replace(/:opposite$/,'')),{level:cardDifficulty(c),clean:!!a.success&&!a.assisted});
 }
 const counts={1:0,2:0,3:0};for(const a of latest.values())if(a.clean)counts[a.level]++;
 const level=counts[1]<4?1:counts[2]<4?2:3;
 return {level,counts,remaining:Math.max(0,4-counts[level])};
}
export function difficultyQueue(cards,attempts,options={}){
 const difficulty=options.difficulty||'progressive',progress=difficultyProgress(cards,attempts),now=options.now??Date.now(),state=schedules(attempts);
 if(difficulty==='all')return reviewQueue(cards,attempts,options);
 if(difficulty!=='progressive')return reviewQueue(cards.filter(c=>cardDifficulty(c)===Number(difficulty)),attempts,options);
 const eligible=cards.filter(c=>cardDifficulty(c)<=progress.level);
 // Keep due reviews first; new work is at the recommended level. Personal-only
 // selection is an explicit choice and keeps access to the uncalibrated archive.
 if(options.source==='personal')return reviewQueue(cards,attempts,options);
 const atLevel=eligible.filter(c=>cardDifficulty(c)===progress.level||state.get(c.id)?.due<=now);
 const queue=reviewQueue(atLevel,attempts,options);
 if(queue.length)return queue;
 return reviewQueue(eligible,attempts,options);
}
export function difficultyNote(cards,attempts,choice='progressive'){
 const p=difficultyProgress(cards,attempts);
 if(choice==='all')return 'Tutti i livelli: difficoltà libera. I problemi speculari non contano come nuovi temi per la progressione.';
 if(choice!=='progressive')return `Livello scelto: ${LEVELS[choice]}. Puoi cambiarlo in qualsiasi momento; i tuoi ripassi restano salvati.`;
 return `Percorso guidato · ${LEVELS[p.level]}. `+(p.level<3?`${Math.min(4,p.counts[p.level])}/4 problemi diversi risolti senza aiuti per passare al livello successivo dal prossimo problema.`:'Hai raggiunto la fascia più impegnativa: consolida le combinazioni e rivedi gli errori.')+' La difficoltà è didattica, non una misura Elo.';
}
