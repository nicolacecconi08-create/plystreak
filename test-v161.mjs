import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {validateBackup} from './dist/backup.js';
import {coachAnswer} from './dist/brief-coach.js';
const c=new Chess();c.loadPgn('1. e4 e5 *');const m=c.history({verbose:true})[0];const data=validateBackup({format:'plystreak-backup',version:2,games:[{id:'test',pgn:c.pgn(),analysis:{version:2,details:[{ply:0,fen:m.before,afterFen:m.after,side:'w',loss:0,accuracy:100,type:'constructor'}]}}]});assert.equal(data.games[0].analysis.details[0].type,'good');
const ending=new Chess('8/k7/2P5/4K3/8/8/8/8 w - - 0 1');assert(coachAnswer(ending,'activity','w').includes('soltanto re e pedoni'));
const rook=new Chess('6k1/8/8/8/8/5K2/1R6/8 w - - 0 1');assert(coachAnswer(rook,'activity','w').includes('torri o donna'));
console.log('PASS 1.6.1: untrusted move labels normalized; king/pawn and rook endgame coaching.');
