import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {drawAt} from './dist/draw-state.js';
import {animateBoard} from './dist/motion.js';
globalThis.matchMedia=()=>({matches:false});
let calls=0,cancels=0;const square={getBoundingClientRect:()=>({left:0,top:0}),dataset:{sq:'e1'},classList:{add(){}},animate:(_frames,options)=>{calls++;assert.equal(options.fill,'none');return {cancel(){cancels++}}}};
const board={dataset:{},querySelectorAll:()=>[],querySelector:()=>square,animate:square.animate};
const drawn='8/8/8/8/8/8/4k3/6K1 w - - 0 1';
animateBoard(board,drawn,false);assert.equal(calls,3);assert.equal(board.dataset.draw,'true');
animateBoard(board,drawn,false);assert.equal(calls,3);
animateBoard(board,new Chess().fen(),false);assert.equal(board.dataset.draw,'false');assert(cancels>=3);
globalThis.matchMedia=()=>({matches:true});animateBoard(board,drawn,false);assert.equal(calls,3);
globalThis.matchMedia=()=>({matches:false});const b={...board,dataset:{}};animateBoard(b,drawn,false,{rapid:true});assert.equal(calls,3);animateBoard(b,drawn,false,{rapid:false});assert.equal(calls,6);
const c=new Chess();c.loadPgn('1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8');const moves=c.history({verbose:true});assert(drawAt(moves,8,moves[0].before));assert(!drawAt(moves,4,moves[0].before));
const stalemate='7k/5K2/6Q1/8/8/8/8/8 b - - 0 1';assert(new Chess(stalemate).isStalemate());animateBoard(board,stalemate,false);assert.equal(board.dataset.draw,'true');
console.log('PASS: draw glow, both kings, no repeat, cancellation, reduced motion, rapid arrival, stalemate and repetition history');

// Transient effects follow legal moves, including the removed pawn in en passant.
function checkMarks(fen,san,expected){
 const game=new Chess(fen),marks=[];
 const squares=Object.fromEntries(game.board().flatMap((row,i)=>row.map((_,j)=>{
  const sq='abcdefgh'[j]+(8-i);
  return [sq,{dataset:{sq},getBoundingClientRect:()=>({left:j,top:i}),
   ownerDocument:{createElement:()=>({setAttribute(){},animate(){return {cancel(){}}}})},
   append(mark){marks.push([sq,mark.className])}}];
 })));
 const board={dataset:{},querySelectorAll:()=>Object.values(squares),querySelector:s=>s.endsWith(' img')?null:squares[s.slice(10,12)]};
 animateBoard(board,game.fen(),false);
 game.move(san);animateBoard(board,game.fen(),false);
 assert.deepEqual(marks.map(([sq,cls])=>sq+':'+cls.split('ripple-')[1]),expected);
}
checkMarks('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1','exd6',['d5:capture']);
checkMarks('4k3/8/8/8/8/8/8/4K2R w K - 0 1','O-O',['g1:castle','f1:castle']);
checkMarks('4k3/P7/8/8/8/8/8/4K3 w - - 0 1','a8=Q+',['a8:promotion','e8:check']);
