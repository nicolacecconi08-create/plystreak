// Evidence from one game and one colour only. No account, archive or rating input.
import {verifiedBest} from './review-arrows.js';
import {winPercent} from './accuracy-metric.js';
const memo=new WeakMap();
function candidate(m,root){
 if(!root||!m.before)return false;
 const old=memo.get(m);if(old?.root===root)return old.value;
 const lines=root.lines||[],[a,b]=lines,sign=m.color==='w'?1:-1;
 let value=false;
 // Only distinguish a tactical choice when two exact lines from this root
 // reach the same depth and the alternative costs at least 5 win-percentage points.
 if(a&&b&&a.depth===b.depth&&Number.isFinite(b.cp)&&!b.bound&&!b.upperbound&&!b.lowerbound&&b.reliable!==false&&a.pv?.[0]!==b.pv?.[0]&&sign*(winPercent(a.cp)-winPercent(b.cp))>=5){
 const best=verifiedBest(m.before,root),alternative=verifiedBest(m.before,{fen:m.before,lines:[b]});
 if(best&&alternative&&(best.captured||best.san.includes('+')||best.san.includes('#')))value={hit:best.from===m.from&&best.to===m.to&&best.promotion===m.promotion};
 }
 memo.set(m,{root,value});return value;
}
export function gameDecisions(moves,roots,side){
 let tactical=0,found=0,repeated=0,openingPairs=0,last=null,pawn=0,counts=0;
 for(let i=0;i<moves.length;i++){const m=moves[i];if(m.color!==side||!m.before)continue;
 counts++;if(m.piece==='p')pawn++;
 const num=Number(m.before.split(' ')[5]);if(num<=10&&last){openingPairs++;if(last.to===m.from)repeated++}
 const v=candidate(m,roots?.[i]);if(v){tactical++;if(v.hit)found++}last=m;
 }return {tactical,found,openingPairs,repeated,pawn,counts};
}
