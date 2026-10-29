// A local training index, not a federation or Chess.com Elo estimate.
export const RATING_START=800;
export function cleanRating(r){
 if(!r||r.version!==1||typeof r.family!=='string'||r.family.length>300||!['solved','skipped','solution'].includes(r.outcome)||![1,2,3].includes(r.level)||!Number.isFinite(r.seconds)||r.seconds<0||r.seconds>86400||!Number.isInteger(r.mistakes)||r.mistakes<0||r.mistakes>10000)return undefined;
 return {version:1,family:r.family,outcome:r.outcome,level:r.level,seconds:r.seconds,mistakes:r.mistakes,assisted:!!r.assisted};
}
export function ratingHistory(attempts){
 let rating=RATING_START,peak=rating,streak=0,lastDelta=0,count=0;const seen=new Set(),families=new Map(),events=[];
 for(const a of [...attempts].filter(a=>Number.isFinite(a.at)).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id))){
  if(seen.has(a.id))continue;seen.add(a.id);const r=cleanRating(a.rating);if(!r)continue;
  const recent=families.get(r.family),repeat=recent!==undefined&&a.at-recent<86400000;
  if(repeat){if(r.outcome!=='solved'||r.assisted||r.mistakes)streak=0;events.push({id:a.id,delta:0,repeat:true});continue;}
  families.set(r.family,a.at);count++;
  const clean=r.outcome==='solved'&&!r.assisted&&r.mistakes===0;
  streak=clean?streak+1:0;
  const target=[0,900,1300,1700][r.level],expected=1/(1+10**((target-rating)/400));
  const score=r.outcome!=='solved'?0:r.assisted?.25:r.mistakes?Math.max(.3,.65-.1*(r.mistakes-1)):1;
  const speed=clean?Math.max(0,Math.min(3,Math.floor(4*(1-r.seconds/([0,60,120,180][r.level]))))):0;
  const bonus=clean?Math.min(4,Math.floor(streak/3)):0;
  const delta=Math.round(24*(score-expected))+speed+bonus;
  const next=Math.max(100,Math.min(3000,rating+delta));lastDelta=next-rating;rating=next;peak=Math.max(peak,rating);events.push({id:a.id,delta:lastDelta,repeat:false});
 }
 return {rating,peak,streak,lastDelta,count,events};
}
export function ratingMilestones(state){
 const lower=Math.max(0,Math.floor(state.rating/200)*200),next=Math.min(3000,lower+200);
 return {lower,next,progress:next===lower?100:Math.round(100*(state.rating-lower)/(next-lower)),marks:Array.from({length:12},(_,i)=>800+i*200).map(value=>({value,reached:state.peak>=value}))};
}
export function nextContinuousQueue(cards,attempts,options,lastId,select){
 let queue=select(cards,attempts,{...options,limit:10000});
 if(!queue.length)queue=select(cards,attempts,{...options,mode:'all',limit:10000});
 if(queue.length>1&&queue[0].id===lastId)queue.push(queue.shift());
 return queue;
}
