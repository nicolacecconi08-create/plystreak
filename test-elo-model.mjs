import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Worker as NodeWorker} from 'node:worker_threads';
import {encodeBoard,wdl,decodeRating,estimateGame} from './dist/elo-model.js';
import {Chess} from './dist/vendor/chess.js';
import * as ort from './dist/vendor/elo/ort.wasm.min.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('./qa/elo-parity.json',import.meta.url)));
for(let i=0;i<fixture.fens.length;i++)assert.deepEqual([...encodeBoard(fixture.fens[i],i?'b':'w').slice(0,64)],fixture.boards[i].flat());
for(const [cp,expected] of fixture.wdl)wdl(cp).forEach((v,i)=>assert(Math.abs(v-expected[i]/1000)<1e-8));
assert.throws(()=>decodeRating(new Float32Array(39)));
ort.env.wasm.numThreads=1;
ort.env.wasm.wasmPaths=new URL('./dist/vendor/elo/',import.meta.url).href;
const session=await ort.InferenceSession.create(fs.readFileSync('dist/vendor/elo/model.onnx'),{executionProviders:['wasm']});
let h=new ort.Tensor('float32',new Float32Array(128),[1,2,64]),c=new ort.Tensor('float32',new Float32Array(128),[1,2,64]),result;
for(let ply=0;ply<3;ply++){
 result=await session.run({position:new ort.Tensor('float32',Float32Array.from(fixture.positions.flatMap(p=>p[ply].flat(2))),[2,1,2,8,8]),evaluation:new ort.Tensor('float32',Float32Array.from(fixture.analysis.flatMap(p=>p[ply])),[2,1,17]),h0:h,c0:c});
 h.dispose();c.dispose();h=result.hn;c=result.cn;
}
const expected=fixture.probabilities.flat();let maxError=0;
result.probs.data.forEach((v,i)=>{maxError=Math.max(maxError,Math.abs(v-expected[i]));assert(Math.abs(v-expected[i])<1e-5)});
await session.release();h.dispose();c.dispose();result.probs.dispose();
console.log('PASS Python/JavaScript feature and ONNX parity; maximum probability error',maxError);

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'plystreak-elo-test-'));
for(const n of ['stockfish-19-lite-single.js','stockfish-19-lite-single.wasm'])fs.copyFileSync('dist/vendor/'+n,path.join(dir,n));
fs.writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');
fs.writeFileSync(path.join(dir,'worker.cjs'),`const {parentPort}=require('node:worker_threads');const e=require('./stockfish-19-lite-single.js')();e.listener=s=>parentPort.postMessage(s);parentPort.on('message',s=>e.processCommand(s));`);
const workers=[];globalThis.Worker=class{constructor(){this.w=new NodeWorker(path.join(dir,'worker.cjs'));workers.push(this.w);this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',e=>this.onerror?.(e))}postMessage(s){this.w.postMessage(s)}terminate(){return this.w.terminate()}};
const fetchOriginal=globalThis.fetch;globalThis.fetch=async url=>String(url).startsWith('file:')?new Response(fs.readFileSync(new URL(url))):fetchOriginal(url);
try{
 const game=new Chess();game.loadPgn('1. Nf3 d6 2. e4 Nf6 3. e5 dxe5 4. Nxe5 g6 5. Bc4 Be6 6. Bxe6 fxe6 7. d3 Bg7 8. Qf3 Nd5 9. Qf7#');
 const moves=game.history({verbose:true}),progress=[];
 const rating=await estimateGame(moves,n=>progress.push(n));
 assert.equal(progress.length,moves.length);assert.equal(rating.plies,moves.length);
 assert(Number.isFinite(rating.w)&&Number.isFinite(rating.b));
 assert.equal(rating.w%50,0);assert.equal(rating.b%50,0);
 console.log('PASS real Stockfish + ONNX, both sides, odd plies, terminal mate:',rating);
}finally{
 globalThis.fetch=fetchOriginal;for(const w of workers)await w.terminate();
 const target=path.resolve(dir);assert(target.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(target).startsWith('plystreak-elo-test-'));
 fs.rmSync(target,{recursive:true,force:true});
}
