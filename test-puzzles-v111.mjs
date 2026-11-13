import assert from 'node:assert/strict';
import fs from 'node:fs';
import {trainingPath,pathMove,pathComplete,verifiedPath,pathEnd,goalReached} from './dist/puzzle-path.js';
import {expandedCatalog,makeDeck,reviewQueue} from './dist/repetition.js';
import {performanceEstimate} from './dist/performance-estimate.js';
const bank=JSON.parse(fs.readFileSync('dist/vendor/training-catalog.json'));
const combo=bank.find(c=>c.id==='combo-sacrificio-linea');assert(combo);
for(const c of expandedCatalog(bank).filter(c=>c.line)){
 const p=verifiedPath(c.fen,c.line);assert(p,c.id);assert(goalReached(c,p),c.id);assert(!pathComplete(p,0));assert(pathMove(p,0,c.line[0]));assert(!pathMove(p,0,'a1a2'));assert(pathComplete(p,p.moves.length));
 if(c.theme==='king')assert(pathEnd(p).isCheckmate(),c.id);
}
const path=trainingPath(combo.fen,combo.line);assert.equal(path.moves.length,3);assert(!pathComplete(path,1));assert(!pathComplete(path,2));assert(pathComplete(path,3));
assert.equal(verifiedPath(combo.fen,['b3b8','a1a8']),null);
const deck=makeDeck([],bank);for(let i=0;i<20;i++){const q=reviewQueue(deck.cards,[],{random:Math.random});assert.equal(new Set(q.map(c=>c.family||c.id)).size,q.length);}
const moves=Array.from({length:30},()=>({color:'w',before:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'})),grades=moves.map(()=>({type:'best',accuracy:95,loss:.001})),results=Array.from({length:31},()=>({cp:10,depth:20,mate:null}));
assert.equal(performanceEstimate(moves,grades,'w',results).count,30);
assert(!performanceEstimate(moves.slice(0,6),grades,'w',results).low);
assert(!performanceEstimate(moves,grades.slice(0,4),'w',results).low);
assert(!performanceEstimate(moves,grades.map(g=>({...g,type:'book'})),'w',results).low);
assert(!performanceEstimate(moves,grades,'w',results.map(r=>({...r,depth:9}))).low);
assert(!performanceEstimate(moves,grades,'w',results.map(r=>({...r,mate:3}))).low);
// Numerical estimates remain unavailable until independent calibration.
for(const gs of [grades,grades.map(g=>({...g,accuracy:30,loss:.3}))]){const estimate=performanceEstimate(moves,gs,'w',results);assert.equal(estimate.status,'uncalibrated');assert.equal(estimate.low,undefined);assert.equal(estimate.high,undefined);}
console.log('PASS: full legal paths, mates, no premature completion, invalid paths, family deduplication, guarded performance ranges.');

assert(!goalReached({...combo,source:'catalog'},trainingPath(combo.fen,combo.line,1)));
