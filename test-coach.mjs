import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {LEVELS,undoTurn,gameOutcome,hintsFor,lessonFor} from './dist/coach-core.js';
import {sanitizeSettings,avatarSVG} from './dist/settings.js';
let c=new Chess();c.move('e4');c.move('e5');assert.equal(undoTurn(c,'w'),2);assert.equal(c.history().length,0);c.move('e4');c.move('e5');c.move('Nf3');assert.equal(undoTurn(c,'b'),2);assert.equal(c.turn(),'b');
c=new Chess();for(const m of ['f3','e5','g4','Qh4#'])c.move(m);assert.match(gameOutcome(c),/Vince il Nero/);const last=c.history({verbose:true}).at(-1);const lessons=lessonFor(last,{cp:0,lines:[]},{cp:-100000,mate:0,lines:[]},{type:'best',loss:0,accuracy:100});assert.equal(lessons.length,4);assert.match(lessons[2].text,/matto/i);
c=new Chess();const hints=hintsFor(c,{lines:[{pv:['e2e4','e7e5']}]});assert.match(hints[1],/e2/);assert.match(hints[2],/e4/);assert.equal(LEVELS.length,5);assert.ok(LEVELS.every((l,i)=>!i||l.skill>LEVELS[i-1].skill));
assert.equal(sanitizeSettings({theme:'bad',avatarColor:'<script>',coordinates:'false'}).theme,'dark');assert.equal(sanitizeSettings({coordinates:false}).coordinates,false);assert.ok(!avatarSVG({avatarColor:'<script>'}).includes('<script>'));assert.equal(sanitizeSettings({coachName:'A'.repeat(50)}).coachName.length,18);
console.log('PASS: undo for both sides, terminal mate, four-step coaching, progressive hints, level order, safe settings and avatar');
