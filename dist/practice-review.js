import {Chess} from './vendor/chess.js';
import {forkTargets,pins,values,opposite} from './tactics.js';
import {legalVariation,uciOf} from './best-comparison.js';
export function meetsGoal(card,m,c){
 if(card.source==='personal')return true;
 if(card.theme==='king')return c.isCheckmate();
 if(card.theme==='fork')return !pins(c,opposite(m.color)).some(p=>p.pinned.square===m.to)&&forkTargets(c,m.to).length>=2;
 if(card.theme==='pin')return !!m.captured&&m.to===card.target;
 return !!m.captured&&values[m.captured]>=3;
}
export function choiceVerdict(best,played,side,same=false){
 const a=best?.lines?.[0],b=played?.lines?.[0];
 if(!a||!b||Math.min(a.depth||0,b.depth||0)<16||Math.abs(a.depth-b.depth)>2)return 'uncertain';
 if(same)return 'accepted';
 const sign=side==='w'?1:-1;
 // Mate scores aren't centipawns: losing a forced mate is not an equivalent choice.
 if(a.mate!=null||b.mate!=null){
  if(a.mate==null||b.mate==null)return 'different';
  if(Math.sign(a.cp)!==Math.sign(b.cp))return 'different';
  if(a.cp*sign>0)return 'accepted'; // Both preserve a found win, without demanding the fastest mate.
  return 'uncertain'; // Don't grade defence from mate distance alone.
 }
 if(!Number.isFinite(a.cp)||!Number.isFinite(b.cp))return 'uncertain';
 const loss=(a.cp-b.cp)*sign;
 return loss< -50?'uncertain':loss<=50?'accepted':'different';
}
export async function reviewChoice(engine,{fen,move,base}){
 const uci=uciOf(move),same=base?.lines?.[0]?.pv?.[0]===uci;
 let best=base,played=same?base:await engine.evaluate(fen,'deep',uci,{limits:[20,2200]});
 const confirmed=r=>r?.lines?.[0]?.pv?.[0]===uci;
 let verdict=confirmed(played)?choiceVerdict(best,played,move.color,same):'uncertain';
 if(verdict==='uncertain'){
  best=await engine.evaluate(fen,'deep','',{limits:[24,5000]});
  played=best.lines?.[0]?.pv?.[0]===uci?best:await engine.evaluate(fen,'deep',uci,{limits:[24,5000]});
  verdict=confirmed(played)?choiceVerdict(best,played,move.color,best===played):'uncertain';
 }
 const line=legalVariation(fen,played?.lines?.[0]?.pv||[]);
 if(!line.moves.length||uciOf(line.moves[0])!==uci)verdict='uncertain';
 return {best,played,verdict,line};
}
