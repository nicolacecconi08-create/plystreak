import {Chess} from './vendor/chess.js';
// Conservative descriptive scale, NOT calibrated against rated players.
const cache=new Map();
function hasChoice(fen){
 if(!fen)return false;
 if(cache.has(fen))return cache.get(fen);
 let choice=false;try{choice=new Chess(fen).moves().length>1}catch{}
 if(cache.size>2000)cache.clear();cache.set(fen,choice);return choice;
}
function usable(result){const line=result?.lines?.[0],cp=line?.cp??result?.cp,depth=line?.depth??result?.depth,mate=line?.mate??result?.mate;return Number.isFinite(cp)&&mate==null&&Number.isFinite(depth)&&depth>=18&&!line?.lowerbound&&!line?.upperbound&&!result?.lowerbound&&!result?.upperbound;}
export function performanceEstimate(moves,grades,side,results=[]){
 const own=moves.map((m,i)=>({m,g:grades[i],before:grades[i]?.reviewBefore||results[i],after:grades[i]?.reviewAfter||results[i+1]})).filter(x=>x.m.color===side);
 if(own.some(x=>!x.g)||!own.length)return {text:'Disponibile dopo l’analisi completa'};
 const useful=own.filter(({m,g,before,after})=>g.type!=='book'&&g.reliable!==false&&usable(before)&&usable(after)&&Math.abs((before.lines?.[0]?.depth??before.depth)-(after.lines?.[0]?.depth??after.depth))<=2&&Math.abs(before.lines?.[0]?.cp??before.cp)<600&&hasChoice(m.before)&&Number.isFinite(g.loss)&&g.loss>=0&&g.loss<=1&&Number.isFinite(g.accuracy)&&g.accuracy>=0&&g.accuracy<=100);
 if(useful.length<20)return {text:'Dati insufficienti: servono 20 mosse utili con analisi affidabile'};
 const mean=useful.reduce((s,{g})=>s+g.accuracy,0)/useful.length;
 const loss=useful.reduce((s,{g})=>s+g.loss,0)/useful.length;
 // Count serious errors across the whole game, including decisive mistakes that
 // enter a forced mate or a position too unbalanced for the sample above.
 const severe=own.filter(({g})=>g.type==='blunder'||g.loss>=.2).length;
 const mistakes=own.filter(({g})=>['mistake','miss'].includes(g.type)||g.loss>=.1&&g.loss<.2).length;
 const cap=severe>=2?1300:severe===1?1600:mistakes>=3?1700:useful.length<30?1900:2200;
 const center=Math.round(Math.max(400,Math.min(cap-200,400+1600*(mean/100)**3-2000*loss-120*severe-40*mistakes))/50)*50;
 const low=Math.max(100,center-200),high=Math.min(cap,center+200);
 return {low,high,count:useful.length,text:`${low}–${high}`};
}
