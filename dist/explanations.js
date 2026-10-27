import {humanFacts,humanReason} from './human-coach.js';
import {t,getLanguage} from './i18n.js';
import {localComment,pieceName} from './coach-localized.js';
import {Chess} from './vendor/chess.js';
const pieces={p:'pedone',n:'cavallo',b:'alfiere',r:'torre',q:'donna',k:'re'};
const values={p:1,n:3,b:3,r:5,q:9,k:0};
export function scoreText(r){if(!r)return 'Non disponibile';if(r.mate===0)return r.cp>0?'Matto al Nero':'Matto al Bianco';if(r.mate!=null)return `${r.cp>0?'Bianco':'Nero'}: matto in ${Math.abs(r.mate)}`;return `${r.cp>0?'+':''}${(r.cp/100).toFixed(2)}`}
export function decodeLine(fen,pv=[]){const c=new Chess(fen),out=[];for(const u of pv.slice(0,10)){try{const number=c.moveNumber(),m=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]||'q'});out.push({...m,number,uci:u})}catch{break}}return out}
export function materialBalance(c,color){return c.board().flat().filter(Boolean).reduce((n,p)=>n+(p.color===color?1:-1)*values[p.type],0)}
export function explainMove({move,before,after,grade,opening}){
 const a=new Chess(move.before),b=new Chess(move.after),side=move.color,other=side==='w'?'b':'w',who=side==='w'?'Il Bianco':'Il Nero',enemy=side==='w'?'il Nero':'il Bianco',facts=[],center=['d4','e4','d5','e5'];
 const best=decodeLine(move.before,before?.lines?.[0]?.pv),reply=decodeLine(move.after,after?.lines?.[0]?.pv),same=best[0]?.uci===move.from+move.to+(move.promotion||'');
 let action=`${who} sposta ${['q','r'].includes(move.piece)?'la':'il'} ${pieces[move.piece]} da ${move.from} a ${move.to}.`;
 if(move.flags.includes('k')||move.flags.includes('q'))action=`${who} arrocca ${move.flags.includes('k')?'corto':'lungo'}: il re va in ${move.to} e la torre entra in gioco.`;
 else if(move.captured)action=`${who} gioca ${move.san}: il ${pieces[move.piece]} da ${move.from} cattura un ${pieces[move.captured]} ${move.flags.includes('e')?'en passant':'in '+move.to}.`;
 if(move.promotion)action+=` Il pedone viene promosso a ${pieces[move.promotion]}.`;
 if(b.isCheckmate())facts.push('È scacco matto: il re avversario è sotto scacco e non esiste alcuna risposta legale.');
 else if(b.isStalemate())facts.push('È stallo: l’avversario non è sotto scacco ma non ha mosse legali. La posizione è patta.');
 else if(b.isCheck())facts.push(`La mossa dà scacco: ${enemy} deve mettere al sicuro il re, catturare il pezzo attaccante o, quando possibile, interporre un pezzo.`);
 if(!b.isGameOver()){
  if(['n','b'].includes(move.piece)&&move.from[1]===(side==='w'?'1':'8')&&move.to[1]!==move.from[1])facts.push(`Il ${pieces[move.piece]} lascia la traversa iniziale: è una mossa di sviluppo.`);
  if(center.includes(move.to))facts.push(`Il ${pieces[move.piece]} occupa ${move.to}, una delle quattro case centrali.`);
  const targets=b.board().flat().filter(p=>p&&p.color!==side&&p.type!=='p'&&b.attackers(p.square,side).includes(move.to));
  if(targets.length)facts.push(`Da ${move.to}, il ${pieces[move.promotion||move.piece]} punta ${targets.map(p=>`${pieces[p.type]} in ${p.square}`).join(' e ')}. Le linee di attacco non garantiscono che una cattura sia conveniente o legale se il pezzo è inchiodato.`);
  const captures=b.moves({verbose:true}).filter(m=>m.to===move.to&&m.captured);
  if(captures.length)facts.push(`L’avversario può catturare legalmente il pezzo in ${move.to} con ${captures.map(m=>m.san).join(' oppure ')}. Per capire se conviene, controlla la continuazione del motore: una cattura può essere seguita da una ricattura.`);
 }
 const controlledA=center.filter(s=>a.isAttacked(s,side)).length,controlledB=center.filter(s=>b.isAttacked(s,side)).length;
 const balance=materialBalance(b,side),delta=balance-materialBalance(a,side);
 let reason='La valutazione di questa mossa non è ancora disponibile.';
 if(grade){const loss=(grade.loss*100).toFixed(1);const reasons={book:`La posizione appartiene al repertorio delle aperture${opening?`: ${opening.eco} · ${opening.name}`:''}. “Teoria” indica una posizione conosciuta; la valutazione e la perdita stimata restano visibili sotto.`,best:'È la prima scelta di Stockfish e mantiene la valutazione entro la tolleranza prevista.',excellent:'Resta molto vicina alla valutazione precedente: la perdita stimata non supera 2 punti percentuali.',good:'È una scelta giocabile secondo questo criterio, ma cede tra 2 e 5 punti percentuali di probabilità stimata.',great:'È la prima scelta del motore; la seconda alternativa analizzata è sensibilmente peggiore. Per questo la scelta viene considerata decisiva.',brilliant:'È la prima scelta del motore e nella sua continuazione compare un sacrificio di materiale, mantenendo una posizione non perdente secondo il criterio del sito. Questa etichetta è euristica.',inaccuracy:`La posizione peggiora: la perdita stimata è di ${loss} punti percentuali. Confronta la tua scelta con l’alternativa proposta.`,mistake:`La mossa cede una parte importante delle possibilità della posizione: ${loss} punti percentuali stimati. La risposta del motore mostra come l’avversario può approfittarne.`,blunder:`La perdita stimata supera 20 punti percentuali (${loss}). La continuazione aiuta a distinguere un problema di materiale, un attacco al re o un altro svantaggio.`,miss:'Dopo un errore dell’avversario, questa scelta lascia sfuggire il vantaggio stimato ottenuto. Confrontala con la migliore alternativa prima della mossa.'};reason=reasons[grade.type]||reason;
 if(after?.mate!=null&&after.mate!==0)facts.unshift(`Stockfish vede un matto forzato in ${Math.abs(after.mate)} ${Math.abs(after.mate)===1?'mossa':'mosse'} a favore del ${after.cp>0?'Bianco':'Nero'}, con le migliori risposte individuate a questa profondità.`);
 }
 if(grade&&after?.mate!=null&&after.mate!==0&&Math.sign(after.cp)!==(side==='w'?1:-1)&&reply.length){reason=`La mossa permette all’avversario di avviare una linea di matto con ${reply[0].san}. `+reason;}
 let tip=b.isCheckmate()?'Ripercorri la posizione precedente: quali case di fuga mancavano al re e quali pezzi le controllavano?':b.isCheck()?'Quando c’è scacco, verifica prima tutte le risposte legali al re; solo dopo confronta i piani.':grade&&grade.loss>.05?'Prima di confermare una mossa, cerca scacchi e catture dell’avversario. Poi confronta la tua scelta con la prima mossa della linea migliore.':move.captured?'Una cattura non è automaticamente un guadagno: conta anche le possibili ricatture nella linea successiva.':a.moveNumber()<=10?'In apertura confronta sviluppo dei pezzi, controllo del centro e possibilità di arroccare. Prima di inseguire un attacco, controlla che il re e i pezzi rimasti indietro siano al sicuro.':'Confronta la risposta più forte dell’avversario con il tuo piano: una buona mossa deve reggere anche contro quella risposta.';
 if(getLanguage()!=='it')return {action:t('c.move',[pieceName(move.piece),move.from,move.to]),reason:grade?t('c.reason.'+grade.type)+' '+t('c.loss',[(grade.loss*100).toFixed(1)]):t('c.noeval'),facts:[localComment(move,before,after,grade,'quiet')],tip:t('c.tip'),best,reply,same,balance,delta,controlledA,controlledB};
 action=move.captured?`${who} cattura un ${pieces[move.captured]} con il ${pieces[move.piece]}.`:`${who} muove ${{p:'il pedone',n:'il cavallo',b:'l’alfiere',r:'la torre',q:'la donna',k:'il re'}[move.piece]}.`;
 if(move.flags.includes('k')||move.flags.includes('q'))action=`${who} arrocca e porta in gioco la torre.`;
 if(move.promotion)action+=` Il pedone viene promosso a ${pieces[move.promotion]}.`;
 reason=humanReason(grade);
 return{action,reason,facts:humanFacts(move,after),tip,best,reply,same,balance,delta,controlledA,controlledB};
}
