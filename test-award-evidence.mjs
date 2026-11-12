import assert from 'node:assert/strict';import {Chess} from './dist/vendor/chess.js';import {gradeMove,checkedGrade} from './dist/move-grade.js';
const c=new Chess(),move=c.move('e4'),line=(pv,cp=0)=>({pv,cp,depth:20}),before={fen:move.before,cp:0,depth:20,lines:[line(['e2e4']),line(['d2d4'],-400)]},after={fen:move.after,cp:0,depth:20,lines:[line(['e7e5'])]};
assert.equal(gradeMove({move,before,after}).type,'great');
for(const pv of [['e2e4'],['d2d4','e7e4'],['invalid'],[]])assert.notEqual(gradeMove({move,before:{...before,lines:[before.lines[0],line(pv,-400)]},after}).type,'great');
for(const args of [{before:{...before,fen:move.after},after},{before,after:{...after,fen:move.before}}])assert.throws(()=>gradeMove({move,...args}),/posizione diversa/);
const ac=new AbortController();let calls=0;await assert.rejects(checkedGrade({evaluate:async()=>{calls++;ac.abort();return before}},{move,before,after},{signal:ac.signal}),/interrotta/);assert.equal(calls,1);
console.log('PASS distinct legal alternatives, root consistency, cancelled verification');
