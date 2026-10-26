import {Chess} from './vendor/chess.js';
import {classify} from './analysis.js';
export const positionKey=fen=>fen.split(' ').slice(0,4).join(' ');
function material(c,side){const v={p:1,n:3,b:3,r:5,q:9,k:0};return c.board().flat().filter(Boolean).reduce((n,p)=>n+(p.color===side?1:-1)*v[p.type],0)}
// Conservative: the offered piece must be captured immediately, and the loss
// must survive our best legal immediate recapture. Ordinary exchanges do not qualify.
export function isSacrifice(move,before){
 const pv=before?.lines?.[0]?.pv;
 if((before?.depth||before?.lines?.[0]?.depth||0)<18||pv?.[0]!==move.from+move.to+(move.promotion||'')||!['n','b','r','q'].includes(move.piece)||move.promotion)return false;
 const c=new Chess(move.before),base=material(c,move.color);
 try{
  c.move({from:move.from,to:move.to,promotion:move.promotion});
  const u=pv[1];if(!u)return false;
  const reply=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});
  if(reply.to!==move.to||reply.captured!==move.piece||base-material(c,move.color)<2)return false;
  const recaptures=c.moves({verbose:true}).filter(m=>m.to===reply.to&&m.captured);
  for(const r of recaptures){const copy=new Chess(c.fen());copy.move({from:r.from,to:r.to,promotion:r.promotion});if(base-material(copy,move.color)<2)return false;}
  return true;
 }catch{return false;}
}
export function gradeMove({move,before,after,openings={},previousLoss=0}){return classify({before,after,side:move.color==='w'?1:-1,uci:move.from+move.to+(move.promotion||''),book:!!openings[positionKey(move.after)],sacrifice:isSacrifice(move,before),previousLoss})}

export async function checkedGrade(engine,args,{signal,onVerify}={}){
 const check=()=>{if(signal?.aborted)throw Error('Analisi interrotta.');};check();
 const first=gradeMove(args);
 if(!['brilliant','blunder','miss'].includes(first.type)&&args.after.mate==null)return first;
 onVerify?.();const before=await engine.evaluate(args.move.before,'deep','',{skill:20,limits:[24,5000]});check();
 const after=args.after.terminal?args.after:await engine.evaluate(args.move.after,'deep','',{skill:20,limits:[24,5000]});check();
 const grade=gradeMove({...args,before,after});return {...grade,verification:grade.type===first.type?'confirmed':'changed',reviewBefore:before,reviewAfter:after};
}
