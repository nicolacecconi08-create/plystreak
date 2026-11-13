import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';
import {makeDeck} from './dist/repetition.js';
import {cardDifficulty,difficultyProgress,difficultyQueue,difficultyNote} from './dist/practice-difficulty.js';
import {verifiedPath,pathEnd} from './dist/puzzle-path.js';
const bank=JSON.parse(fs.readFileSync('dist/vendor/training-catalog.json')),cards=makeDeck([],bank).cards;
assert.equal(bank.filter(c=>c.distractors).length,8);
for(const c of bank.filter(c=>c.distractors)){
 const parent=bank.find(p=>p.id===c.family);assert(parent);
 const count=f=>new Chess(f).board().flat().filter(Boolean).length;
 assert.equal(count(c.fen)-count(parent.fen),c.distractors);
 assert.equal(c.solution,parent.solution);assert(c.verified.allPlies);assert(c.verified.depth>=16);
 const path=verifiedPath(c.fen,c.line);assert(path);if(c.theme==='king')assert(pathEnd(path).isCheckmate());
}
const opts={now:10000,random:()=>0};
assert(difficultyQueue(cards,[],opts).every(c=>cardDifficulty(c)===1));
assert.equal(difficultyProgress(cards,[]).level,1);
const level1=bank.filter(c=>c.difficulty===1).slice(0,4);
const attempts=level1.map((c,i)=>({id:String(i),sessionId:'s',cardId:c.id,at:i,success:true,assisted:false}));
assert.equal(difficultyProgress(cards,attempts).level,2);
assert(difficultyQueue(cards,attempts,opts).every(c=>cardDifficulty(c)===2));
assert.equal(difficultyProgress(cards,attempts.map(a=>({...a,assisted:true}))).level,1);
assert.equal(difficultyProgress(cards,Array.from({length:10},(_,i)=>({...attempts[0],id:String(i),sessionId:String(i),cardId:attempts[0].cardId+(i%2?':opposite':''),at:i}))).level,1);
const second=bank.filter(c=>c.difficulty===2).slice(0,4).map((c,i)=>({id:'two'+i,sessionId:'two',cardId:c.id,at:10+i,success:true,assisted:false}));
assert.equal(difficultyProgress(cards,[...attempts,...second]).level,3);
assert(difficultyQueue(cards,[...attempts,...second],opts).every(c=>cardDifficulty(c)===3));
assert(difficultyQueue(cards,[],{...opts,difficulty:'3'}).every(c=>cardDifficulty(c)===3));
assert(difficultyQueue(cards,[],{...opts,difficulty:'2',theme:'fork'}).every(c=>c.theme==='fork'&&c.difficulty===2));
assert(difficultyQueue(cards,[],{...opts,difficulty:'all'}).some(c=>cardDifficulty(c)>1));
const due=[...attempts,{id:'fail',sessionId:'later',cardId:level1[0].id,at:1000,success:false}];
assert.equal(difficultyQueue(cards,due,{...opts,now:700000})[0].id,level1[0].id);
for(const difficulty of ['1','2','3','progressive','all']){const q=difficultyQueue(cards,attempts,{...opts,difficulty});assert.equal(q.length,new Set(q.map(c=>c.family)).size);}
assert.match(difficultyNote(cards,attempts),/Intermedio/);
console.log('PASS difficulty: 8 verified enriched positions, gradual levels, clean distinct families, no mirror/retry farming, manual levels, theme filters, due priority and no duplicates.');
