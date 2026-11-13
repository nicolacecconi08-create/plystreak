// Reuse the original controls: no cloned listeners, duplicate IDs or parallel state.
import {fitReviewBoard} from './board-fit.js';
if(document.body.classList.contains('analysis-page')){
 const $=s=>document.querySelector(s), workspace=$('.workspace');
 const nav=document.createElement('nav');nav.className='review-sections';nav.setAttribute('aria-label','Sezioni della revisione');
 const panels=document.createElement('div');panels.className='review-panels';
 const definitions=[['explain','Spiega',['#analysisLesson','.board-note']],['moves','Mosse',['#reviewContent']],['summary','Dati',['.summary-card','.chart-card','.engine-pill','#resetAnalysis','#methodButton']],['arrows','Frecce',['.arrow-controls','#arrowHelp','.annotation-tools']],['explore','Varianti',['.tabs','#exploreContent']]];
 const moved=[];let mounted=false,view='explain';
 for(const [id,label] of definitions){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.view=id;b.setAttribute('aria-controls','review-pane-'+id);b.onclick=()=>select(id);nav.append(b);const p=document.createElement('section');p.id='review-pane-'+id;p.dataset.view=id;p.setAttribute('aria-label',label);panels.append(p)}
 const picker=document.createElement('select');picker.className='review-category-picker';picker.setAttribute('aria-label','Sezioni della revisione');for(const [id,label] of definitions){const o=document.createElement('option');o.value=id;o.textContent=label;picker.append(o)}picker.onchange=()=>select(picker.value);nav.prepend(picker);
 function select(id){view=id;picker.value=id;panels.scrollTop=0;for(const b of nav.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.view===id));for(const p of panels.children)p.hidden=p.dataset.view!==id;document.body.dataset.reviewView=id;fitReviewBoard()}
 const mq=matchMedia('(max-width:700px)');
 function mount(){const active=mq.matches&&document.body.classList.contains('review-loaded');if(active===mounted)return;mounted=active;document.body.classList.toggle('mobile-review',active);
 if(active){for(const [id,,selectors] of definitions){const p=panels.querySelector('[data-view="'+id+'"]');for(const selector of selectors){const n=$(selector);if(!n)continue;const marker=document.createComment('review-home');n.before(marker);moved.push([n,marker]);p.append(n)}}workspace.append(nav,panels);select('explain')}
 else{for(const [n,marker] of moved){marker.replaceWith(n)}moved.length=0;nav.remove();panels.remove();delete document.body.dataset.reviewView}
 fitReviewBoard();}
 mq.addEventListener('change',mount);new MutationObserver(mount).observe(document.body,{attributes:true,attributeFilter:['class']});mount();
 // A salient move opens its explanation; other categories never change the position.
 $('#reviewTab').addEventListener('click',()=>{if(mounted)select('explain')});
 $('#nextImportant').addEventListener('click',()=>{if(mounted)select('explain')});
 window.visualViewport?.addEventListener('resize',()=>{document.body.style.setProperty('--review-vh',(window.visualViewport.height)+'px');fitReviewBoard()});
 document.body.style.setProperty('--review-vh',(window.visualViewport?.height||innerHeight)+'px');
}
