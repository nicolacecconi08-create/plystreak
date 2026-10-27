import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {lineStory,stepStory} from './dist/line-story.js';
import {humanFacts} from './dist/human-coach.js';
const c=new Chess(),start=c.fen();
assert.match(lineStory(start,['e2e4','e7e5'],'w'),/non ci sono catture/);
assert.match(lineStory(start,['e2e9'],'w'),/Non ho una continuazione verificata/);
const mate=['f2f3','e7e5','g2g4','d8h4'];
assert.match(lineStory(start,mate,'w'),/Nero.*scacco matto/);
assert(!lineStory(start,[...mate.slice(0,2),'invalid','d8h4'],'w').includes('arriva a dare scacco matto'));
const first=c.move('e4');
assert(!humanFacts(first,{mate:3,cp:10000}).join(' ').includes('matto'));
const swap='4k3/8/8/8/4r3/8/4R3/4R1K1 w - - 0 1';
assert.match(lineStory(swap,['e2e3','e4e3','e1e3'],'w'),/si compensano/);
c.loadPgn('1. e4 d5 2. exd5');
for(const m of c.history({verbose:true})){const text=stepStory(m);assert(!/\b[a-h][1-8]\b|Stockfish|motore|undefined/.test(text));}
console.log('PASS: plain-language steps, legal replay, invalid PV truncation, verified mate only, balanced exchanges and no notation.');
