import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {BOTS,practiceReply,lessonFor} from './dist/coach-core.js';
import {setLanguage,languages} from './dist/i18n.js';
const chess=new Chess(),legal=chess.moves({verbose:true}).map(m=>m.from+m.to);
for(const [level,bot] of BOTS.entries()){
 let slips=0;
 for(let n=0;n<200;n++){
  const move=practiceReply(chess,level,()=>n/200);
  if(move){assert(legal.includes(move));slips++}
 }
 assert.equal(slips,Math.round(bot.slip*200));
}
const move=chess.move('e4'),before={cp:25,lines:[{pv:['e2e4']}]},after={cp:18,lines:[{pv:['e7e5']}]};
for(const lang of languages){
 setLanguage(lang);
 const comments=['warm','direct','quiet'].map(tone=>lessonFor(move,before,after,{type:'best',accuracy:99,loss:0},tone)[0].text);
 assert.equal(new Set(comments).size,3,lang);
}
console.log('PASS five graded legal-choice policies and distinct coaching tones in five languages');
