import {Chess} from './vendor/chess.js';
const cache=new WeakMap();
// The original game's moves are immutable; retain history for repetition draws.
export function drawAt(moves,index,initial){
 let state=cache.get(moves);if(!state){const chess=new Chess(initial);state={chess,flags:[chess.isDraw()]};cache.set(moves,state);}
 while(state.flags.length<=index){const m=moves[state.flags.length-1];if(!m)return false;state.chess.move({from:m.from,to:m.to,promotion:m.promotion});state.flags.push(state.chess.isDraw());}
 return state.flags[index]||false;
}
