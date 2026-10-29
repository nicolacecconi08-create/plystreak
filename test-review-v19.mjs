import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {isSacrifice,gradeMove} from './dist/move-grade.js';
import {legalVariation,compareEvaluations} from './dist/best-comparison.js';
import {humanFacts,humanComment} from './dist/human-coach.js';
const pos=(fen,uci)=>{const c=new Chess(fen);return c.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});};
const result=(pv,cp=50,depth=20)=>({cp,mate:null,depth,lines:[{pv,cp,mate:null,depth}]});
// Equal rook exchange: temporary loss before recapture must never be Brilliant.
const swap=pos('4k3/8/8/8/8/8/4r3/4RRK1 w - - 0 1','e1e2');
assert.equal(isSacrifice(swap,result(['e1e2','e8f7'])),false);
const ordinary=pos('4k3/8/8/8/4r3/8/4R3/4R1K1 w - - 0 1','e2e3');
assert.equal(isSacrifice(ordinary,result(['e2e3','e4e3','e1e3'])),false);
// A piece unrelated to the selected move is lost later: not an intentional sacrifice.
const unrelated=pos(new Chess().fen(),'e2e4');assert.equal(isSacrifice(unrelated,result(['e2e4','e7e5','g1f3','b8c6'])),false);
const offer=pos('6k1/5ppp/8/8/8/3B4/8/6K1 w - - 0 1','d3h7');
assert.equal(isSacrifice(offer,result(['d3h7','g8h7','g1f2'])),true);
assert.equal(isSacrifice(offer,result(['d3h7','g8h7'],50,10)),false);
assert.notEqual(gradeMove({move:offer,before:result(['d3h7','g8h7']),after:result([], -500)}).type,'brilliant');
const fen=new Chess().fen(),pv=['e2e4','e7e5','g1f3','a1a8'];const line=legalVariation(fen,pv);assert.equal(line.moves.length,3);assert.equal(line.positions[0],fen);assert.equal(pv.length,4);assert.equal(legalVariation(fen,['bad']).moves.length,0);
assert.equal(compareEvaluations(result([],50),result([],40),'w').kind,'equal');assert.equal(compareEvaluations(result([],50),result([], -80),'w').delta,1.3);assert.equal(compareEvaluations(result([],-80),result([],50),'b').delta,1.3);
assert.equal(compareEvaluations(result([],50,8),result([],0,20),'w').kind,'uncertain');assert.equal(compareEvaluations({...result([],50),lines:[{cp:100000,mate:2,depth:20}]},result([],0),'w').kind,'uncertain');assert.equal(compareEvaluations(null,null,'w',true).kind,'same');
const fork=pos('4k3/8/3q4/8/2N5/8/8/4K3 w - - 0 1','c4d6'); // capture, no invented fork
assert(!humanFacts(fork).join(' ').includes('forchetta'));
const c=new Chess();c.loadPgn('1. f3 e5 2. g4 Qh4#');const ms=c.history({verbose:true});
assert(humanFacts(ms[2],result(['d8h4'])).some(s=>s.includes('minaccia immediata')));
for(const m of ms){const text=humanComment(m,null,null,{type:'good',loss:.03});assert(!/\b[a-h][1-8]\b/.test(text));assert(!text.includes(m.san));assert(!text.includes('undefined'));}
console.log('PASS v1.9: conservative sacrifices, exchange and shallow-search rejection, legal PV, both evaluation perspectives, equality, uncertainty, mate and coordinate-free comments.');
