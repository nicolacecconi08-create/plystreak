import './workspace-ux.js';
// Move existing elements, never duplicate controls, listeners or analysis state.
const $=s=>document.querySelector(s);
const main=$('main');
const path=location.pathname.split('/').pop()||'index.html';
const identity={
 'index.html':['IL TUO LABORATORIO','Analisi della partita','Ogni mossa ha una storia.'],
 'coach.html':['GIOCA E IMPARA','Il tuo prossimo passo','Una partita, un’occasione per capire.'],
 'practice.html':['ALLENAMENTO','Allena il tuo sguardo','Riconosci le idee. Trova la tua mossa.'],
 'openings.html':['IL TUO REPERTORIO','Le prime mosse contano','Esplora le aperture, comprendi i piani.'],
 'progress.html':['IL TUO PERCORSO','Dai valore a ogni partita','Partite, progressi e obiettivi in un solo posto.'],
 'settings.html':['LA TUA ESPERIENZA','Impostazioni','Personalizza Plystreak.'],
 'live.html':['DALL’ALTRA PARTE DEL TAVOLO','Una scacchiera, due giocatori','Il piacere di una partita dal vivo.']
};
if(main){
 document.body.dataset.screen=path.replace('.html','');
 const info=identity[path],heading=$('.page-title');
 if(info&&heading){const group=document.createElement('div');group.className='page-heading';heading.before(group);const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent=info[0];const description=document.createElement('p');description.textContent=info[2];heading.textContent=info[1];group.append(eyebrow,heading,description)}
}
if($('.analysis-page')){
 const chart=$('.chart-card');chart.classList.add('review-chart');$('.review-column').append(chart);
 const status=document.createElement('section');status.className='analysis-status';status.setAttribute('aria-label','Stato dell’analisi');for(const selector of ['#progressArea','#resumeAnalysis','#saveStatus','#reanalyze']){const node=$(selector);if(node)status.append(node)}$('.review-column').append(status);
 const accuracy=$('.accuracy-row');accuracy.classList.add('review-accuracy');$('.review-column').insertBefore(accuracy,$('#loadedPanel'));
 const tools=document.createElement('details');tools.className='board-options';const label=document.createElement('summary');label.textContent='Strumenti della scacchiera';tools.append(label);$('.board-column').append(tools);
 // Annotation controls may be installed by the shell after this module runs.
 for(const selector of ['.arrow-controls','#arrowHelp']){const node=$(selector);if(node)tools.append(node)}
 const wire=()=>{const node=$('.annotation-tools');if(node&&!tools.contains(node)&&!document.body.classList.contains('mobile-review'))tools.append(node)};
 wire();queueMicrotask(wire);
 const toolbar=$('.board-toolbar');for(const [id,icon] of [['first','⏮'],['prev','‹'],['next','›'],['last','⏭'],['flip','⇅'],['export','↓']]){const button=$('#'+id);if(button){button.textContent=icon;button.title=button.getAttribute('aria-label')}}
 toolbar.setAttribute('aria-label','Navigazione della partita');
}
