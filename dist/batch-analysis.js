import {Chess} from './vendor/chess.js';
import {Engine,terminal} from './analysis.js';
import {checkedGrade} from './move-grade.js';
import {analysisRecord,getRecord,putRecord,saveGame} from './archive.js';
export const ANALYSIS_METHOD='plystreak-1.5-verified';
export async function analyzeRecord(record,{engine,openings={},signal,onProgress,onCheckpoint}={}){
 const game=new Chess();game.loadPgn(record.pgn);const moves=game.history({verbose:true});if(!moves.length)throw Error('La partita non contiene mosse.');
 const cp=record.analysis?.methodId===ANALYSIS_METHOD?record.analysis.checkpoint:null;
 const results=cp?.results||[],grades=cp?.grades||[],position=new Chess(moves[0].before);
 const check=()=>{if(signal?.aborted)throw Error('Analisi interrotta.');};
 for(let i=0;i<moves.length;i++){
  check();const m=moves[i];position.move({from:m.from,to:m.to,promotion:m.promotion});if(grades[i])continue;
  onProgress?.(i+1,moves.length,false);
  results[i]??=await engine.evaluate(m.before,'deep');check();
  results[i+1]??=terminal(position)||await engine.evaluate(m.after,'deep');check();
  grades[i]=await checkedGrade(engine,{move:m,before:results[i],after:results[i+1],openings,previousLoss:grades[i-1]?.loss||0},{signal,onVerify:()=>onProgress?.(i+1,moves.length,true)});
  await onCheckpoint?.({...analysisRecord(moves,grades,results),complete:false,methodId:ANALYSIS_METHOD,checkpoint:{results,grades}});
 }
 return {...analysisRecord(moves,grades,results),methodId:ANALYSIS_METHOD};
}
export async function runBatch(username,{signal,onProgress,onSaved,engine=new Engine(()=>{})}={}){
 try{
  const job=await getRecord('batch-'+username,'meta');if(!job)return;
  const records=await Promise.all(job.ids.map(id=>getRecord(id)));const pending=records.filter(r=>r&&!(r.analysis?.complete&&r.analysis.methodId===ANALYSIS_METHOD));const remaining=()=>pending.reduce((n,r)=>n+Math.max(0,r.plies-(r.analysis?.methodId===ANALYSIS_METHOD?r.analysis.checkpoint?.grades?.length||0:0)),0);let completed=0;const started=Date.now(),initialRemaining=remaining();
  const response=await fetch('vendor/openings.json');if(!response.ok)throw Error('Catalogo aperture non disponibile.');const openings=await response.json();
  for(const [i,record] of pending.entries()){
   if(signal?.aborted)throw Error('Analisi interrotta.');
   const analysis=await analyzeRecord(record,{engine,openings,signal,onProgress:(ply,total,verify)=>onProgress?.(i+1,pending.length,ply,total,verify,completed>=3?Math.max(0,initialRemaining-completed)*(Date.now()-started)/completed:null),onCheckpoint:async analysis=>{await saveGame({...record,analysis});completed++}});
   await saveGame({...record,analysis});await onSaved?.();
  }
  await putRecord({...job,completedAt:Date.now()},'meta');
 }finally{engine.worker?.terminate()}
}
