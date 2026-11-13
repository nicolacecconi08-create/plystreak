import {comparableEvaluations} from './evaluation-evidence.js';
import {Chess} from './vendor/chess.js';
export const uciOf=m=>m.from+m.to+(m.promotion||'');
export function legalVariation(fen,pv=[]){const c=new Chess(fen),positions=[fen],moves=[];for(const u of pv.slice(0,12)){if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u||''))break;try{moves.push(c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}));positions.push(c.fen());}catch{break}}return {positions,moves};}
export function compareEvaluations(best,played,side,same=false){
 const a=best?.lines?.[0]||best,b=played?.lines?.[0]||played;
 if(same)return {kind:'same',text:'La mossa giocata coincide con la prima scelta del motore. Puoi esplorare una possibile continuazione.'};
 if(!comparableEvaluations(best,played,16)||!a||!b||a.mate!=null||b.mate!=null||!Number.isFinite(a.cp)||!Number.isFinite(b.cp)||Math.min(a.depth||0,b.depth||0)<16||Math.abs(a.depth-b.depth)>2)return {kind:'uncertain',text:'Le analisi non sono abbastanza confrontabili per quantificare il vantaggio. La variante è una possibilità da studiare, non la prova di un guadagno certo.'};
 const delta=(a.cp-b.cp)*(side==='w'?1:-1);
 if(delta< -25)return {kind:'uncertain',text:'Le ricerche danno indicazioni discordanti: non mostro una differenza numerica affidabile.'};
 if(delta<=25)return {kind:'equal',text:'Le due mosse sono sostanzialmente equivalenti entro la tolleranza di questa analisi. Non c’è un miglioramento significativo dimostrato.'};
 return {kind:'better',delta:delta/100,text:`Il motore stima circa ${(delta/100).toFixed(2).replace('.',',')} pedoni di vantaggio in più per chi muove, confrontando entrambe le scelte dalla stessa posizione. È una stima alla profondità raggiunta.`};
}
