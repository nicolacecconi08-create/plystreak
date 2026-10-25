import assert from 'node:assert/strict';import {Chess} from './dist/vendor/chess.js';import {hintFor,attackedSquares} from './dist/mentor.js';
const initial=new Chess();assert.deepEqual(hintFor(initial).squares,[]);assert(['b1','g1','c1','f1'].includes(hintFor(initial,1).squares[0]));
const c=new Chess('4k3/8/8/8/8/3q4/4R3/4K3 w - - 0 1');assert(attackedSquares(c,'w').includes('e2'));assert(hintFor(c,1).text.length>30);
const end=new Chess('8/4k3/8/4K3/4P3/8/8/8 w - - 0 1');assert(hintFor(end,1).text.includes('re e pedoni'));
console.log('PASS v1.7: progressive hints, early development focus, attacked pieces, king-pawn guidance.');
