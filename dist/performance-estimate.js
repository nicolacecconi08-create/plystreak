import {t} from './i18n.js';
const estimates=new WeakMap();
export function startPerformance(moves,onUpdate,isCurrent){
 if(!moves.length||estimates.has(moves))return;
 const state={status:'running',done:0};estimates.set(moves,state);
 import('./elo-model.js').then(({estimateGame})=>estimateGame(moves,(done)=>{state.done=done;if(isCurrent())onUpdate()},isCurrent)).then(result=>{Object.assign(state,{status:'ready',result});if(isCurrent())onUpdate()}).catch(error=>{Object.assign(state,{status:'error',error:error.message});if(isCurrent())onUpdate()});
}
export function retryPerformance(moves){estimates.delete(moves)}
export function performanceEstimate(moves,grades,side){
 const own=moves.map((m,i)=>({m,g:grades[i]})).filter(x=>x.m.color===side),count=own.filter(x=>x.g).length,state=estimates.get(moves);
 const base={count,total:own.length};
 if(state?.status==='ready')return {...base,status:'ready',value:state.result[side],text:state.result[side]==null?t('Nessuna mossa giocata'):t('Circa {0} · scala Lichess',[state.result[side]])};
 if(state?.status==='running')return {...base,status:'running',text:t('Stima Elo in corso: {0}/{1} mosse',[state.done,moves.length])};
 if(state?.status==='error')return {...base,status:'error',text:t('Stima non riuscita. Premi Riprova.')};
 return {...base,status:'pending',text:t('La stima parte al termine dell’analisi.')};
}
