import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Chess} from './dist/vendor/chess.js';
const source=fs.readFileSync('dist/progress.js','utf8');
const start=source.indexOf('async function latestAndAnalyze(');
const end=source.indexOf("$('connectForm').onsubmit",start);
assert(start>=0&&end>start);
let analyses=0,imports=0,limit;
const records=new Map(),status={textContent:''};
const context=vm.createContext({Chess,performance,profile:{username:'fixture'},ANALYSIS_METHOD:'test',
  getRecord:async id=>records.get(id),putRecord:async r=>records.set(r.id,r),
  fetchLatestGames:async (_name,n)=>{limit=n;imports++;return [{pgn:'1. e4 e5',side:'w',playedAt:100}]},
  saveGame:async r=>{const value={...r,id:'fixture-game'};records.set(value.id,value);return value},
  refresh:async()=>{},playerReport:async()=>{},$:()=>status,
  continueBatch:async()=>{analyses++},
});
vm.runInContext(source.slice(start,end),context);
await context.latestAndAnalyze({aborted:false});
assert.equal(imports,1);assert.equal(limit,3);assert.equal(analyses,1,'connection starts analysis');
assert(records.has('fixture-game'));
await context.latestAndAnalyze({aborted:false},{analyze:true});
assert.equal(analyses,2,'subsequent analysis continues');
await assert.rejects(context.latestAndAnalyze({aborted:true}),/interrotta/);
assert.equal(analyses,2);
console.log('PASS Chess.com import: three initial games, automatic analysis, cancellation');

records.set('batch-fixture',{id:'batch-fixture',ids:['old1','old2','old3','old4'],lastSeen:100});for(let i=1;i<=4;i++)records.set('old'+i,{id:'old'+i,playedAt:i});await context.latestAndAnalyze({aborted:false});assert(records.get('batch-fixture').ids.includes('old1'),'legacy queue must retain older games');
