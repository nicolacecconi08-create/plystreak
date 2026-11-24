import {Chess} from './vendor/chess.js';

// Each goal names a square or an outcome, so equally legal solutions to mate
// and stalemate are accepted. Opening replies are part of the studied line.
const simple=(id,prompt,answer,fen)=>({id,prompt,answers:[answer],fen});
export const lessons=[
 simple('pawn','Spingi il pedone da e2 a e4. Dalla casa iniziale può avanzare di due passi.', 'e2e4'),
 simple('capture','Il pedone avanza diritto e cattura in diagonale. Prendi il pedone nero in d5.', 'e4d5','6k1/8/8/3p4/4P3/8/8/6K1 w - - 0 1'),
 simple('knight','Il cavallo salta a L. Portalo da g1 a f3, oltre i pedoni.', 'g1f3'),
 simple('bishop','L’alfiere segue una diagonale. Da c1 cattura la torre in h6.', 'c1h6','6k1/8/7r/8/8/8/8/2B3K1 w - - 0 1'),
 simple('rook','La torre segue righe e colonne. Da a1 prendi il pedone in a7.', 'a1a7','6k1/p7/8/8/8/8/8/R5K1 w - - 0 1'),
 simple('queen','La donna combina torre e alfiere. Cattura il cavallo in d5 con la donna in a2.', 'a2d5','6k1/8/8/3n4/8/8/Q7/6K1 w - - 0 1'),
 simple('king','Il re si muove di una casa. Esci dallo scacco della torre sulla colonna e andando in f1.', 'e1f1','4r1k1/8/8/8/8/8/8/4K3 w - - 0 1'),
 simple('castle','Arrocca corto. Muovi il re da e1 a g1 e osserva dove arriva la torre.', 'e1g1','r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'),
 {id:'mate',fen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',prompt:'Dai scacco matto. Il re nero deve essere attaccato e senza risposte legali.',goal:'mate'},
 {id:'draw',fen:'7k/8/5K2/5Q2/8/8/8/8 w - - 0 1',prompt:'Provoca uno stallo. Lascia il re nero senza mosse legali e senza scacco.',goal:'draw'},
 simple('fork','Usa il cavallo per attaccare contemporaneamente il re in e8 e la torre in a8.', 'b5c7','r3k3/8/8/1N6/8/8/8/6K1 w - - 0 1'),
 simple('pin','Inchioda il cavallo in c6 al re in e8. Porta l’alfiere da f1 a b5.', 'f1b5','4k3/8/2n5/8/8/8/8/5BK1 w - - 0 1'),
 {id:'italian',prompt:'Partita italiana. Occupa e4, sviluppa il cavallo in f3, poi l’alfiere in c4 verso f7.',answers:['e2e4','g1f3','f1c4'],replies:['e7e5','b8c6']},
 {id:'queens-gambit',prompt:'Gambetto di donna. Occupa d4, poi offri il pedone c per attaccare il centro nero.',answers:['d2d4','c2c4'],replies:['d7d5']}
];
export const quiz=['capture','castle','fork'];
export function startingLesson(answers){
 const firstMiss=quiz.findIndex((_,i)=>answers[i]!==true);
 return firstMiss<0?'italian':['pawn','king','fork'][firstMiss];
}
export function lessonPosition(lesson){return new Chess(lesson.fen)}
export function attemptLesson(game,lesson,step,from,to){
 const move=game.moves({square:from,verbose:true}).find(m=>m.to===to);
 if(!move)return {status:'illegal'};
 game.move(move);
 const correct=lesson.goal==='mate'?game.isCheckmate():lesson.goal==='draw'?game.isStalemate():from+to===lesson.answers[step];
 if(!correct){game.undo();return {status:'retry'}}
 const reply=lesson.replies?.[step];
 if(reply)game.move({from:reply.slice(0,2),to:reply.slice(2,4)});
 return {status:!reply?'complete':'next',last:game.history({verbose:true}).at(-1)};
}

