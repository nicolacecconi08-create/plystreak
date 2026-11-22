// No numerical rating from accuracy alone: only the trained model may supply it.
import assert from 'node:assert/strict';
import {performanceEstimate} from './dist/performance-estimate.js';
for(const count of [0,1,19,20,35,100])for(const side of ['w','b']){const r=performanceEstimate(Array.from({length:count},()=>({color:side})),Array.from({length:count},()=>({accuracy:100,type:'best'})),side);assert.equal(r.status,'pending');assert.equal(r.count,count);assert.equal(r.low,undefined);assert.equal(r.high,undefined);assert.match(r.text,/termine dell’analisi/)}console.log('PASS no invented accuracy-to-Elo mapping while model is pending');
