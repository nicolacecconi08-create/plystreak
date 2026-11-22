// Ai-Guess-the-Elo (Ilias Ouzounis, MIT), ONNX port by imnathaniel28.
// Predictions use only this game's positions, never names, ratings or archive data.
import {Chess} from './vendor/chess.js';
import {Engine,terminal} from './analysis.js';

export function encodeBoard(fen,side){
 const c=new Chess(fen),out=new Float32Array(128),values={p:1,n:3,b:3.5,r:5,q:9,k:20};
 const black=c.turn()==='b';
 for(const p of c.board().flat().filter(Boolean)){
  let i=(8-Number(p.square[1]))*8+p.square.charCodeAt(0)-97;if(black)i=63-i;
  out[i]=values[p.type]*(p.color===c.turn()?1:-1)/20;
 }
 out.fill(side==='w'?1:-1,64);return out;
}
// Match python-chess 1.11.2's default WDL model at its default ply=30.
export function wdl(cp,mate=null){
 if(mate!==null)return cp>0?[1,0,0]:[0,0,1];
 const m=.5,a=(((-1.06249702*m+7.42016937)*m+.89425629)*m)+348.60356174;
 const b=(((-5.33122190*m+39.57831533)*m-90.84473771)*m)+123.40620748;
 const win=x=>Math.floor(.5+1000/(1+Math.exp((a-Math.max(-4000,Math.min(4000,x*3.56)))/b)))/1000;
 const w=win(cp),l=win(-cp);return [w,1-w-l,l];
}
function score(result,sign){
 if(result.mate!=null)return (Math.sign(result.cp)*sign)*(1000-Math.abs(result.mate));
 if(!Number.isFinite(result.cp))throw Error('Valutazione Elo incompleta');
 return result.cp*sign;
}
export function encodeAnalysis(before,after,side,legalCount){
 const sign=side==='w'?1:-1,lines=before.lines||[];
 if(lines.length<Math.min(10,legalCount))throw Error('Mancano alternative per la stima Elo');
 const top=lines.slice(0,10).map(r=>score(r,sign)/1000);while(top.length<10)top.push(-1);
 return Float32Array.from([...top,...wdl(before.cp*sign,before.mate),score(after,sign)/1000,...wdl(after.cp*sign,after.mate)]);
}
export function decodeRating(probabilities){
 if(probabilities.length!==39||[...probabilities].some(p=>!Number.isFinite(p)||p<0))throw Error('Risposta del modello non valida');
 const sum=probabilities.reduce((s,p)=>s+p,0);if(Math.abs(sum-1)>.001)throw Error('Probabilità Elo non valide');
 return Math.round(probabilities.reduce((s,p,i)=>s+p*(i*100+50),0)/50)*50;
}
let runtime;
async function load(){
 if(!runtime)runtime=(async()=>{const ort=await import('./vendor/elo/ort.wasm.min.mjs');ort.env.wasm.numThreads=1;ort.env.wasm.wasmPaths=new URL('./vendor/elo/',import.meta.url).href;
  const response=await fetch(new URL('./vendor/elo/model.onnx',import.meta.url));if(!response.ok)throw Error('Modello Elo non disponibile');const session=await ort.InferenceSession.create(new Uint8Array(await response.arrayBuffer()),{executionProviders:['wasm']});return {ort,session};})();
 try{return await runtime}catch(e){runtime=null;throw e}
}
export async function estimateGame(moves,onProgress=()=>{},isCurrent=()=>true){
 if(!moves.length||moves.length>1000)throw Error('Partita non supportata per la stima Elo');
 if(new Chess(moves[0].before).turn()!=='w')throw Error('La stima Elo richiede una partita iniziata dal Bianco');
 const {ort,session}=await load(),engine=new Engine(()=>{});
 let hidden=new ort.Tensor('float32',new Float32Array(128),[1,2,64]),cell=new ort.Tensor('float32',new Float32Array(128),[1,2,64]),last=null;
 try{
  for(let i=0;i<moves.length;i+=2){
   const positions=new Float32Array(256),analysis=new Float32Array(34);
   for(let side=0;side<2;side++){
    const move=moves[i+side];if(!move){positions.fill(-1,192);analysis.fill(-1000,17);continue}
    if(!isCurrent())throw Error('Stima annullata');
    const count=new Chess(move.before).moves().length;
    let before=await engine.evaluate(move.before,'quick','',{multiPV:Math.min(10,count),limits:[99,100]});
    if(before.lines.length<Math.min(10,count))before=await engine.evaluate(move.before,'quick','',{multiPV:Math.min(10,count),limits:[99,800]});
    const after=terminal(new Chess(move.after))||await engine.evaluate(move.after,'quick','',{multiPV:1,limits:[99,100]});
    positions.set(encodeBoard(move.before,move.color),side*128);analysis.set(encodeAnalysis(before,after,move.color,count),side*17);
    onProgress(i+side+1,moves.length);
   }
   const result=await session.run({position:new ort.Tensor('float32',positions,[2,1,2,8,8]),evaluation:new ort.Tensor('float32',analysis,[2,1,17]),h0:hidden,c0:cell});
   hidden.dispose();cell.dispose();hidden=result.hn;cell=result.cn;
   const current=Float32Array.from(result.probs.data);result.probs.dispose();
   // A synthetic padding ply must not overwrite Black's last real prediction.
   if(!moves[i+1]&&last)current.set(last.slice(39),39);last=current;
  }
  return {w:decodeRating(last.slice(0,39)),b:moves.some(m=>m.color==='b')?decodeRating(last.slice(39)):null,model:'Ai-Guess-the-Elo',scale:'Lichess',plies:moves.length};
 }finally{engine.worker?.terminate();hidden.dispose();cell.dispose()}
}
