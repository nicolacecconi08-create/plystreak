import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {positionNarrative,moveDescription} from './dist/position-narrative.js';
import {explainMove} from './dist/explanations.js';

const fork=new Chess('6k1/8/8/8/1n1Q4/8/7P/R5K1 w - - 0 1');
const move=fork.move('h3');
const text=positionNarrative(move,{lines:[{pv:['b4c2']}]}).join(' ');
assert.match(text,/cavallo da b4 a c2/);assert.match(text,/donna in d4/);assert.match(text,/torre in a1/);assert.match(text,/non obbligata/);
assert(!text.includes('salvarne uno'));assert(!text.includes('guadagni'));
for(const after of [{lines:[{pv:['b4h8']}]},{reliable:false,lines:[{pv:['b4c2']}]},{lines:[{bound:'lowerbound',pv:['b4c2']}]}])assert(!positionNarrative(move,after).join(' ').includes('b4 a c2'));
const mate=new Chess();mate.loadPgn('1. f3 e5 2. g4');
assert.match(positionNarrative(mate.history({verbose:true}).at(-1),{lines:[{pv:['d8h4']}]}).join(' '),/donna da d8 a h4.*re in e1.*difesa legale/);
const development=new Chess();const e4=development.move('e4');const developed=positionNarrative(e4).join(' ');assert.match(developed,/d5/);assert.match(developed,/alfiere in f1/);assert.match(developed,/e2, d3, c4, b5, a6/);
const capture=new Chess('6k1/8/8/8/4r3/8/4R3/4R1K1 w - - 0 1');const m=capture.move('Re3');const exchange=positionNarrative(m,{lines:[{pv:['e4e3','e1e3']}]}).join(' ');assert.match(exchange,/torre da e4 cattura la torre in e3/);assert.match(exchange,/ricatturare con la torre da e1/);assert(!exchange.includes('guadagno'));
const promotion=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');const promoted=promotion.move('a8=N');assert.match(moveDescription(promoted),/a7 a a8.*cavallo/);
const ex=explainMove({move,after:{lines:[{pv:['b4c2']}]},grade:{type:'mistake',loss:.15}});assert.match(ex.facts.join(' '),/donna in d4/);assert(!ex.reason.includes('Guardiamo'));assert.match(ex.action,/h2 a h3/);
assert.equal(fork.fen(),move.after,'narrative does not change source position');
console.log('PASS concrete narratives: named fork, legal mate, development, recapture, promotion, unreliable/illegal reply rejection, integration and immutable positions');
