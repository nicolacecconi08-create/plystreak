import {lessons,quiz,startingLesson,lessonPosition,attemptLesson} from './lesson-path.js';
import {drawBoard} from './mini-board.js';
import {t} from './i18n.js';
const $=id=>document.getElementById(id),key='plystreak-practical-lessons-v1';
let saved={};
try{saved=JSON.parse(localStorage.getItem(key))||{}}catch{}
const quizPrompts=['Come può il Bianco catturare il pedone nero?', 'Arrocca corto con il Bianco.', 'Trova un attacco doppio di cavallo con scacco.'];
const done=new Set(Array.isArray(saved.done)?saved.done:[]);
let testing=false;
let quizMode=!saved.placed,answers=[],lesson,game,step=0,selected,last,finished=false;
function persist(){try{localStorage.setItem(key,JSON.stringify({placed:!quizMode,current:lesson.id,done:[...done]}))}catch{$('lessonStorage').textContent=t('Memoria non disponibile. I progressi restano in questa sessione.')}}
function paint(){drawBoard($('lessonBoard'),game,{selected,last,disabled:finished});}
function load(id){
 if(lesson?.id!==id)testing=false;
 lesson=lessons.find(item=>item.id===id)||lessons[0];
 if(!lesson.replies)testing=false;game=lessonPosition(lesson);step=0;selected=last=null;finished=false;
 $('lessonMode').textContent=quizMode?t('Quiz iniziale · {0}/{1}',[answers.length+1,quiz.length]):t('Lezioni · {0}/{1}',[done.size,lessons.length]);
 $('openingTest').hidden=!lesson.replies||testing||quizMode;
 $('lessonPrompt').textContent=testing?t('Gioca la sequenza a memoria · {0}',[t(lesson.prompt).split('.')[0]]):t(quizMode?quizPrompts[answers.length]:lesson.prompt);$('lessonStatus').textContent='';
 $('lessonNext').hidden=true;$('skipQuiz').hidden=!quizMode;$('quizMiss').hidden=!quizMode;$('retake').hidden=quizMode;
 $('course').hidden=quizMode;$('lessonChoice').value=lesson.id;
 for(const opt of $('lessonChoice').options)opt.textContent=(done.has(opt.value)?'✓ ':'')+t(lessons.find(l=>l.id===opt.value).prompt).split('.')[0];
 paint();if(!quizMode)persist();
}
function quizAnswer(correct){
 answers.push(correct);if(answers.length<quiz.length){load(quiz[answers.length]);return}
 quizMode=false;load(startingLesson(answers));$('lessonStatus').textContent=t('Ecco il punto di partenza consigliato. Puoi scegliere qualsiasi lezione.');
}
for(const item of lessons)$('lessonChoice').add(new Option('',item.id));
$('lessonBoard').onclick=e=>{
 const sq=e.target.closest('[data-sq]')?.dataset.sq;if(!sq||finished||$('lessonBoard').classList.contains('annotating'))return;
 if(game.get(sq)?.color===game.turn()){selected=selected===sq?null:sq;paint();return}
 if(!selected)return;
 const result=attemptLesson(game,lesson,step,selected,sq);
 if(result.status==='illegal'||result.status==='retry'){
 $('lessonStatus').textContent=t(result.status==='illegal'?'Questo pezzo non può raggiungere quella casa.':'Mossa legale. Rileggi l’obiettivo e riprova.');
 if(quizMode&&result.status==='retry'){finished=true;$('lessonNext').hidden=false;$('lessonNext').onclick=()=>quizAnswer(false);paint()}return;
 }
 selected=null;last=result.last;step++;finished=result.status==='complete';paint();
 $('lessonStatus').textContent=t(finished?'Obiettivo raggiunto.':'La risposta del Nero è sulla scacchiera. Tocca al Bianco.');
 if(finished){$('quizMiss').hidden=true;if(!quizMode){done.add(lesson.id);persist();$('lessonMode').textContent=t('Lezioni · {0}/{1}',[done.size,lessons.length])}
 const next=lessons[lessons.indexOf(lesson)+1];$('lessonNext').hidden=!quizMode&&!next;$('lessonNext').onclick=()=>quizMode?quizAnswer(true):load(next.id);}
};
$('skipQuiz').onclick=()=>{quizMode=false;load(lessons[0].id)};
$('quizMiss').onclick=()=>quizAnswer(false);
$('retake').onclick=()=>{quizMode=true;answers=[];load(quiz[0])};
$('lessonChoice').onchange=e=>load(e.target.value);
$('repeatLesson').onclick=()=>{testing=false;load(lesson.id)};
$('openingTest').onclick=()=>{testing=true;load(lesson.id)};
load(quizMode?quiz[0]:saved.current);

