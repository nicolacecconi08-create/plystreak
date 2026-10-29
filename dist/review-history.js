import {Chess} from './vendor/chess.js';
// Walk once through the game, preserving repetition/50-move history.
export function reviewHistory(moves,initial){let chess=new Chess(initial),ply=0;return index=>{if(index<ply){chess=new Chess(initial);ply=0;}while(ply<index){const m=moves[ply++];chess.move({from:m.from,to:m.to,promotion:m.promotion});}return chess;};}
