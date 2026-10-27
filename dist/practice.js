import {meetsGoal,reviewChoice} from './practice-review.js';
import {legalVariation} from './best-comparison.js';
import {stepStory} from './line-story.js';
import {locale} from './i18n.js';
import {Chess} from './vendor/chess.js';
import {Engine,terminal,classify} from './analysis.js';
import {newId,readAll,putRecord,THEMES} from './archive.js';
import {drawBoard,choosePiece} from './mini-board.js';
import {strategicHint,briefComment} from './brief-coach.js';
import {makeDeck,reviewQueue,reviewSummary,schedules,nextReviewText} from './repetition.js';
import {playUci,forkTargets,values} from './tactics.js';
const $=id=>document.getElementById(id),engine=new Engine(s=>$('practiceStatus').textContent=s);
let cards=[],attempts=[],queue=[],index=0,chess,fen='',base=null,selected=null,flipped=false,busy=false,solved=false,assisted=false,recorded=false,sessionId=newId(),solutionLine=null,solutionIndex=0;
function render(){if(chess)drawBoard($('practiceBoard'),chess,{selected,flipped,disabled:busy||solved,last:solutionLine&&solutionIndex?solutionLine.moves[solutionIndex-1]:null});['practiceReset','practiceNext','practiceHint','practiceSolution','startPractice','queueMode','practiceSource'].forEach(id=>$(id).disabled=busy);$('solutionViewer').hidden=!solutionLine;$('solutionPrev').disabled=busy||!solutionIndex;$('solutionNext').disabled=busy||!solutionLine||solutionIndex>=solutionLine.moves.length;}
function summary(){const s=reviewSummary(cards,attempts);$('reviewStats').innerHTML=[['Da ripassare',s.due],['Nuove posizioni',s.new],['Consolidate · 3 riuscite',s.mastered]].map(([label,value])=>`<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');$('practiceCounts').textContent=`${attempts.filter(a=>a.cardId).length} primi tentativi registrati. Riprova per capire: i tentativi successivi nella stessa sessione non allungano l’intervallo.`}
function empty(){const s=reviewSummary(cards,attempts);$('practiceWorkspace').hidden=true;$('practiceEmpty').hidden=false;$('emptyTitle').textContent=queue.length?'Sessione completata.':'Nessuna posizione in attesa.';$('emptyText').textContent=$('practiceSource').value==='personal'&&!cards.some(c=>c.source==='personal')?'Completa l’analisi di una partita e indica il tuo colore. Intanto puoi allenarti con i nuovi scenari tattici.':Number.isFinite(s.nextDue)?'Il prossimo ripasso sarà disponibile il '+new Date(s.nextDue).toLocaleString(locale())+'. Puoi anche iniziare una sessione libera o lavorare su altre posizioni nuove.':'Puoi iniziare un’altra sessione o analizzare una partita per personalizzare gli esercizi.'}
async function start(){if(busy)return;busy=true;render();sessionId=newId();attempts=await readAll('attempts');queue=reviewQueue(cards,attempts,{mode:$('queueMode').value,source:$('practiceSource').value});index=0;summary();busy=false;if(queue.length)await load();else{empty();render()}}
async function load(){busy=true;solved=false;selected=null;assisted=false;recorded=false;base=null;solutionLine=null;solutionIndex=0;const card=queue[index];fen=card.fen;chess=new Chess(fen);flipped=chess.turn()==='b';$('practiceEmpty').hidden=true;$('practiceWorkspace').hidden=false;$('practiceTheme').textContent=THEMES[card.theme]||'Strategia';$('practiceTitle').textContent=card.objective;$('practiceContext').textContent=`${index+1} / ${queue.length} · muove il ${chess.turn()==='w'?'Bianco':'Nero'}. `+(card.source==='personal'?'Posizione tratta da una tua partita.':card.matched?'Scenario didattico diverso, sullo stesso tema di un tuo errore.':'Scenario didattico composto per allenare questo tema.');$('practiceFeedback').textContent='Controllo della posizione…';$('reviewDue').textContent='';render();try{base=await engine.evaluate(fen,'deep');$('practiceFeedback').textContent='Osserva la posizione e scegli la tua mossa.'}catch(e){$('practiceFeedback').textContent=e.message}finally{busy=false;render()}}
async function record(success){if(recorded)return;const card=queue[index],a={id:newId(),sessionId,cardId:card.id,position:card.id,theme:card.theme,success,assisted,at:Date.now()};await putRecord(a,'attempts');recorded=true;attempts.push(a);summary();$('reviewDue').textContent=nextReviewText(schedules(attempts).get(card.id))}
$('practiceBoard').onclick=async e=>{if(busy||solved||!base)return;const b=e.target.closest('[data-sq]');if(!b)return;const sq=b.dataset.sq,p=chess.get(sq),candidates=selected?chess.moves({square:selected,verbose:true}).filter(m=>m.to===sq):[];if(!candidates.length){selected=p?.color===chess.turn()?sq:null;render();return}let promotion;if(candidates.some(m=>m.promotion)){promotion=await choosePiece(chess.turn());if(!promotion)return}busy=true;const m=chess.move({from:selected,to:sq,promotion:promotion||'q'});selected=null;render();$('practiceFeedback').textContent='Controllo della tua idea…';try{
 const check=await reviewChoice(engine,{fen,move:m,base});
 if(check.verdict==='uncertain'){chess=new Chess(fen);$('practiceFeedback').textContent='Le analisi non concordano abbastanza per giudicare questa risposta. Non registro un errore: puoi riprovare o passare alla prossima posizione.';return;}
 base=check.best;
 const after=terminal(chess)||{...check.played,mate:null,lines:[{...check.played.lines[0],pv:check.played.lines[0].pv.slice(1)}]},uci=m.from+m.to+(m.promotion||''),side=m.color==='w'?1:-1,grade=classify({before:base,after,side,uci,book:false});
 const goal=meetsGoal(queue[index],m,chess),success=goal&&check.verdict==='accepted';solved=true;
 $('practiceFeedback').textContent=success?'Obiettivo raggiunto. '+briefComment(m,base,after,grade,'quiet'):!goal&&check.verdict==='accepted'?'La mossa è valida, ma non realizza l’obiettivo indicato. Riprova cercando quel risultato.':'Questa scelta concede più dell’alternativa verificata. '+briefComment(m,base,after,grade,'quiet');
 await record(success);
 }catch(err){chess=new Chess(fen);solved=false;$('practiceFeedback').textContent='Verifica non riuscita. Nessun errore registrato. '+err.message;}finally{busy=false;render()}};
$('practiceReset').onclick=()=>{if(!chess)return;solutionLine=null;solutionIndex=0;chess=new Chess(fen);selected=null;solved=false;$('practiceFeedback').textContent='Riprova con un’altra idea. Il ripasso resta basato sul primo tentativo.';render()};
$('practiceNext').onclick=async()=>{if(index+1<queue.length){index++;await load()}else empty()};$('practiceFlip').onclick=()=>{flipped=!flipped;render()};
$('practiceHint').onclick=()=>{assisted=true;const card=queue[index];const hints={fork:'Cerca una casa da cui un cavallo possa attaccare due pezzi importanti, possibilmente dando scacco.',pin:'Segui le linee verso il re avversario. Un difensore inchiodato può davvero catturare fuori da quella linea?',hanging:'Controlla i pezzi avversari attaccati e conta le possibili ricatture.',king:'Esamina gli scacchi: dopo ciascuno, quali case di fuga rimangono al re?'};$('practiceFeedback').textContent=card.source==='catalog'?hints[card.theme]:strategicHint(new Chess(fen));$('reviewDue').textContent='Indizio usato: questa riuscita non allungherà l’intervallo di ripasso.'};
function showSolutionStep(){chess=new Chess(solutionLine.positions[solutionIndex]);$('practiceFeedback').textContent=solutionIndex?stepStory(solutionLine.moves[solutionIndex-1]):'Questa è la posizione di partenza. Premi Avanti per vedere una possibile soluzione, un passaggio alla volta.';$('solutionStep').textContent=`Passaggio ${solutionIndex} di ${solutionLine.moves.length}`;render();}
$('solutionPrev').onclick=()=>{if(solutionLine&&!busy&&solutionIndex>0){solutionIndex--;showSolutionStep()}};
$('solutionNext').onclick=()=>{if(solutionLine&&!busy&&solutionIndex<solutionLine.moves.length){solutionIndex++;showSolutionStep()}};
$('practiceSolution').onclick=async()=>{
 if(!base||busy)return;busy=true;render();
 try{
  const card=queue[index],c=new Chess(fen);let u=base.lines?.[0]?.pv?.[0],m=playUci(c,u);
  if(!m||!meetsGoal(card,m,c)){c.load(fen);u=card.solution;m=playUci(c,u);}
  if(!m||!meetsGoal(card,m,c))throw Error('Non ho trovato una soluzione verificata per questo obiettivo.');
  const check=await reviewChoice(engine,{fen,move:m,base});
  if(check.verdict!=='accepted')throw Error('Le analisi non confermano una soluzione affidabile. Passa alla prossima posizione o riprova.');
  solutionLine=check.line;solutionIndex=0;assisted=true;solved=true;selected=null;
  await record(false);showSolutionStep();
 }catch(e){$('practiceFeedback').textContent=e.message;}finally{busy=false;render()}
};
$('startPractice').onclick=()=>start().catch(e=>{busy=false;render();$('practiceStatus').textContent=e.message});
(async()=>{try{const [games,history,r]=await Promise.all([readAll(),readAll('attempts'),fetch('vendor/training-catalog.json')]);if(!r.ok)throw Error('Catalogo non disponibile: ricarica la pagina.');const deck=makeDeck(games,await r.json());cards=deck.cards;attempts=history;$('personalizationNote').textContent=deck.errors.length?`Ho trovato ${deck.errors.length} posizioni da rivedere nelle tue partite. I nuovi scenari sui temi ricorrenti hanno la precedenza.`:'Puoi iniziare con scenari tattici originali. Dopo un’analisi completa con il tuo colore, la selezione si adatterà ai tuoi errori.';summary()}catch(e){$('practiceStatus').textContent=e.message;$('startPractice').disabled=true}})();
