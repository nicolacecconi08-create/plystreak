import {Chess} from './vendor/chess.js';
import {names,values,opposite,moveEvidence,hanging,pins} from './tactics.js';
const piece=p=>`${names[p.type]} in ${p.square}`;
const target=p=>(p.type==='q'||p.type==='r'?'la ':'il ')+piece(p);
export function briefComment(move,before,after,grade,tone='warm'){
 const e=moveEvidence(move,after),c=e.c;
 if(c.isCheckmate())return 'Scacco matto: hai chiuso la partita! Il re avversario non ha più risposte legali.';
 if(c.isStalemate())return 'È stallo: il re avversario non è sotto scacco e non ha mosse legali. La partita è patta.';
 if(!grade)return 'Mossa registrata. Non ho una valutazione sufficiente per giudicarla.';
 const negative=grade.loss>.05;let fact='';
 if(!negative&&after?.mate!=null&&after.cp*(move.color==='w'?1:-1)<0)return 'La posizione resta difficile: il motore vede ancora un matto contro il tuo re. Questa mossa non basta a eliminare la minaccia.';
 if(negative){
  if(after?.mate!=null&&after.cp*(move.color==='w'?1:-1)<0)fact='La tua mossa permette un attacco di matto contro il re. Prima di muovere, controlla gli scacchi disponibili all’avversario.';
  else if(e.reply?.captured){const r=e.reply,capturedSquare=r.flags.includes('e')?r.to[0]+(r.color==='w'?'5':'4'):r.to,undefended=!c.isAttacked(capturedSquare,move.color);fact=`${r.captured==='q'||r.captured==='r'?'La tua':'Il tuo'} ${names[r.captured]} in ${capturedSquare} ${undefended?'è attaccato e non è difeso':'può essere catturato dal '+names[r.piece]+' in '+r.from}. ${undefended?'Controlla quali pezzi rimangono scoperti dopo la tua mossa.':'Conta anche le ricatture prima di scegliere uno scambio.'}`}
  else if(e.enemyFork.length>=2)fact=`Ora l’avversario può creare un doppio attacco contro ${target(e.enemyFork[0])} e ${target(e.enemyFork[1])}. Controlla le minacce prima del tuo piano.`;
  else if(e.enemyPins.length){const p=e.enemyPins[0];fact=`${p.pinned.type==='q'||p.pinned.type==='r'?'La tua':'Il tuo'} ${piece(p.pinned)} è inchiodato al re dal ${names[p.attacker.type]} in ${p.attacker.square}. Non può abbandonare questa linea lasciando il re sotto scacco.`}
  else if(e.loose.length)fact=`${e.loose[0].type==='q'||e.loose[0].type==='r'?'La tua':'Il tuo'} ${piece(e.loose[0])} è attaccato e non è difeso. Controlla se la tua idea compensa questo rischio.`;
  else fact='Questa scelta peggiora la valutazione del motore. Il motivo non è abbastanza chiaro per riassumerlo con sicurezza: confronta le alternative nella revisione.';
  return (tone==='direct'?'Da rivedere. ':tone==='quiet'?'Attenzione. ':['Capita di lasciarsi sfuggire una minaccia. ', 'Fermiamoci un momento su questa mossa. ', 'Qui c’è un dettaglio utile da riconoscere. '][(move.from.charCodeAt(0)+Number(move.to[1]))%3])+fact;
 }
 if(e.fork.length>=2)fact=`Il tuo ${names[move.promotion||move.piece]} in ${move.to} attacca sia ${target(e.fork[0])} sia ${target(e.fork[1])}: un doppio attacco.`;
 else if(e.newPins.length){const p=e.newPins[0];fact=`Hai inchiodato ${target(p.pinned)} al re. Non può lasciare la linea se così espone il re allo scacco.`}
 else if(move.flags.includes('k')||move.flags.includes('q'))fact='Hai arroccato e portato la torre verso il centro. È un buon passo per coordinare i tuoi pezzi.';
 else if(move.captured)fact=`Hai catturato un ${names[move.captured]} in ${move.to} senza peggiorare sensibilmente la posizione. Tieni d’occhio anche i pezzi rimasti sotto attacco.`;
 else {const old=new Chess(move.before),was=hanging(old,move.color).find(p=>p.square===move.from);if(was&&!c.isAttacked(move.to,opposite(move.color)))fact=`Hai spostato il ${names[move.piece]} da ${move.from}, dove era attaccato e senza difesa, a una casa non attaccata.`;
 else if(['n','b'].includes(move.piece)&&move.from[1]===(move.color==='w'?'1':'8')){const centers=['d4','e4','d5','e5'].filter(sq=>c.attackers(sq,move.color).includes(move.to));fact=`Hai sviluppato il ${names[move.piece]} in ${move.to}${centers.length?', da dove controlla '+centers.join(' e '):'. Ora può partecipare al piano'}.`}
 else if(c.isCheck())fact='Hai dato scacco senza peggiorare sensibilmente la valutazione. Il re avversario deve rispondere alla minaccia.';
 else if(['d4','e4','d5','e5'].includes(move.to))fact=`Con il ${names[move.piece]} in ${move.to} occupi una casa centrale. Ora pensa a come far collaborare gli altri pezzi con questo.`;
 else fact='Non emerge un peggioramento significativo. Porta avanti la tua idea, tenendo d’occhio ciò che cambia dopo la risposta.';}
 return (tone==='direct'?'Buona scelta. ':tone==='quiet'?'Bene. ':['Bella scelta! ', 'Bene, questa idea funziona. ', 'Mi piace questa scelta. '][(move.from.charCodeAt(0)+Number(move.to[1]))%3])+fact;
}
export function strategicHint(c){if(c.isCheck())return 'Il tuo re è sotto scacco: prima risolvi questo problema.';const loose=hanging(c,c.turn());if(loose.length)return `Controlla il tuo ${piece(loose[0])}: è attaccato e non è difeso. Come puoi gestire la minaccia?`;const pin=pins(c,opposite(c.turn()))[0];if(pin)return `Il tuo ${piece(pin.pinned)} è inchiodato al re: tienine conto quando conti i difensori.`;const attacked=c.board().flat().filter(p=>p&&p.color===c.turn()&&p.type!=='k'&&c.isAttacked(p.square,opposite(c.turn())));if(attacked.length)return `Controlla attaccanti e difensori del tuo ${piece(attacked.sort((a,b)=>values[b.type]-values[a.type])[0])}.`;return c.moveNumber()<12?'Quale pezzo deve ancora entrare in gioco? Pensa anche alla sicurezza del re.':'Qual è il tuo pezzo meno attivo? Cerca un modo per migliorarlo senza trascurare le minacce.'}
