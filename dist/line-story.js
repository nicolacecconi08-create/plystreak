import {Chess} from './vendor/chess.js';
import {legalVariation} from './best-comparison.js';
import {humanFacts} from './human-coach.js';
const names={p:'pedone',n:'cavallo',b:'alfiere',r:'torre',q:'donna',k:'re'};
const noun=p=>({p:'il pedone',n:'il cavallo',b:'l’alfiere',r:'la torre',q:'la donna',k:'il re'})[p];
const values={p:1,n:3,b:3,r:5,q:9,k:0};
const balance=(fen,side)=>new Chess(fen).board().flat().reduce((n,p)=>n+(p?(p.color===side?1:-1)*values[p.type]:0),0);
export function stepStory(move){
 const who=move.color==='w'?'Il Bianco':'Il Nero';
 const action=move.flags.includes('k')||move.flags.includes('q')?`${who} arrocca: sposta il re e porta la torre verso il centro.`:move.captured?`${who} cattura un ${names[move.captured]} con ${noun(move.piece)}.`:`${who} sposta ${noun(move.piece)}.`;
 return action+' '+humanFacts(move).slice(0,2).join(' ');
}
export function lineStory(fen,pv,side){
 const line=legalVariation(fen,pv),first=line.moves[0];
 if(!first)return 'Non ho una continuazione verificata da mostrarti per questa posizione.';
 const mate=line.moves.find(m=>new Chess(m.after).isCheckmate());
 if(mate)return `In questo esempio il ${mate.color==='w'?'Bianco':'Nero'} arriva a dare scacco matto: alla fine il re è attaccato, non può scappare e nessun pezzo può salvarlo. Segui i passaggi per vedere come si arriva a chiudergli ogni difesa. È un esempio di gioco possibile, non ciò che accadrà necessariamente.`;
 const captures=line.moves.filter(m=>m.captured),delta=captures.reduce((n,m)=>n+(m.color===side?1:-1)*values[m.captured],0);
 let story=humanFacts(first,{lines:[{pv:pv.slice(1)}]}).slice(0,2).join(' ');
 if(captures.length){const own=captures.filter(m=>m.color===side).map(m=>names[m.captured]),enemy=captures.filter(m=>m.color!==side).map(m=>names[m.captured]);story+=' In questi passaggi, '+(own.length?'il tuo lato cattura: '+own.join(', '):'il tuo lato non cattura pezzi')+'; '+(enemy.length?'l’avversario cattura: '+enemy.join(', '):'l’avversario non cattura pezzi')+'. ';story+=delta===0?'Le catture si compensano come valore: prendere un pezzo qui non significa averne guadagnato uno.':delta<0?'Alla fine di questo esempio hai perso più valore di quanto hai preso. Questo aiuta a vedere il costo degli scambi.':'Alla fine di questo esempio hai preso più valore di quanto hai perso. Questo mostra cosa puoi ottenere se vengono giocate queste risposte.';story+=' Le risposte possono cambiare e gli scambi potrebbero proseguire.';}
 else story+=' In questi passaggi non ci sono catture: guarda come cambiano gli attacchi e le possibilità dei pezzi, una mossa alla volta. Questo da solo non dimostra un vantaggio.';
 return story;
}
