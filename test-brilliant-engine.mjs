import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {Worker as NodeWorker} from 'node:worker_threads';import assert from 'node:assert/strict';
import {reviewChoice,meetsGoal} from './dist/practice-review.js';
import {Engine,classify,terminal} from './dist/analysis.js';import {Chess} from './dist/vendor/chess.js';import {playUci} from './dist/tactics.js';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'plystreak-engine-'));for(const n of ['stockfish-19-lite-single.js','stockfish-19-lite-single.wasm'])fs.copyFileSync('dist/vendor/'+n,path.join(dir,n));fs.writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');fs.writeFileSync(path.join(dir,'worker.cjs'),`const {parentPort}=require('node:worker_threads');const e=require('./stockfish-19-lite-single.js')();e.listener=s=>parentPort.postMessage(s);parentPort.on('message',s=>e.processCommand(s));`);
const workers=[];globalThis.Worker=class{constructor(){this.w=new NodeWorker(path.join(dir,'worker.cjs'));workers.push(this.w);this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',err=>this.onerror?.(err))}postMessage(s){this.w.postMessage(s)}terminate(){return this.w.terminate()}};
const {gradeMove,isSacrifice}=await import('./dist/move-grade.js');
const e=new Engine(()=>{}),bank=JSON.parse(fs.readFileSync('dist/vendor/training-catalog.json'));
try{
 const card=bank.find(c=>c.id==='combo-sacrificio-linea'),c=new Chess(card.fen),before=await e.evaluate(c.fen(),'deep'),move=playUci(c,card.solution),after=await e.evaluate(c.fen(),'deep');
 assert(isSacrifice(move,before));const g=gradeMove({move,before,after});
 assert.equal(g.type,'brilliant');console.log('PASS Stockfish: genuine queen sacrifice retained with legal mate continuation; depths',before.depth,after.depth);
 const mate=bank.find(c=>c.id==='lesson-matto-1'),d=new Chess(mate.fen),b=await e.evaluate(d.fen(),'deep'),m=playUci(d,mate.solution);assert.notEqual(gradeMove({move:m,before:b,after:terminal(d)}).type,'brilliant');
 console.log('PASS Stockfish: ordinary mate is not a sacrifice.');
}finally{for(const w of workers)await w.terminate();fs.rmSync(dir,{recursive:true,force:true})}
