import assert from 'node:assert/strict';import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';import {studyUrl,theoryCard,studyFromQuery} from './dist/opening-study.js';
const book=JSON.parse(fs.readFileSync('dist/vendor/openings.json')),catalog=JSON.parse(fs.readFileSync('dist/vendor/opening-catalog.json'));
for(const pgn of ['1. e4 e5 2. Nf3 Nc6 3. Bc4','1. d4 d5 2. c4','1. Nh3 d5 2. g3','1. Nf3 d5 2. d4']){
 const c=new Chess();c.loadPgn(pgn);const ms=c.history({verbose:true}),m=ms.at(-1),url=studyUrl(m,ms),lesson=studyFromQuery(url.slice(url.indexOf('?')),book,catalog);assert.equal(lesson.fen,c.fen());assert.equal(lesson.ply,ms.length);assert(lesson.name);assert(theoryCard(m,{type:'book'},book,ms).includes(lesson.eco));assert.equal(theoryCard(m,{type:'best'},book,ms),'');assert(!url.includes('White'));const rebuilt=new Chess();rebuilt.loadPgn(lesson.pgn);assert.equal(rebuilt.fen(),c.fen());
}
const c=new Chess();c.loadPgn('1. e4 e5 2. Nf3');const ms=c.history({verbose:true});const link=studyUrl(ms[0],ms);assert.equal(studyFromQuery(link.slice(link.indexOf('?')),book,catalog).ply,1);
assert.throws(()=>studyFromQuery('?pgn=garbage',book,catalog));assert.equal(studyFromQuery('',book,catalog),null);assert.throws(()=>studyFromQuery('?pgn='+encodeURIComponent('1. f3 f6 2. Kf2 Kf7'),book,catalog));
console.log('PASS: opening/gambit identity, uncommon variants, transpositions, selected-ply link, legal replay, malformed/unrecognized input.');
