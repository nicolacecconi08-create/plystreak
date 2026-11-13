import {t,getLanguage} from './i18n.js';
import {Chess} from './vendor/chess.js';
import {moveEvidence,hanging,pins,opposite,names,values} from './tactics.js';
export const pieceName=p=>t(names[p]);
const piece=p=>pieceName(p.type)+' '+p.square;
export function localComment(move,before,after,grade,tone='warm'){
 const e=moveEvidence(move,after),c=e.c;if(c.isCheckmate())return t('c.mate');if(c.isStalemate())return t('c.stalemate');if(!grade)return t('c.noeval');
 if(after?.mate!=null&&after.cp*(move.color==='w'?1:-1)<0)return t('c.danger');
 const bad=grade.loss>.05;let fact;
 if(bad){if(e.reply?.captured){const r=e.reply,sq=r.flags.includes('e')?r.to[0]+(r.color==='w'?'5':'4'):r.to;fact=t('c.captureRisk',[pieceName(r.captured),sq,pieceName(r.piece),r.from])}
 else if(e.enemyFork.length>=2)fact=t('c.enemyFork',e.enemyFork.slice(0,2).map(piece));
 else if(e.enemyPins.length){const p=e.enemyPins[0];fact=t('c.pin',[p.pinned.square,p.attacker.square])}
 else if(e.loose.length)fact=t('c.loose',[pieceName(e.loose[0].type),e.loose[0].square]);else fact=t('c.noTactic');}
 else if(e.fork.length>=2)fact=t('c.fork',[move.to,...e.fork.slice(0,2).map(piece)]);
 else if(e.newPins.length)fact=t('c.newPin',[e.newPins[0].pinned.square]);
 else if(/[kq]/.test(move.flags))fact=t('c.castle');
 else if(move.captured)fact=t('c.capture',[pieceName(move.captured),move.to]);
 else if(['n','b'].includes(move.piece)&&move.from[1]===(move.color==='w'?'1':'8'))fact=t('c.develop',[pieceName(move.piece),move.to]);
 else if(c.isCheck())fact=t('c.check');else if(['d4','e4','d5','e5'].includes(move.to))fact=t('c.center',[pieceName(move.piece),move.to]);
 else fact=t('c.move',[pieceName(move.piece),move.from,move.to]);
 const n=[...move.after].reduce((n,c)=>n+c.charCodeAt(0),0)%3;
 const intro=tone==='quiet'?'':tone==='direct'?t(bad?'c.directBad':'c.directGood'):t((bad?['c.warn','c.warn2','c.warn3']:['c.good','c.good2','c.good3'])[n]);
 return [grade.type==='book'?t('c.book'):'',intro,fact].filter(Boolean).join(' ');
}
export function localAnswer(c,question,color=c.turn(),lastGrade=null){
 if(c.isGameOver())return t('c.finished');if(question==='last')return lastGrade?.move?localComment(lastGrade.move,lastGrade.reviewBefore||lastGrade.before,lastGrade.after,lastGrade,'direct'):t('c.first');
 if(c.turn()!==color)return t('c.wait');if(c.isCheck())return t('c.inCheck');
 const own=c.board().flat().filter(p=>p?.color===color),enemy=opposite(color),loose=hanging(c,color);
 if(question==='threat'){if(loose.length)return t('c.undefended',[loose.slice(0,3).map(piece).join(', ')]);const attacked=own.filter(p=>p.type!=='k'&&c.isAttacked(p.square,enemy));return attacked.length?t('c.defended',[attacked.slice(0,3).map(piece).join(', ')]):t('c.noThreat')}
 if(question==='king'){const king=own.find(p=>p.type==='k'),s=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const x=king.square.charCodeAt(0)+dx,y=+king.square[1]+dy;if((dx||dy)&&x>=97&&x<=104&&y>=1&&y<=8){const q=String.fromCharCode(x)+y;if(c.isAttacked(q,enemy))s.push(q)}}return s.length?t('c.kingThreat',[king.square,s.join(', ')]):t('c.kingQuiet',[king.square])}
 if(question==='activity'){const minor=own.filter(p=>'nb'.includes(p.type));if(!minor.length)return t(own.some(p=>'rq'.includes(p.type))?'c.heavy':'c.pawns');const home=minor.filter(p=>p.square[1]===(color==='w'?'1':'8'));return home.length?t('c.undeveloped',[home.map(piece).join(', ')]):t('c.activity')}
 const pin=pins(c,enemy)[0];if(pin)return t('c.pin',[pin.pinned.square,pin.attacker.square]);if(loose.length)return t('c.planLoose');return t(own.filter(p=>!['p','k'].includes(p.type)).length<=2?'c.endPlan':'c.plan');
}
export function localHint(c,step){if(!step||c.isCheck()||c.isGameOver())return {text:localAnswer(c,'plan'),squares:[]};const loose=hanging(c,c.turn());if(loose.length){const p=loose[0];return {text:t('c.hintLoose',[pieceName(p.type),p.square]),squares:[p.square]}}const moves=c.moves({verbose:true}),pieces=c.board().flat().filter(p=>p?.color===c.turn()&&!['p','k'].includes(p.type)),count=p=>moves.filter(m=>m.from===p.square).length;pieces.sort((a,b)=>(c.moveNumber()<=10?Number(!'nb'.includes(a.type))-Number(!'nb'.includes(b.type)):0)||count(a)-count(b));if(pieces.length){const p=pieces[0];return {text:t('c.hintActivity',[pieceName(p.type),p.square,count(p)]),squares:[p.square]}}return {text:t('c.pawns'),squares:[]}}
