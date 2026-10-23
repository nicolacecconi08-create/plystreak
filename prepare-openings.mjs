import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';
const dict={};let count=0;
for(const part of 'abcde'){
 const lines=fs.readFileSync(`dist/vendor/openings-${part}.tsv`,'utf8').trim().split('\n');const keys=lines.shift().split('\t');
 for(const line of lines){const vals=line.split('\t'),d=Object.fromEntries(keys.map((k,i)=>[k,vals[i]]));const c=new Chess();try{c.loadPgn(d.pgn);const ms=c.history({verbose:true});for(const m of ms){const key=m.after.split(' ').slice(0,4).join(' ');if(!dict[key])dict[key]={name:d.name,eco:d.eco}}dict[c.fen().split(' ').slice(0,4).join(' ')]={name:d.name,eco:d.eco};count++}catch(e){console.log(d.name,e.message)}}
}
fs.writeFileSync('dist/vendor/openings.json',JSON.stringify(dict));console.log(count+' openings; '+Object.keys(dict).length+' positions');
