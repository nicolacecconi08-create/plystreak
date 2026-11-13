import fs from 'node:fs';
import {Chess} from './dist/vendor/chess.js';
const defs=[],nodes={},key=fen=>fen.split(' ').slice(0,4).join(' ');
for(const p of 'abcde'){
 const rows=fs.readFileSync('dist/vendor/openings-'+p+'.tsv','utf8').trim().split('\n');rows.shift();
 for(const row of rows){const [eco,name,pgn]=row.trimEnd().split('\t');const c=new Chess();const id=defs.push([eco,name])-1;
 const tokens=pgn.split(/\s+/).filter(x=>!/^\d+\.(\.\.)?$/.test(x));
 for(const token of tokens){let k=key(c.fen());const n=nodes[k]??=[[],{}];const m=c.move(token),u=m.from+m.to+(m.promotion||'');(n[1][u]??=[]).push(id)}
 const n=nodes[key(c.fen())]??=[[],{}];n[0].push(id);
 }}
fs.writeFileSync('dist/vendor/explorer.json',JSON.stringify({defs,nodes}));console.log(defs.length,'named lines;',Object.keys(nodes).length,'positions')
