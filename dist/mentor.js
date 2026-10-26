import {getLanguage} from './i18n.js';
import {localHint} from './coach-localized.js';
import {coachAnswer} from './brief-coach.js';
import {hanging,names,opposite} from './tactics.js';
export function hintFor(c,step=0){if(getLanguage()!=='it')return localHint(c,step);
 if(step===0||c.isCheck()||c.isGameOver())return {text:coachAnswer(c,'plan'),squares:[]};
 const side=c.turn(),loose=hanging(c,side);if(loose.length){const p=loose[0];return {text:`Guarda questo pezzo: ${names[p.type]} in ${p.square}. È attaccato e senza difesa. Puoi spostarlo, difenderlo o cercare un compenso? Confronta le possibilità prima di scegliere.`,squares:[p.square]}}
 const moves=c.moves({verbose:true}),pieces=c.board().flat().filter(p=>p?.color===side&&!['p','k'].includes(p.type));
 if(pieces.length){const count=p=>moves.filter(m=>m.from===p.square).length;pieces.sort((a,b)=>(c.moveNumber()<=10?Number(!['n','b'].includes(a.type))-Number(!['n','b'].includes(b.type)):0)||count(a)-count(b));const p=pieces[0];return {text:`Osserva questo pezzo: ${names[p.type]} in ${p.square}. Ha ${count(p)} mosse legali: questo non ne misura il valore, ma può aiutarti a capire se è attivo o vincolato a una difesa.`,squares:[p.square]}}
 const king=c.board().flat().find(p=>p?.color===side&&p.type==='k');return {text:'Con re e pedoni, conta i tempi di avanzata e verifica quali pedoni il re può sostenere. Non tutte le spinte verso la promozione migliorano la posizione.',squares:king?[king.square]:[]};
}
export function attackedSquares(c,color){return c.board().flat().filter(p=>p?.color===color&&p.type!=='k'&&c.isAttacked(p.square,opposite(color))).map(p=>p.square)}
