import os from 'node:os';import path from 'node:path';
import {Chess} from './dist/vendor/chess.js';import fs from 'node:fs';import {createRequire} from 'node:module';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'plystreak-catalog-'));for(const n of ['stockfish-19-lite-single.js','stockfish-19-lite-single.wasm'])fs.copyFileSync('dist/vendor/'+n,path.join(temp,n));fs.writeFileSync(path.join(temp,'package.json'),'{"type":"commonjs"}');const require=createRequire(import.meta.url),create=require(path.join(temp,'stockfish-19-lite-single.js'));
const seeds=[
 ['fork','doppio-1',{g1:'K',e4:'N',e8:'k',c8:'q',a2:'P',h2:'P',a7:'p',h7:'p'},'e4d6'],
 ['fork','doppio-2',{a1:'K',d4:'N',h6:'k',h4:'q',a2:'P',b7:'p'},'d4f5'],
 ['fork','doppio-3',{g1:'K',d5:'N',g8:'k',c8:'q',h2:'P',h7:'p'},'d5e7'],
 ['fork','doppio-4',{g1:'K',f4:'N',g7:'k',c7:'q',h2:'P',a7:'p'},'f4e6'],
 ['pin','inchiodatura-1',{g1:'K',e5:'B',h1:'R',g7:'k',f6:'n',h5:'q'},'h1h5'],
 ['pin','inchiodatura-2',{a1:'K',d4:'B',g1:'R',f6:'k',e5:'n',g4:'q'},'g1g4'],
 ['pin','inchiodatura-3',{g1:'K',f1:'R',c4:'N',f8:'k',f6:'b',e5:'q'},'c4e5'],
 ['pin','inchiodatura-4',{g1:'K',e1:'R',a6:'B',e8:'k',e7:'r',b7:'q'},'a6b7'],
 ['hanging','presa-1',{g1:'K',d3:'B',a8:'k',h7:'q',a2:'P'},'d3h7'],
 ['hanging','presa-2',{g1:'K',f3:'N',h8:'k',e5:'r',a2:'P',a7:'p'},'f3e5'],
 ['hanging','presa-3',{g1:'K',c1:'R',g8:'k',c6:'q',h2:'P',h7:'p'},'c1c6'],
 ['hanging','presa-4',{g1:'K',d2:'Q',h8:'k',d7:'r',h2:'P',h7:'p'},'d2d7'],
 ['king','matto-1',{g1:'K',e1:'R',g8:'k',f7:'p',g7:'p',h7:'p',f2:'P',g2:'P',h2:'P'},'e1e8'],
 ['king','matto-2',{c1:'K',d1:'R',b8:'k',a7:'p',b7:'p',c7:'p',a2:'P',b2:'P',c2:'P'},'d1d8'],
 ['king','matto-3',{f6:'K',g6:'Q',h8:'k',a7:'p'},'g6g7'],
 ['king','matto-4',{c6:'K',b6:'Q',a8:'k',h7:'p'},'b6b7']
];
const engine=create();let receiver;engine.listener=s=>receiver?.(s);
await new Promise(r=>{receiver=s=>{if(s==='uciok')r()};engine.processCommand('uci')});engine.processCommand('setoption name MultiPV value 2');
async function evaluate(fen,search=''){return new Promise((resolve,reject)=>{let lines={};const timer=setTimeout(()=>reject(Error('timeout')),15000);receiver=s=>{if(s.startsWith('info ')&&s.includes(' pv ')&&!s.includes('bound')){const m=s.match(/score (cp|mate) (-?\d+)/);if(m){const n=+(s.match(/multipv (\d+)/)?.[1]||1);lines[n]={cp:m[1]==='mate'?(+m[2]>0?100000:-100000):+m[2],mate:m[1]==='mate'?+m[2]:null,pv:s.split(' pv ')[1].split(' ')}}}if(s.startsWith('bestmove')){clearTimeout(timer);resolve({...lines[1],best:s.split(' ')[1]})}};engine.processCommand('position fen '+fen);engine.processCommand('go depth 20 movetime 2200'+(search?' searchmoves '+search:''))})}
const bank=[];
for(const [theme,id,board,solution] of seeds){const c=new Chess();c.clear();for(const [sq,p] of Object.entries(board))c.put({type:p.toLowerCase(),color:p===p.toUpperCase()?'w':'b'},sq);const fen=c.fen();const blackFen=fen.replace(' w ',' b ');if(new Chess(blackFen).isCheck())throw Error(id+' enemy starts in check');const m=c.move({from:solution.slice(0,2),to:solution.slice(2,4)});const base=await evaluate(fen),chosen=await evaluate(fen,solution);console.log(id,base.best,base.cp,chosen.cp,'delta',base.cp-chosen.cp,flush());bank.push({id:'lesson-'+id,theme,fen,solution,objective:theme==='king'?'Trova il matto in una mossa.':theme==='fork'?'Crea un doppio attacco con il cavallo.':theme==='pin'?'Sfrutta un’inchiodatura per guadagnare materiale.':'Trova una cattura favorevole.',target:m.captured?m.to:null,verified:{engine:'Stockfish 19 Lite',limit:'depth 20 / 2200 ms',best:base.best,cp:base.cp,solutionCp:chosen.cp}})}
function flush(){return ''}
fs.writeFileSync('dist/vendor/training-catalog.json',JSON.stringify(bank,null,2));console.log('Saved',bank.length);fs.rmSync(temp,{recursive:true,force:true});process.exit();
