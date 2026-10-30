import {gradeMove} from './move-grade.js';
import {Chess} from './vendor/chess.js';
import {TYPES} from './analysis.js';
export const REVIEW_METHOD='review-resume-1';
function evidence(r){return {...(r.reliable===false?{reliable:false}:{}),...(r.bound?{bound:r.bound}:{}),...(r.lowerbound?{lowerbound:true}:{}),...(r.upperbound?{upperbound:true}:{})}}
function result(r,fen){
 if(!r||!Number.isFinite(r.cp)||Math.abs(r.cp)>100000||r.mate!=null&&!Number.isInteger(r.mate))return null;
 const out={...evidence(r),cp:r.cp,mate:r.mate??null,depth:Number.isFinite(r.depth)?r.depth:0,lines:[]};
 if(r.terminal){const c=new Chess(fen);if(!c.isGameOver())return null;out.terminal=c.isCheckmate()?'Scacco matto':'Patta';}
 for(const l of (Array.isArray(r.lines)?r.lines:[]).slice(0,3)){
  if(!Number.isFinite(l.cp)||!Array.isArray(l.pv))continue;
  const c=new Chess(fen),pv=[];for(const u of l.pv.slice(0,40)){if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u))break;try{c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});pv.push(u)}catch{break}}
  if(pv.length)out.lines.push({...evidence(l),cp:l.cp,mate:l.mate??null,depth:Number.isFinite(l.depth)?l.depth:out.depth,pv});
 }
 out.best=out.lines[0]?.pv[0];return out;
}
export function restoreCheckpoint(checkpoint,moves){
 if(checkpoint?.method!==REVIEW_METHOD||!Array.isArray(checkpoint.positions)||!Array.isArray(checkpoint.results)||!Array.isArray(checkpoint.grades)||!moves.length)return null;
 const positions=[moves[0].before,...moves.map(m=>m.after)];if(positions.length!==checkpoint.positions.length||positions.some((p,i)=>p!==checkpoint.positions[i]))return null;
 const results=[],grades=[];
 for(let i=0;i<positions.length;i++){const r=result(checkpoint.results[i],positions[i]);if(!r)break;results.push(r);if(i){const g=checkpoint.grades[i-1];if(!g||!Object.hasOwn(TYPES,g.type)||!Number.isFinite(g.loss)||g.loss<0||g.loss>1||!Number.isFinite(g.accuracy)||g.accuracy<0||g.accuracy>100)break;const clean={type:g.type,loss:g.loss,accuracy:g.accuracy,before:g.before,after:g.after};if(g.reviewBefore)clean.reviewBefore=result(g.reviewBefore,positions[i-1]);if(g.reviewAfter)clean.reviewAfter=result(g.reviewAfter,positions[i]);if(['confirmed','changed'].includes(g.verification))clean.verification=g.verification;if(['brilliant','great'].includes(clean.type)){const checked=gradeMove({move:moves[i-1],before:clean.reviewBefore||results[i-1],after:clean.reviewAfter||r});if(checked.type!==clean.type)Object.assign(clean,checked,{verification:'changed'});}grades.push(clean);}}
 // Keep only one ungraded boundary position. Resume must not skip a missing grade.
 return {method:REVIEW_METHOD,positions,results:results.slice(0,grades.length+1),grades};
}
export function makeCheckpoint(moves,results,grades){if(!moves.length)return null;let count=0;while(grades[count]&&results[count]&&results[count+1])count++;return structuredClone({method:REVIEW_METHOD,positions:[moves[0].before,...moves.map(m=>m.after)],results:results.slice(0,count+1),grades:grades.slice(0,count)});}
export async function continueReview({positions,moves,results,grades,evaluate,grade,stopped=()=>false,onSaved=async()=>{}}){
 for(let i=grades.length;i<moves.length;i++){
  if(stopped())return;
  if(!results[i])results[i]=await evaluate(positions[i],i);
  if(stopped())return;
  if(!results[i+1])results[i+1]=await evaluate(positions[i+1],i+1);
  if(stopped())return;
  grades[i]=await grade(moves[i],results[i],results[i+1],grades[i-1]?.loss||0);
  await onSaved(i+1);
 }
}
