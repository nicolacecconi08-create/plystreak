import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {Worker as NodeWorker} from 'node:worker_threads';import assert from 'node:assert/strict';
import {reviewChoice,meetsGoal} from './dist/practice-review.js';
import {Engine,classify,terminal} from './dist/analysis.js';import {Chess} from './dist/vendor/chess.js';import {playUci} from './dist/tactics.js';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'plystreak-engine-'));for(const n of ['stockfish-19-lite-single.js','stockfish-19-lite-single.wasm'])fs.copyFileSync('dist/vendor/'+n,path.join(dir,n));fs.writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');fs.writeFileSync(path.join(dir,'worker.cjs'),`const {parentPort}=require('node:worker_threads');const e=require('./stockfish-19-lite-single.js')();e.listener=s=>parentPort.postMessage(s);parentPort.on('message',s=>e.processCommand(s));`);
const workers=[];globalThis.Worker=class{constructor(){this.w=new NodeWorker(path.join(dir,'worker.cjs'));workers.push(this.w);this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',err=>this.onerror?.(err))}postMessage(s){this.w.postMessage(s)}terminate(){return this.w.terminate()}};
const e=new Engine(()=>{}),bank=JSON.parse(fs.readFileSync('dist/vendor/training-catalog.json'));
const groups=[
 ['lesson-matto-1',[['a2','wp'],['b2','wp'],['a7','bp'],['b7','bp'],['c3','wn'],['c6','bn']],[['d3','wb'],['b6','bb'],['d2','wp'],['d7','bp']]],
 ['lesson-doppio-3',[['a2','wp'],['b2','wp'],['a7','bp'],['b7','bp'],['a1','wr'],['a8','br']],[['f3','wb'],['b6','bb'],['f2','wp'],['f7','bp']]],
 ['lesson-inchiodatura-1',[['a2','wp'],['b2','wp'],['a7','bp'],['b7','bp'],['c3','wn'],['c6','bn']],[['d2','wp'],['d7','bp'],['a1','wr'],['a8','br']]],
 ['lesson-presa-3',[['a2','wp'],['b2','wp'],['a7','bp'],['b7','bp'],['f3','wn'],['f6','bn']],[['b1','wb'],['a6','bb'],['d3','wp'],['d6','bp']]]
];
const generated=[];
try{for(const [id,medium,hard]of groups){for(const difficulty of [2,3]){
 const original=bank.find(c=>c.id===id),c=new Chess(original.fen),added=[...medium,...(difficulty===3?hard:[])];
 for(const [sq,p]of added){assert(!c.get(sq));assert(c.put({color:p[0],type:p[1]},sq));}
 const fen=c.fen();assert(!c.isCheck(),id);assert(!new Chess(fen.replace(' w ',' b ')).isCheck(),id);
 const move=playUci(c,original.solution),base=await e.evaluate(fen,'deep');assert(move);
 const check=await reviewChoice(e,{fen,move,base});
 if(check.verdict!=='accepted'){console.log('REJECT',id,difficulty,check.verdict);continue;}
 let line=check.played.lines[0].pv.slice(0,original.theme==='fork'?3:1);
 if(line.length%2===0){console.log('SHORT',id,difficulty);continue;}
 const replay=new Chess(fen);for(const u of line)assert(playUci(replay,u));
 if(original.theme==='king')assert(replay.isCheckmate());
 const card={...original,id:id+'-level-'+difficulty,family:id,fen,difficulty,line,distractors:added.length,verified:{engine:'Stockfish 19 Lite',allPlies:false,depth:check.played.lines[0].depth,rootVerified:true}};
 let valid=true;const verify=new Chess(fen);for(const u of line){const f=verify.fen(),forced=verify.moves().length===1,m=playUci(verify,u);if(verify.isCheckmate()||forced)continue;const r=await reviewChoice(e,{fen:f,move:m,base:await e.evaluate(f,'deep')});if(r.verdict!=='accepted'){valid=false;break}}
 if(valid){card.verified.allPlies=true;generated.push(card);console.log('PASS',card.id,added.length,'additional pieces',line.join(' '));}
 }}fs.writeFileSync('/tmp/ply-distractors.json',JSON.stringify(generated,null,2));
}finally{for(const w of workers)await w.terminate();fs.rmSync(dir,{recursive:true,force:true})}
