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
  const response=await fetch('vendor/openings.json');if(!response.ok)throw Error('Catalogo aperture non disponibile.');const openings=await response.json();
  for(let i=0;i<job.ids.length;i++){
   if(signal?.aborted)throw Error('Analisi interrotta.');const record=await getRecord(job.ids[i]);if(!record)continue;
   if(record.analysis?.complete&&record.analysis.methodId===ANALYSIS_METHOD)continue;
   const analysis=await analyzeRecord(record,{engine,openings,signal,onProgress:(ply,total,verify)=>onProgress?.(i+1,job.ids.length,ply,total,verify),onCheckpoint:analysis=>saveGame({...record,analysis})});
   await saveGame({...record,analysis});await onSaved?.();
  }
  await putRecord({...job,completedAt:Date.now()},'meta');
 }finally{engine.worker?.terminate()}
}
