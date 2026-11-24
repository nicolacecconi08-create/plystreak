import {playMoveSound} from './settings.js';
import {ratingHistory,ratingMilestones,nextContinuousQueue} from './puzzle-rating.js';
import {LEVELS,cardDifficulty,difficultyQueue,difficultyNote,difficultyProgress} from './practice-difficulty.js';
import {trainingPath,pathMove,pathComplete,verifiedPath,goalReached} from './puzzle-path.js';
import {meetsGoal,reviewChoice} from './practice-review.js';
import {stepStory} from './line-story.js';
import {mateGenerator,localPuzzleDay} from './mate-generator.js';
import {locale,t} from './i18n.js';
import {Chess} from './vendor/chess.js';
import {Engine} from './analysis.js';
import {newId,readAll,putRecord,THEMES} from './archive.js';
import {drawBoard,choosePiece} from './mini-board.js';
import {composeTactic} from './practice-generator.js';
import {makeDeck,reviewSummary,schedules,nextReviewText} from './repetition.js';
import {playUci} from './tactics.js';
const $=id=>document.getElementById(id),engine=new Engine(s=>$('practiceStatus').textContent=s);
let cards=[],attempts=[],queue=[],index=0,chess,fen='',base=null,selected=null,flipped=false,busy=false,solved=false,assisted=false,recorded=false,sessionId=newId(),solutionLine=null,solutionIndex=0,ready=false,path=null,ply=0,alternate=false,completed=false,lastMove=null;
let attemptRecord=null,mistakes=0,elapsed=0,clockAt=performance.now(),clockRunning=false,ratingSettled=false,totalShown=0;
let hintedPly=-1;
let generatorPromise, generator, generatedMode='', cursor=Math.floor(Math.random()*1000000);
try{const saved=Number(localStorage.getItem('plystreak-generator-index'));if(Number.isSafeInteger(saved)&&saved>0)cursor=saved}catch{}
async function getGenerator(){
  generatorPromise??=fetch(new URL('./vendor/practice-mates.json',import.meta.url)).then(async response=>{
   if(!response.ok)throw Error('Tabella dei problemi non disponibile.');
   return mateGenerator(Uint8Array.from(atob(await response.json()),ch=>ch.charCodeAt(0)));
  }).catch(error=>{generatorPromise=null;throw error});
  generator=await generatorPromise;
  return generator;
}
function nextSeed(){
 const seed=cursor++;
 try{localStorage.setItem('plystreak-generator-index',String(cursor))}catch{}
 return seed;
}
function mateCard(seed){
 const card=generator.card(seed);
 return {...card,source:'catalog',exactMate:true,objective:'Dai matto in '+card.turns+' mosse.'};
}
async function trainingQueue(last){
 const config=options();
 let fresh=[];
 if(config.source!=='personal'){
  const seed=nextSeed();
  if(config.theme==='all'||config.theme==='fork')fresh.push(composeTactic(seed,'fork'));
  if(config.theme==='all'||config.theme==='material')fresh.push(composeTactic(seed,'material'));
  if(config.theme==='all'||config.theme==='pin')fresh.push(composeTactic(seed,'pin'));
  if(config.theme==='all'||config.theme==='king'){
   try{await getGenerator();fresh.push(mateCard(seed))}catch{/* Existing tactical puzzles remain playable offline. */}
  }
 }
 fresh=fresh.filter(Boolean);
 const ids=new Set(cards.map(c=>c.id));
 const pool=[...cards,...fresh.filter(c=>!ids.has(c.id))];
 const picks=nextContinuousQueue(pool,attempts,config,last,difficultyQueue);
 const candidate=picks.find(c=>fresh.some(f=>f.id===c.id));
 const first=picks[0],due=first&&schedules(attempts).get(first.id)?.due<=Date.now();
 if(candidate&&!due&&first.source!=='personal'&&totalShown%2===1){
  picks.splice(picks.indexOf(candidate),1);picks.unshift(candidate);
 }
 const chosen=picks[0];
 if(chosen)await rememberPuzzle(chosen);
 return picks;
}
async function rememberPuzzle(card){
 if(!(card.composed||card.exactMate)||cards.some(c=>c.id===card.id))return;
 await putRecord({id:'practice-card:'+card.id,card},'meta');
 cards.push(card);
}
async function generatedStart(){
 if(busy||!ready)return;
 busy=true;render();
 try{
  const seed=localPuzzleDay();
  const theme=['king','fork','pin','material'][seed%4];
  let card=theme==='king'?null:composeTactic(seed,theme);
  if(!card){await getGenerator();card=mateCard(seed)}
  await rememberPuzzle(card);
  generatedMode='daily';queue=[card];index=0;totalShown=1;sessionId=newId();
  $('practiceSetup').open=false;
  await load();$('practiceWorkspace').scrollIntoView({block:'start'});
 }catch(error){$('practiceStatus').textContent=error.message}finally{busy=false;render()}
}
function tick(){const now=performance.now();if(clockRunning)elapsed+=now-clockAt;clockAt=now;clockRunning=!busy&&!solved&&!!path&&!document.hidden;}
document.addEventListener('visibilitychange',()=>{tick();clockRunning=!busy&&!solved&&!!path&&!document.hidden;});
function ratingView(){const state=ratingHistory(attempts),m=ratingMilestones(state);$('puzzleRating').textContent=state.rating;$('ratingStreak').textContent=`${state.streak} di fila senza errori · record ${state.peak}`;$('ratingBar').value=m.progress;$('ratingBar').setAttribute('aria-valuetext',`${state.rating} punti, prossimo traguardo ${m.next}`);$('ratingGoal').textContent=state.rating===3000?'Traguardo massimo raggiunto':`${m.next-state.rating} punti al traguardo di ${m.next}`;$('ratingMilestones').innerHTML=m.marks.map(x=>`<span class="${x.reached?'reached':''}">${x.reached?'✓ ':''}${x.value}</span>`).join('');}
async function settleRating(outcome){if(ratingSettled||!path)return;tick();await record(outcome==='solved');if(!attemptRecord)return;const updated={...attemptRecord,rating:{version:1,family:queue[index].family||queue[index].id.replace(/:opposite$/,''),outcome,level:cardDifficulty(queue[index]),seconds:Math.min(86400,elapsed/1000),mistakes,assisted}};try{await putRecord(updated,'attempts');attempts=attempts.filter(a=>a.id!==updated.id);attempts.push(updated);attemptRecord=updated;ratingSettled=true;ratingView();const e=ratingHistory(attempts).events.find(e=>e.id===updated.id);$('ratingResult').textContent=e?.repeat?'Ripasso entro 24 ore: punteggio invariato.':`Elo problemi: ${e?.delta>=0?'+':''}${e?.delta||0} punti · ${mistakes} errori · ${Math.round(elapsed/1000)} secondi di riflessione.`;}catch{$('ratingResult').textContent='Punteggio non salvato. Riprova prima di proseguire.';}}
function options(){return {difficulty:$('practiceDifficulty').value,mode:$('queueMode').value,source:$('practiceSource').value,theme:$('practiceTopic').value};}
function render(){
 tick();
 $('practiceExit').hidden=!solved;$('practiceExit').disabled=busy;

 if(chess)drawBoard($('practiceBoard'),chess,{selected,flipped,disabled:busy||solved||!path,last:lastMove});
 ['practiceReset','practiceNext','practiceHint','practiceSolution','startPractice','queueMode','practiceSource','practiceTopic','practiceDifficulty'].forEach(id=>$(id).disabled=busy);
 $('startPractice').disabled=busy||!ready;
 $('dailyPuzzle').disabled=busy||!ready;
 for(const node of $('trainingTrail').querySelectorAll('button'))node.disabled=busy||!ready;
 if(!solved&&path&&hintedPly===ply)$('practiceBoard').querySelector('[data-sq="'+path.moves[ply].from+'"]')?.classList.add('hint-origin');
 $('practiceHint').textContent=t(!solved&&path&&hintedPly===ply?'Gioca questa mossa':'Mostra il pezzo');
 $('practiceSolution').disabled=busy||!path;$('practiceHint').disabled=busy||solved||!path;
 $('practiceNext').textContent=solved?'Prossimo problema →':'Salta questo problema →';
 $('practiceSuccess').hidden=!completed;$('practiceBoardFrame').classList.toggle('is-complete',completed);
 $('practicePath').textContent=path?(alternate?'Percorso alternativo verificato':'Linea principale')+` · ${Math.ceil(ply/2)} / ${Math.ceil(path.moves.length/2)} mosse completate`:'';
 $('solutionViewer').hidden=!solutionLine;$('solutionPrev').disabled=busy||!solutionIndex;$('solutionNext').disabled=busy||!solutionLine||solutionIndex>=solutionLine.moves.length;
}
function showTrail(){
 const {level,counts}=difficultyProgress(cards,attempts);
 for(const button of $('trainingTrail').querySelectorAll('button')){
  const stage=Number(button.dataset.stage),count=counts[stage];
  button.setAttribute('aria-current',stage===level?'step':'false');
  button.dataset.complete=String(count>=4);
  button.textContent=(count>=4?'✓ ':stage+' · ')+t(LEVELS[stage])+'  '+Math.min(count,4)+'/4';
  const marks=document.createElement('span');marks.className='trail-marks';marks.setAttribute('aria-hidden','true');
  for(let i=0;i<4;i++){const dot=document.createElement('i');if(i<count)dot.className='earned';marks.append(dot)}
  button.append(marks);
 }
}
function summary(){showTrail();ratingView();$('difficultyProgress').textContent=$('practiceSource').value==='personal'?'Le posizioni delle tue partite hanno difficoltà non calibrata e non determinano l’avanzamento del percorso guidato.':difficultyNote(cards,attempts,$('practiceDifficulty').value);const s=reviewSummary(cards,attempts);$('reviewStats').innerHTML=[['Da ripassare',s.due],['Nuove posizioni',s.new],['Consolidate · 3 riuscite',s.mastered]].map(([label,value])=>`<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');$('practiceCounts').textContent=`${attempts.filter(a=>a.cardId).length} primi tentativi registrati. Riprova per capire: i tentativi successivi nella stessa sessione non allungano l’intervallo.`}
function empty(){const s=reviewSummary(cards.filter(c=>($('practiceSource').value==='all'||c.source===$('practiceSource').value)&&($('practiceTopic').value==='all'||c.theme===$('practiceTopic').value)),attempts);$('practiceWorkspace').hidden=true;$('practiceEmpty').hidden=false;$('emptyTitle').textContent=queue.length?'Sessione completata.':'Nessuna posizione in attesa.';$('emptyText').textContent=$('practiceSource').value==='personal'&&!cards.some(c=>c.source==='personal')?'Completa l’analisi di una partita e indica il tuo colore. Intanto puoi allenarti con i nuovi scenari tattici.':Number.isFinite(s.nextDue)?'Il prossimo ripasso sarà disponibile il '+new Date(s.nextDue).toLocaleString(locale())+'. Puoi anche iniziare una sessione libera o lavorare su altre posizioni nuove.':'Non ci sono posizioni disponibili con questi filtri. Cambia tema o difficoltà, scegli Allenamento libero oppure analizza una partita per personalizzare gli esercizi.'}
async function start(){if(busy||!ready)return;generatedMode='';busy=true;render();sessionId=newId();attempts=await readAll('attempts');totalShown=1;queue=await trainingQueue(null);index=0;summary();busy=false;if(queue.length){$('practiceSetup').open=false;await load();$('practiceWorkspace').scrollIntoView({block:'start',behavior:'smooth'});}else{empty();render()}}
async function load(){
 busy=true;solved=false;completed=false;selected=null;assisted=false;recorded=false;base=null;solutionLine=null;solutionIndex=0;path=null;ply=0;alternate=false;lastMove=null;
 hintedPly=-1;attemptRecord=null;mistakes=0;elapsed=0;ratingSettled=false;$('ratingResult').textContent='';
 const card=queue[index];fen=card.fen;chess=new Chess(fen);flipped=chess.turn()==='b';
 $('practiceEmpty').hidden=true;$('practiceWorkspace').hidden=false;$('practiceTheme').textContent=(THEMES[card.theme]||'Strategia')+' · '+LEVELS[cardDifficulty(card)];$('practiceTitle').textContent=t(card.objective);
 $('practiceContext').textContent=`${totalShown}° problema · allenamento continuo · muove il ${chess.turn()==='w'?'Bianco':'Nero'}. `+(card.source==='personal'?'Posizione tratta da una tua partita: livello intermedio indicativo, difficoltà non calibrata.':(card.distractors?'Scenario con più pezzi e scelte da confrontare. Completa la sequenza.':cardDifficulty(card)===1?'Scenario essenziale: individua l’idea e completa la sequenza.':'Scenario di combinazione: completa tutti i passaggi richiesti.'));
 $('practiceFeedback').textContent='Verifico la linea di soluzione…';$('reviewDue').textContent='';render();
 try{
  if(card.exactMate){
   await getGenerator();
   path=generator.line(chess);
   $('practiceContext').textContent=generatedMode==='daily'?t('Problema del giorno')+' · '+new Date().toLocaleDateString(locale()):t('Finale generato');
   $('practiceFeedback').textContent=t('Il re avversario cerca la difesa che ritarda di più il matto.');
   return;
  }
  if(card.composed){
   path=verifiedPath(fen,card.line);
   if(!path||!goalReached(card,path))throw Error('La sequenza del catalogo non è valida.');
   if(generatedMode==='daily')$('practiceContext').textContent=t('Problema del giorno')+' · '+new Date().toLocaleDateString(locale());
   $('practiceFeedback').textContent=t('Trova la prima mossa. Le risposte avversarie verranno giocate automaticamente.');return;
  }
  base=await engine.evaluate(fen,'deep');
  const c=new Chess(fen),u=card.solution||base.lines?.[0]?.pv?.[0],m=playUci(c,u);
  if(!m)throw Error('Soluzione non disponibile per questa posizione.');
  const check=await reviewChoice(engine,{fen,move:m,base});
  if(check.verdict!=='accepted')throw Error('La soluzione non è confermata: salta questo problema senza penalità.');
  base=check.best;
  if(card.line){
   path=verifiedPath(fen,card.line);
   if(!path)throw Error('La sequenza del catalogo non è valida.');
  }else{
   if(!meetsGoal(card,m,c))throw Error('La variante non realizza l’obiettivo indicato.');
   const pvLength=check.played.lines[0].pv.length;
   const personalLength=Math.min(9,pvLength%2?pvLength:pvLength-1);
   const count=card.source==='personal'?Math.max(1,personalLength):card.theme==='fork'?3:1;
   path=trainingPath(fen,check.played.lines[0].pv,count);
  }
  if(!goalReached(card,path))throw Error('La linea verificata non completa l’obiettivo: salta il problema senza penalità.');
  $('practiceFeedback').textContent='Trova la prima mossa. Le risposte avversarie verranno giocate automaticamente.';
 }catch(e){path=null;$('practiceFeedback').textContent=e.message;}finally{busy=false;render()}
}
async function record(success){if(recorded)return;const card=queue[index],a={id:newId(),sessionId,cardId:card.id,position:card.id,theme:card.theme,success,assisted,at:Date.now()};try{await putRecord(a,'attempts')}catch{$('reviewDue').textContent='Salvataggio non riuscito: il risultato resta visibile in questa sessione.';return}recorded=true;attemptRecord=a;attempts.push(a);summary();$('reviewDue').textContent=nextReviewText(schedules(attempts).get(card.id))}
$('practiceBoard').onclick=async e=>{
 if(busy||solved||!path)return;
 const b=e.target.closest('[data-sq]');if(!b)return;
 const sq=b.dataset.sq,p=chess.get(sq),candidates=selected?chess.moves({square:selected,verbose:true}).filter(m=>m.to===sq):[];
 if(!candidates.length){selected=p?.color===chess.turn()?sq:null;render();return}
 let promotion;if(candidates.some(m=>m.promotion)){busy=true;render();promotion=await choosePiece(chess.turn());busy=false;if(!promotion){render();return}}
 await playStep(selected,sq,promotion);
};
async function playStep(from,to,promotion){
 const current=chess.fen();busy=true;const m=chess.move({from,to,promotion:promotion||'q'});selected=null;lastMove=m;playMoveSound(chess,m,{terminal:false});render();
 try{
  const u=m.from+m.to+(m.promotion||'');
  if(!pathMove(path,ply,u)&&queue[index].exactMate){
   if(generator.distance(chess)!==path.moves.length-ply-1){
    chess=new Chess(current);lastMove=ply?path.moves[ply-1]:null;mistakes++;await record(false);
    $('practiceFeedback').textContent=t('Questa mossa non forza il matto nel numero richiesto. Riprova.');return;
   }
   const tail=generator.line(chess);
   path={moves:[...path.moves.slice(0,ply),m,...tail.moves],positions:[...path.positions.slice(0,ply+1),...tail.positions]};
   alternate=true;
  }else if(!pathMove(path,ply,u)){
   $('practiceFeedback').textContent='Verifico se la tua idea è un percorso alternativo…';
   const root=await engine.evaluate(current,'deep');const check=await reviewChoice(engine,{fen:current,move:m,base:root});
   if(check.verdict==='uncertain'){$('practiceFeedback').textContent='La verifica è incerta: nessun errore registrato. Riprova o passa al prossimo problema.';chess=new Chess(current);return}
   // On the first move retain the declared exercise objective; later moves preserve engine value.
   if(check.verdict!=='accepted'||(ply===0&&!queue[index].line&&!meetsGoal(queue[index],m,chess))){
    chess=new Chess(current);$('practiceFeedback').textContent='Questa strada non completa la soluzione verificata. La posizione è ripristinata: prova un’altra idea.';mistakes++;await record(false);return;
   }
   let tail=trainingPath(current,check.played.lines[0].pv,Math.max(1,path.moves.length-ply));
   const join=t=>({moves:[...path.moves.slice(0,ply),...t.moves],positions:[...path.positions.slice(0,ply),...t.positions]});
   let candidate=join(tail);
   if(!goalReached(queue[index],candidate)){tail=trainingPath(current,check.played.lines[0].pv,11);candidate=join(tail);}
   if(!goalReached(queue[index],candidate)){chess=new Chess(current);$('practiceFeedback').textContent='La tua idea conserva la valutazione, ma la variante verificata non raggiunge ancora l’obiettivo del problema. Nessun errore registrato: prova la linea principale.';return;}
   path=candidate;alternate=true;
  }
  hintedPly=-1;ply++;$('practiceFeedback').textContent=(alternate?'Percorso alternativo verificato. ':'Buona scelta. ')+stepStory(m);
  render();
  if(!pathComplete(path,ply)){
   await new Promise(resolve=>setTimeout(resolve,450));
   const reply=path.moves[ply];lastMove=chess.move({from:reply.from,to:reply.to,promotion:reply.promotion});playMoveSound(chess,lastMove,{terminal:false});ply++;
   $('practiceFeedback').textContent+=' L’avversario risponde: '+stepStory(lastMove)+' Ora continua tu.';
  }
  if(pathComplete(path,ply)){
   solved=true;completed=true;$('practiceFeedback').textContent=(alternate?'Percorso alternativo completato. ':'Soluzione completata. ')+ 'Hai giocato tutti i passaggi richiesti. Le altre risposte avversarie possono portare a varianti diverse.';
   await record(true);await settleRating('solved');
  }
 }catch(err){chess=new Chess(current);$('practiceFeedback').textContent='Verifica non riuscita. Nessuna penalità aggiunta. '+err.message;}finally{busy=false;render();if(completed)$('practiceNext').focus({preventScroll:true});}
};
$('practiceReset').onclick=async()=>{if(busy)return;const keep={recorded,assisted,attemptRecord,mistakes,elapsed,ratingSettled};await load();({recorded,assisted,attemptRecord,mistakes,elapsed,ratingSettled}=keep);$('practiceFeedback').textContent=path?'Riparti dalla linea principale. Tempo, tentativi e aiuti restano conteggiati.':$('practiceFeedback').textContent;};
$('practiceNext').onclick=async()=>{if(busy)return;busy=true;render();await settleRating(completed?'solved':solved?'solution':'skipped');if(path&&!ratingSettled){busy=false;render();return;}generatedMode='';const last=queue[index]?.id;totalShown++;try{queue=await trainingQueue(last)}catch(error){busy=false;render();$('practiceStatus').textContent=error.message;return}index=0;summary();if(queue.length)await load();else{busy=false;empty();render();}};
$('practiceExit').onclick=async()=>{if(busy||!solved)return;busy=true;render();await settleRating(completed?'solved':'solution');if(path&&!ratingSettled){busy=false;render();return;}$('practiceWorkspace').hidden=true;$('practiceEmpty').hidden=false;$('emptyTitle').textContent='Allenamento concluso';$('emptyText').textContent=`Hai affrontato ${totalShown} problemi. Elo problemi: ${ratingHistory(attempts).rating}. Puoi riprendere quando vuoi.`;$('practiceSetup').open=true;path=null;busy=false;render();$('startPractice').focus();};
$('practiceFlip').onclick=()=>{flipped=!flipped;render()};
$('practiceHint').onclick=async()=>{
 if(busy||solved||!path)return;
 const move=path.moves[ply];assisted=true;
 if(hintedPly!==ply){
  hintedPly=ply;
  $('practiceFeedback').textContent=t('Guarda il pezzo in {0}.',[move.from]);render();return;
 }
 await playStep(move.from,move.to,move.promotion);
};
function showSolutionStep(){chess=new Chess(solutionLine.positions[solutionIndex]);lastMove=solutionIndex?solutionLine.moves[solutionIndex-1]:null;$('practiceFeedback').textContent=solutionIndex?stepStory(solutionLine.moves[solutionIndex-1]):'Questa è la posizione di partenza. Premi Avanti per vedere una possibile soluzione, un passaggio alla volta.';$('solutionStep').textContent=`Passaggio ${solutionIndex} di ${solutionLine.moves.length}`;render();}
$('solutionPrev').onclick=()=>{if(solutionLine&&!busy&&solutionIndex>0){solutionIndex--;showSolutionStep()}};
$('solutionNext').onclick=()=>{if(solutionLine&&!busy&&solutionIndex<solutionLine.moves.length){solutionIndex++;showSolutionStep()}};
$('practiceSolution').onclick=async()=>{
 if(!path||busy)return;busy=true;render();
 try{solutionLine=path;solutionIndex=0;assisted=true;solved=true;completed=false;selected=null;await record(false);await settleRating('solution');showSolutionStep();}
 catch(e){$('practiceFeedback').textContent=e.message;}finally{busy=false;render()}
};
$('practiceDifficulty').onchange=()=>summary();
$('practiceSource').onchange=()=>summary();
$('trainingTrail').onclick=e=>{
 const button=e.target.closest('[data-stage]');if(!button||busy)return;
 const recommended=difficultyProgress(cards,attempts).level;
 $('practiceDifficulty').value=Number(button.dataset.stage)===recommended?'progressive':button.dataset.stage;
 $('startPractice').click();
};
$('dailyPuzzle').onclick=()=>generatedStart();
$('startPractice').onclick=()=>start().catch(e=>{busy=false;render();$('practiceStatus').textContent=e.message});
(async()=>{try{const [games,history,savedCards,r]=await Promise.all([readAll(),readAll('attempts'),readAll('meta'),fetch('vendor/training-catalog.json')]);if(!r.ok)throw Error('Catalogo non disponibile: ricarica la pagina.');const deck=makeDeck(games,await r.json());cards=[...deck.cards,...savedCards.filter(v=>v.id.startsWith('practice-card:')&&v.card?.fen).map(v=>v.card)];attempts=history;ready=true;$('personalizationNote').textContent=deck.errors.length?`Ho trovato ${deck.errors.length} posizioni da rivedere nelle tue partite. I nuovi scenari sui temi ricorrenti hanno la precedenza.`:'Puoi iniziare con scenari tattici originali. Dopo un’analisi completa con il tuo colore, la selezione si adatterà ai tuoi errori.';summary();render()}catch(e){$('practiceStatus').textContent=e.message;$('startPractice').disabled=true}})();
