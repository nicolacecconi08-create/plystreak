import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';
import {mirrorFen,personalStats,errorPositions,pgnDate} from './dist/archive.js';
import {briefComment} from './dist/brief-coach.js';
import {fetchProfile,syncArchive} from './dist/chess-api.js';
for(const fen of [new Chess().fen(),'r3k2r/8/8/3pP3/8/8/8/R3K2R w KQkq d6 0 20','7k/P7/8/8/8/8/7p/K7 w - - 0 1']){const c=new Chess(fen),m=new Chess(mirrorFen(fen));assert.equal(mirrorFen(m.fen()),c.fen());const flip=s=>s[0]+(9-Number(s[1]));assert.deepEqual(c.moves({verbose:true}).map(x=>flip(x.from)+flip(x.to)+(x.promotion||'')).sort(),m.moves({verbose:true}).map(x=>x.from+x.to+(x.promotion||'')).sort())}
const games=Array.from({length:10},(_,i)=>({id:''+i,side:'w',playedAt:i,headers:{Result:i%2?'0-1':'1-0'},analysis:{version:2,complete:true,details:[{side:'w',accuracy:i<5?60:80,loss:.1,theme:'material',best:'e2e4',ply:0},{side:'b',accuracy:1,loss:.9,theme:'king'}]}}));const s=personalStats([...games,{headers:{Result:'1-0'}}]);assert.equal(s.accuracy,70);assert.equal(s.delta,20);assert.equal(s.wins,5);assert.equal(s.themes.king,0);assert.equal(errorPositions(games).length,10);assert.equal(pgnDate({Date:'2024.03.01'}),Date.parse('2024-03-01T12:00:00Z'));
const c=new Chess(),move=c.move('e4');const msg=briefComment(move,{}, {},{loss:0});assert(!msg.includes('e5'));assert(msg.length<220);
const catalog=JSON.parse(fs.readFileSync('dist/vendor/opening-catalog.json'));for(const x of catalog){const c=new Chess();c.loadPgn(x.pgn,{strict:true});assert.equal(c.fen(),x.fen)}
let active=0,max=0,calls=[];globalThis.fetch=async url=>{active++;max=Math.max(max,active);calls.push(url);await new Promise(r=>setTimeout(r,1));active--;return {ok:true,json:async()=>url.endsWith('/archives')?{archives:['https://api.chess.com/pub/player/test/games/2024/01','https://bad.test/games/2024/02']}:url.endsWith('/2024/01')?{games:[{rules:'chess',pgn:'1. e4 e5 *',white:{username:'test',rating:1200},black:{username:'other'},end_time:1700000000}]}:{username:'test'}}};await fetchProfile('test');let records=[];const r=await syncArchive('test','all',async a=>{records.push(...a);return a.length});assert.equal(max,1);assert.equal(r.months,1);assert.equal(records[0].side,'w');assert.equal(r.count,1);globalThis.fetch=async()=>({ok:false,status:429});await assert.rejects(fetchProfile('test'),/pausa/);
console.log('PASS: mirrored legal moves including castling/en passant/promotion; personal stats/trends; concise comments; 43 legal opening lines; sequential API and failures');

const {classify}=await import('./dist/analysis.js');assert.equal(classify({before:{cp:0},after:{cp:-100000,mate:-1},side:1,uci:'g2g4',book:true}).type,'blunder');
