import {exactEvaluation,comparableEvaluations} from './evaluation-evidence.js';
import {Chess} from './vendor/chess.js';
import {playUci} from './tactics.js';
import {classify} from './analysis.js';
export const positionKey=fen=>fen.split(' ').slice(0,4).join(' ');
function material(c,side){const v={p:1,n:3,b:3,r:5,q:9,k:0};return c.board().flat().filter(Boolean).reduce((n,p)=>n+(p.color===side?1:-1)*v[p.type],0)}
// Conservative: the offered piece must be captured immediately, and the loss
// must survive immediate recaptures; a later recovery can be the point of the combination.
// Forced moves and incomplete evidence do not qualify as Brilliant.
export function isSacrifice(move,before){
 const pv=before?.lines?.[0]?.pv;
 if(before?.fen&&before.fen!==move.before)return false;
 if(!exactEvaluation(before)||(before?.lines?.[0]?.depth||before?.depth||0)<18||pv?.[0]!==move.from+move.to+(move.promotion||'')||!['n','b','r','q'].includes(move.piece)||move.promotion)return false;
 const c=new Chess(move.before),base=material(c,move.color);
 if(c.moves().length<2)return false;
 try{
  c.move({from:move.from,to:move.to,promotion:move.promotion});
  const u=pv[1];if(!u)return false;
  const reply=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});
  if(reply.to!==move.to||reply.captured!==move.piece||base-material(c,move.color)<2)return false;
  const recaptures=c.moves({verbose:true}).filter(m=>m.to===reply.to&&m.captured);
  for(const r of recaptures){const copy=new Chess(c.fen());copy.move({from:r.from,to:r.to,promotion:r.promotion});if(base-material(copy,move.color)<2)return false;}
  // A counter-capture elsewhere can recover the material just as a recapture can.
  const continuation=playUci(c,pv[2]);
  if(!continuation||continuation.color!==move.color||base-material(c,move.color)<2)return false;
  // Validate every continuation move; later recovery does not erase the sacrifice.
  for(const u of pv.slice(3)){const next=playUci(c,u);if(!next)return false;}
  return true;
 }catch{return false;}
}
function legalLine(fen,pv){
 if(!pv?.length)return false;
 try{const c=new Chess(fen);return pv.every(u=>!!playUci(c,u))}catch{return false}
}
export function gradeMove({move,before,after,openings={},previousLoss=0}){
 if((before?.fen&&before.fen!==move.before)||(after?.fen&&after.fen!==move.after))throw Error('Valutazione riferita a una posizione diversa: ripeti questa analisi.');
 const comparable=comparableEvaluations(before,after);
 const grade=classify({before,after,side:move.color==='w'?1:-1,uci:move.from+move.to+(move.promotion||''),book:!!openings[positionKey(move.after)],sacrifice:comparable&&isSacrifice(move,before),previousLoss});
 if(grade.type==='great'&&!before.lines.slice(0,2).every(l=>legalLine(move.before,l.pv)))return {...grade,type:'best'};
 return grade;
}

export async function checkedGrade(engine,args,{signal,onVerify}={}){
 const check=()=>{if(signal?.aborted)throw Error('Analisi interrotta.');};check();
 const first=gradeMove(args);
 if(!['brilliant','great','blunder','miss'].includes(first.type)&&args.after.mate==null)return first;
 onVerify?.();const before=await engine.evaluate(args.move.before,'deep','',{skill:20,limits:[24,5000]});check();
 const after=args.after.terminal?args.after:await engine.evaluate(args.move.after,'deep','',{skill:20,limits:[24,5000]});check();
 const grade=gradeMove({...args,before,after});return {...grade,verification:grade.type===first.type?'confirmed':'changed',reviewBefore:before,reviewAfter:after};
}
