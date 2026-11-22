import {Chess} from './vendor/chess.js';
// A decisive result alone does not reveal whether a player resigned or lost on time.
export function gameOutcome(headers,fen){
 const result=headers?.Result||'*',reason=(headers?.Termination||'').trim(),normalized=reason.toLowerCase();
 let chess;try{chess=new Chess(fen)}catch{return null}
 if(!['1-0','0-1','1/2-1/2'].includes(result))return null;
 const winner=result==='1-0'?'Bianco':result==='0-1'?'Nero':null;
 if(chess.isCheckmate())return {kind:'mate',text:`Scacco matto · vince il ${winner}`};
 if(chess.isStalemate())return {kind:'draw',text:'Patta per stallo'};
 if(/resign|resigned|abbandon|aufgab|abandonn|abandono/i.test(normalized)&&winner)return {kind:'resign',text:`Abbandono del ${winner==='Bianco'?'Nero':'Bianco'} · vince il ${winner}`};
 if(/time forfeit|timeout|time out|tempo esaurito|flagged|zeitüberschreitung/i.test(normalized))return {kind:'time',text:winner?`Tempo esaurito · vince il ${winner}`:'Patta · tempo esaurito'};
 if(/agreement|agreed|concordat|mutuo acuerdo/i.test(normalized)&&!winner)return {kind:'draw',text:'Patta concordata'};
 if(!winner)return {kind:'draw',text:reason&&!/^(normal|unterminated)$/i.test(reason)?`Patta · ${reason}`:'Patta · motivo non specificato'};
 return {kind:'result',text:`Vince il ${winner} · motivo non specificato`};
}
