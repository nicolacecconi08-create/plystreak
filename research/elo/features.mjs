import {gameDecisions} from '../../dist/game-performance.js';
// Offline features only: never use ratings, player identifiers or the result as predictors.
import fs from 'node:fs';import {Chess} from '../../dist/vendor/chess.js';import {winPercent,resultAccuracy} from '../../dist/accuracy-metric.js';
const dir='research/elo/',pilot=JSON.parse(fs.readFileSync(dir+'pilot.json')),meta=new Map(pilot.games.map(g=>[g.id,g])),rows=[],seen=new Set();
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
for(const f of ['evaluated.json',...fs.readdirSync(dir).filter(x=>x.startsWith('batch-')&&x.endsWith('.json')).sort()]){
 const batch=JSON.parse(fs.readFileSync(dir+f));for(const g of batch.games){if(seen.has(g.id))continue;seen.add(g.id);
 const game=meta.get(g.id),c=new Chess();c.loadPgn(game.moves);const ms=c.history({verbose:true}),rs=g.results;
 if(rs.length!==ms.length+1)throw Error('Incomplete game '+g.id);
 for(const [idx,side] of ['w','b'].entries()){const samples=[];for(const [i,m] of ms.entries()){if(m.color!==side)continue;const a=rs[i],b=rs[i+1];if(a.fen&&a.fen!==m.before||b.fen&&b.fen!==m.after)throw Error('Inconsistent position');
 if(!Number.isFinite(a.cp)||!Number.isFinite(b.cp))continue;const sign=idx?-1:1,legal=new Chess(m.before).moves().length,u=m.from+m.to+(m.promotion||''),ls=a.lines||[];
 samples.push({loss:Math.max(0,sign*(winPercent(a.cp)-winPercent(b.cp))),top:ls[0]?.pv?.[0]===u?1:0,legal,forced:legal===1?1:0})}
 const profile=gameDecisions(ms,rs,side);const loss=samples.map(x=>x.loss),[base,inc]=game.timeControl.split('+').map(Number);
 rows.push({id:g.id,date:game.date,players:game.players,side,pace:game.pace,target:game.ratings[idx],x:{tacticalOpportunities:profile.tactical,tacticalFound:profile.found,repeatOpening:profile.repeated/Math.max(1,profile.openingPairs),pawnShare:profile.pawn/Math.max(1,profile.counts),accuracy:resultAccuracy(ms,rs)[side],meanLoss:avg(loss),bestShare:avg(samples.map(x=>x.top)),mistakeShare:avg(loss.map(x=>+(x>=10))),forcedShare:avg(samples.map(x=>x.forced)),legalCount:avg(samples.map(x=>x.legal)),plies:ms.length,time:Math.log1p(base+40*inc),bullet:+(game.pace==='Bullet'),rapid:+(game.pace==='Rapid'),classical:+(game.pace==='Classical')}})}
 }}
fs.writeFileSync(dir+'features.json',JSON.stringify(rows));console.log(seen.size,'games;',rows.length,'player performances');
