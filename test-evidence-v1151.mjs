import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {gradeMove,isSacrifice} from './dist/move-grade.js';
import {compareEvaluations} from './dist/best-comparison.js';
import {makeCheckpoint,restoreCheckpoint} from './dist/review-checkpoint.js';
import {lineStory} from './dist/line-story.js';
const result=(pv,cp=50)=>({cp,mate:null,depth:20,lines:[{cp,mate:null,depth:20,pv}]});
const c=new Chess('6k1/5ppp/8/8/8/3B4/8/6K1 w - - 0 1'),move=c.move('Bxh7+'),before=result(['d3h7','g8h7','g1f2']),after=result(['h7g6']);
assert.equal(gradeMove({move,before,after}).type,'brilliant');
for(const flag of [{reliable:false},{bound:'lowerbound'},{lowerbound:true},{upperbound:true}])for(const target of ['root','line']){
 const b=structuredClone(before);Object.assign(target==='root'?b:b.lines[0],flag);
 assert.notEqual(gradeMove({move,before:b,after}).type,'brilliant');
 assert.equal(compareEvaluations(b,result(['h7g6'],-100),'w').kind,'uncertain');
 const saved=makeCheckpoint([move],[b,after],[{type:'brilliant',loss:0,accuracy:100}]);
 const loaded=restoreCheckpoint(saved,[move]);assert.notEqual(loaded.grades[0].type,'brilliant');
 const r=target==='root'?loaded.results[0]:loaded.results[0].lines[0];for(const key of Object.keys(flag))assert.equal(r[key],flag[key]);
}
const delayed=new Chess('rq4k1/8/8/8/8/8/8/RR4K1 w - - 0 1').move('Ra4');
assert.equal(isSacrifice(delayed,result(['a1a4','a8a4','b1b2','b8b7','b2b7'])),true,'a legal combination can recover the sacrifice later');
assert.equal(isSacrifice(move,result(['d3h7','g8h7','g1f2','h7h9'])),false,'invalid tail is not evidence');
assert.equal(compareEvaluations(result([],200),result([],0),'w').delta,2);
assert.equal(compareEvaluations(result([],-200),result([],0),'b').delta,2);
assert.equal(compareEvaluations(result([],15),result([],0),'w').kind,'equal');
const story=lineStory('7k/P7/8/8/8/8/8/7K w - - 0 1',['a7a8q','h8h7'],'w');assert.match(story,/promozione/);assert.match(story,/bilancio materiale è migliorato/);assert(!story.includes('non ci sono catture'));assert(!/\b[a-h][1-8]\b/.test(story));
console.log('PASS evidence: flags preserved, restored awards rechecked, delayed recovery, illegal PV tail, comparison both colors/ties, promotion story');
const start=new Chess(),e4=start.move('e4'),greatBefore=result(['e2e4'],100);greatBefore.lines.push({cp:-100,mate:null,depth:20,pv:['d2d4']});
assert.equal(gradeMove({move:e4,before:greatBefore,after:result(['e7e5'],100)}).type,'great');
greatBefore.lines[1].reliable=false;assert.notEqual(gradeMove({move:e4,before:greatBefore,after:result(['e7e5'],100)}).type,'great');
