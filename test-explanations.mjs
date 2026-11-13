import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {explainMove,decodeLine,scoreText} from './dist/explanations.js';
const c=new Chess();c.loadPgn('1. Nf3 d6 2. e4 Nf6 3. e5 dxe5 4. Nxe5 g6 5. Bc4 Be6 6. Bxe6 fxe6 7. d3 Bg7 8. Qf3 Nd5 9. Qf7#');
const ms=c.history({verbose:true});
for(const move of ms){let x=explainMove({move});assert(x.action.length>20);assert(x.tip);assert(!JSON.stringify(x).includes('undefined'));}
const end=explainMove({move:ms.at(-1),after:{cp:100000,mate:0}});assert(end.facts.some(t=>t.startsWith('È scacco matto')));
assert(explainMove({move:ms[0]}).facts.some(t=>t.includes('fuori dalla fila di partenza')));
assert(explainMove({move:ms[5]}).action.includes('cattura un pedone'));
assert.equal(decodeLine(new Chess().fen(),['e2e4','e7e5','e1e8']).length,2);
assert.equal(scoreText({cp:-100000,mate:0}),'Matto al Bianco');
const p=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');const pm=p.move('a8=N');assert(explainMove({move:pm}).action.includes('promosso a cavallo'));
console.log('PASS: explanations for every move, mate, development, capture, underpromotion, legal PV truncation, evaluation perspective');
