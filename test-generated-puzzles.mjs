import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';
import {mateGenerator,localPuzzleDay} from './dist/mate-generator.js';
const generator=mateGenerator(Buffer.from(JSON.parse(fs.readFileSync('dist/vendor/practice-mates.json','utf8')),'base64'));
const date=localPuzzleDay(new Date(2026,10,24,23,59));
assert.equal(date,localPuzzleDay(new Date(2026,10,24,0,1)));
assert.deepEqual(generator.card(date),generator.card(date));
assert.notEqual(generator.card(date).fen,generator.card(date+1).fen);
const lengths=new Set(),positions=new Set(),kinds=new Set();
for(let seed=0;seed<80;seed++){
 const card=generator.card(seed),game=new Chess(card.fen),line=generator.line(game);
 lengths.add(card.turns);positions.add(card.fen);kinds.add(card.fen.toLowerCase().includes('q')?'queen':'rook');
 assert.equal(line.moves.length,2*card.turns-1);
 for(const move of line.moves){
  const distance=generator.distance(game);
  const choices=game.moves({verbose:true}).map(m=>generator.distance(new Chess(m.after)));
  const optimal=game.turn()===new Chess(card.fen).turn()?Math.min(...choices):Math.max(...choices);
  assert.equal(optimal,distance-1);
  game.move(move.san);
 }
 assert(game.isCheckmate());
}
assert.equal(positions.size,80);assert.equal(kinds.size,2);assert.deepEqual([...lengths].sort(),[3,4,5,6]);
console.log('PASS daily date, generation, lengths and optimal attack/defence',generator.count);
import {composeTactic} from './dist/practice-generator.js';
for(const theme of ['fork','material']){
 const starts=new Set();
 for(let seed=1;seed<=12;seed++){
  const card=composeTactic(seed,theme);if(!card)continue;
  assert.deepEqual(card,composeTactic(seed,theme));starts.add(card.fen);
  const game=new Chess(card.fen);const first=game.move(card.solution);assert(game.isCheck());
  for(const reply of game.moves({verbose:true})){
   const branch=new Chess(reply.after),capture=branch.moves({square:first.to,verbose:true}).find(m=>m.captured==='q');
   assert(capture);branch.move(capture.san);
   assert(!branch.moves({verbose:true}).some(m=>m.to===capture.to&&m.captured));
  }
 }
 assert(starts.size>=9);
}
import {pins} from './dist/tactics.js';
for(let seed=1;seed<12;seed++){
 const card=composeTactic(seed,'pin');assert(card);
 const game=new Chess(card.fen);
 const pin=pins(game,game.turn())[0];assert.equal(pin.pinned.type,'n');
 assert(game.attackers(card.target,game.turn()==='w'?'b':'w').includes(pin.pinned.square));
 game.move(card.solution);assert(!game.moves({verbose:true}).some(m=>m.to===card.target&&m.captured));
}
