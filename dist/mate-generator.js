import {Chess} from './vendor/chess.js';
import {uciOf} from './best-comparison.js';

const anchors=[0,1,9,2,10,18,3,11,19,27];
const block=anchors.length*64*64*2;
function transform(square,flags){
 let x=square%8,y=square>>3;
 if(flags&1)x=7-x;
 if(flags&2)y=7-y;
 if(flags&4)[x,y]=[y,x];
 return x+8*y;
}
const maps=Array.from({length:8},(_,f)=>Array.from({length:64},(_,s)=>transform(s,f)));
const canonical=maps[0].map(k=>maps.find(m=>anchors.includes(m[k])));
const squareIndex=s=>s.charCodeAt(0)-97+(Number(s[1])-1)*8;
const squareName=i=>'abcdefgh'[i%8]+(1+(i>>3));

export function localPuzzleDay(date=new Date()){
 return Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000);
}

export function mateGenerator(bytes){
 if(bytes.length!==block*2)throw Error('Tabella dei problemi non disponibile.');
 const roots=[];
 for(let i=0;i<bytes.length;i+=2)if([5,7,9,11].includes(bytes[i]))roots.push(i);
 if(!roots.length)throw Error('Tabella dei problemi vuota.');
 function distance(game){
  const pieces=game.board().flat().filter(Boolean),slider=pieces.find(p=>p.type==='q'||p.type==='r');
  if(!slider||pieces.length!==3)return 255;
  const king=squareIndex(pieces.find(p=>p.type==='k'&&p.color===slider.color).square);
  const enemy=squareIndex(pieces.find(p=>p.type==='k'&&p.color!==slider.color).square);
  const map=canonical[king];
  const index=((anchors.indexOf(map[king])*64+map[squareIndex(slider.square)])*64+map[enemy])*2;
  return bytes[(slider.type==='r'?block:0)+index+Number(game.turn()!==slider.color)];
 }
 function line(game){
  const copy=new Chess(game.fen()),moves=[],positions=[copy.fen()];
  let depth=distance(copy);
  if(depth===255)throw Error('Posizione fuori dal percorso verificato.');
  while(depth>0){
   const next=copy.moves({verbose:true}).find(move=>distance(new Chess(move.after))===depth-1);
   if(!next)throw Error('Continuazione non disponibile.');
   copy.move(uciOf(next));moves.push(next);positions.push(copy.fen());depth--;
  }
  if(!copy.isCheckmate())throw Error('Matto non confermato.');
  return {moves,positions};
 }
 // A coprime stride walks every root before the sequence cycles.
 const stride=roots.length%7919===0?1:7919;
 function card(seed){
  const round=Math.floor(seed/roots.length),slot=roots[((seed%roots.length)*stride)%roots.length];
  const packed=(slot%block)>>1,king=anchors[packed>>12],slider=(packed>>6)&63,enemy=packed&63;
  const map=maps[(seed+round)%8],side=(seed+round)%2?'b':'w',other=side==='w'?'b':'w';
  const game=new Chess();game.clear();
  for(const [square,type,color] of [[king,'k',side],[slider,slot>=block?'r':'q',side],[enemy,'k',other]])game.put({type,color},squareName(map[square]));
  const fen=game.fen().replace(' w ',' '+side+' ');
  return {id:'mate-'+fen.split(' ').slice(0,2).join(' '),fen,source:'generated',theme:'king',turns:(bytes[slot]+1)/2,difficulty:bytes[slot]<=7?2:3};
 }
 return {card,line,distance,count:roots.length};
}
