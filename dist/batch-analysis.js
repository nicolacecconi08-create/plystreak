import {Chess} from './vendor/chess.js';
import {Engine,terminal} from './analysis.js';
import {checkedGrade} from './move-grade.js';
import {analysisRecord,getRecord,putRecord} from './archive.js';
import {gameDecisions} from './game-performance.js';
import {resultAccuracy} from './accuracy-metric.js';
import {restoreCheckpoint,REVIEW_METHOD} from './review-checkpoint.js';
export const ANALYSIS_METHOD='plystreak-1.5-verified';
const clock=()=>performance.now();
function report(callback,event){try{callback?.(event)}catch{/* Diagnostics must not interrupt analysis. */}}
function resume(record,moves){
 if(record.analysis?.methodId!==ANALYSIS_METHOD)return null;
 let cp=record.analysis.checkpoint;
 if(!cp)return null;
 // Legacy batch checkpoints did not carry positions. Reuse only when their
 // engine results identify the exact PGN positions; otherwise recompute safely.
 if(!cp.method){
  const positions=[moves[0].before,...moves.map(m=>m.after)];
  if(!Array.isArray(cp.results)||!Array.isArray(cp.grades)||cp.results.some((r,i)=>r?.fen!==positions[i]))return null;
  cp={...cp,method:REVIEW_METHOD,positions};
 }
 return restoreCheckpoint(cp,moves);
}
export async function persistBatchAnalysis(record,analysis,{get=getRecord,put=putRecord}={}){
 // The PGN was already parsed by analyzeRecord. Preserve current metadata, and
 // never resurrect a game deleted or replaced while its worker was running.
 const current=await get(record.id);
 if(!current||current.pgn!==record.pgn)throw Error('La partita è cambiata o è stata eliminata durante l’analisi.');
 return put({...current,analysis,updatedAt:Date.now()});
}
export async function analyzeRecord(record,{engine,openings={},signal,onProgress,onCheckpoint,onTiming}={}){
 const started=clock(),game=new Chess();game.loadPgn(record.pgn);const moves=game.history({verbose:true});if(!moves.length)throw Error('La partita non contiene mosse.');
 const cp=resume(record,moves),results=cp?.results||[],grades=cp?.grades||[],position=new Chess(moves[0].before);
 const positions=[moves[0].before,...moves.map(m=>m.after)];
 const initial=analysisRecord(moves,grades,results),details=[...initial.details];
 const check=()=>{if(signal?.aborted)throw Error('Analisi interrotta.');};
 report(onTiming,{phase:'resume',reusedPlies:grades.length,totalPlies:moves.length,elapsedMs:clock()-started});
 for(let i=0;i<moves.length;i++){
  check();const m=moves[i];position.move({from:m.from,to:m.to,promotion:m.promotion});if(grades[i])continue;
  onProgress?.(i+1,moves.length,false);
  const evaluating=clock();
  results[i]??=await engine.evaluate(m.before,'deep');check();
  results[i+1]??=terminal(position)||await engine.evaluate(m.after,'deep');check();
  grades[i]=await checkedGrade(engine,{move:m,before:results[i],after:results[i+1],openings,previousLoss:grades[i-1]?.loss||0},{signal,onVerify:()=>onProgress?.(i+1,moves.length,true)});
  report(onTiming,{phase:'engine-and-grade',ply:i+1,elapsedMs:clock()-evaluating});
  const summarizing=clock();
  // Tactical themes for old moves are immutable. Build only the newly graded
  // detail, while recalculating aggregate metrics on the full position series.
  const one=analysisRecord([m],[grades[i]],[results[i],results[i+1]]);
  details.push({...one.details[0],ply:i});
  const partial={...initial,details:[...details],gameAccuracy:resultAccuracy(moves,results),performanceBasis:{version:1,w:gameDecisions(moves,results,'w'),b:gameDecisions(moves,results,'b')},at:Date.now(),complete:false,methodId:ANALYSIS_METHOD,checkpoint:{method:REVIEW_METHOD,positions,results:results.slice(),grades:grades.slice()}};
  report(onTiming,{phase:'summary',ply:i+1,elapsedMs:clock()-summarizing});
  const saving=clock();await onCheckpoint?.(partial);
  report(onTiming,{phase:'checkpoint',ply:i+1,elapsedMs:clock()-saving});
 }
 const final={...analysisRecord(moves,grades,results),methodId:ANALYSIS_METHOD};
 report(onTiming,{phase:'complete',plies:moves.length,elapsedMs:clock()-started});
 return final;
}
export async function runBatch(username,{signal,onProgress,onSaved,onTiming,engine=new Engine(()=>{})}={}){
 try{
  const job=await getRecord('batch-'+username,'meta');if(!job)return;
  const records=await Promise.all(job.ids.map(id=>getRecord(id)));const pending=records.filter(r=>r&&!(r.analysis?.complete&&r.analysis.methodId===ANALYSIS_METHOD));
  let completed=0;const started=Date.now();let remaining=pending.reduce((n,r)=>n+Math.max(0,r.plies||0),0);
  const response=await fetch('vendor/openings.json');if(!response.ok)throw Error('Catalogo aperture non disponibile.');const openings=await response.json();
  for(const [i,record] of pending.entries()){
   if(signal?.aborted)throw Error('Analisi interrotta.');
   const timing=event=>{if(event.phase==='resume')remaining-=event.reusedPlies;report(onTiming,{game:i+1,...event});};
   const analysis=await analyzeRecord(record,{engine,openings,signal,onTiming:timing,onProgress:(ply,total,verify)=>onProgress?.(i+1,pending.length,ply,total,verify,completed>=3?Math.max(0,remaining-completed)*(Date.now()-started)/completed:null),onCheckpoint:async analysis=>{await persistBatchAnalysis(record,analysis);completed++}});
   await persistBatchAnalysis(record,analysis);await onSaved?.();
  }
  await putRecord({...job,completedAt:Date.now()},'meta');
 }finally{engine.worker?.terminate()}
}
