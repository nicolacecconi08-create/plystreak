import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';
import {lessons,lessonPosition,attemptLesson,startingLesson} from './dist/lesson-path.js';
import {openingConclusion} from './dist/opening-conclusion.js';
import {setLanguage,t} from './dist/i18n.js';
assert.equal(startingLesson([false,false,false]),'pawn');
assert.equal(startingLesson([true,false,true]),'king');
assert.equal(startingLesson([true,true,false]),'fork');
assert.equal(startingLesson([true,true,true]),'italian');
for(const lesson of lessons){
 const chess=lessonPosition(lesson);
 const answers=lesson.answers||(lesson.goal==='mate'?['g6g7']:['f5g6']);
 for(const [i,uci] of answers.entries()){
  const old=chess.fen();assert.equal(attemptLesson(chess,lesson,i,'a3','a8').status,'illegal');assert.equal(chess.fen(),old);
  assert.equal(attemptLesson(chess,lesson,i,uci.slice(0,2),uci.slice(2)).status,i===answers.length-1?'complete':'next',lesson.id);
 }
 if(lesson.goal==='draw')assert(chess.isStalemate());
 if(lesson.goal==='mate')assert(chess.isCheckmate());
}
const game=new Chess(),initial=game.fen();assert.equal(attemptLesson(game,lessons[0],0,'a2','a3').status,'retry');assert.equal(game.fen(),initial);
const catalog=JSON.parse(fs.readFileSync('dist/vendor/opening-catalog.json'));for(const item of catalog){game.loadPgn(item.pgn);assert.equal(game.fen(),item.fen);assert.equal(openingConclusion(game).length,3)}
for(const lang of ['en','fr','de','es']){setLanguage(lang);for(const lesson of lessons)assert.notEqual(t(lesson.prompt),lesson.prompt)}
console.log('PASS placement, legal lessons, openings from both sides, retry, mate and stalemate, localized prompts, all catalog conclusions');
