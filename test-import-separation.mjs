import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Chess} from './dist/vendor/chess.js';
const source=fs.readFileSync('dist/progress.js','utf8');
const start=source.indexOf('async function latestAndAnalyze(');
const end=source.indexOf("$('connectForm').onsubmit",start);
assert(start>=0&&end>start);
let analyses=0,imports=0;
const records=new Map(),status={textContent:''};
const context=vm.createContext({Chess,performance,profile:{username:'fixture'},ANALYSIS_METHOD:'test',
  getRecord:async id=>records.get(id),putRecord:async r=>records.set(r.id,r),
  fetchLatestGames:async()=>{imports++;return [{pgn:'1. e4 e5',side:'w',playedAt:100}]},
  saveGame:async r=>{const value={...r,id:'fixture-game'};records.set(value.id,value);return value},
  refresh:async()=>{},playerReport:async()=>{},$:()=>status,
  continueBatch:async()=>{analyses++},
});
vm.runInContext(source.slice(start,end),context);
await context.latestAndAnalyze({aborted:false});
assert.equal(imports,1);assert.equal(analyses,0,'connection/import must not start Stockfish');
assert(records.has('fixture-game'));assert.match(status.textContent,/Importazione completata/);
await context.latestAndAnalyze({aborted:false},{analyze:true});
assert.equal(analyses,1,'explicit analysis remains available');
await assert.rejects(context.latestAndAnalyze({aborted:true}),/interrotta/);
assert.equal(analyses,1);
console.log('PASS Chess.com import: archive immediately available, explicit analysis, cancellation');
