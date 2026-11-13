import assert from 'node:assert/strict';import {Chess} from './dist/vendor/chess.js';import {gameDecisions} from './dist/game-performance.js';
const c=new Chess();c.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Nxe5 Nxe5 4. d4');const ms=c.history({verbose:true}),sparse=[];const m=ms[4],l=(u,cp)=>({pv:[u],depth:18,cp});sparse[4]={fen:m.before,lines:[l('f3e5',200),l('d2d4',0)]};
const w=gameDecisions(ms,sparse,'w'),b=gameDecisions(ms,sparse,'b');assert.equal(w.tactical,1);assert.equal(w.found,1);assert.equal(w.repeated,1);assert.equal(b.tactical,0);assert.equal(b.repeated,1);
for(const r of [{fen:m.after,lines:sparse[4].lines},{fen:m.before,lines:[l('f3e5',25),l('d2d4',20)]},{fen:m.before,lines:[l('f3e5',200),{...l('d2d4',0),lowerbound:true}]}]){const results=[];results[4]=r;assert.equal(gameDecisions(ms,results,'w').tactical,0)}
assert.equal(gameDecisions([],[],'b').counts,0);console.log('PASS side isolation, opening repeats, same-root tactics, ties/bounds, empty analysis');
