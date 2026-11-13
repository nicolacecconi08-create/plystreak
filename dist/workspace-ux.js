// Progressive disclosure keeps every existing control and its event listeners.
const make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;return e};
function disclosure(nodes,title){if(!nodes.length)return;const d=make('details','context-help'),s=make('summary','',title);d.append(s);nodes[0].before(d);for(const n of nodes)d.append(n)}
const main=document.querySelector('main');
if(main){
 const milestones=main.querySelector('#ratingMilestones');if(milestones)disclosure([milestones],'Traguardi');
 // Static explanatory notes only: never collapse live feedback or actionable status.
 for(const card of main.querySelectorAll('.card,.lesson-setup')){const notes=[...card.children].filter(n=>n.matches('p.muted')&&!n.id&&!n.querySelector('button,input,a'));disclosure(notes,'Informazioni utili')}
 if(document.querySelector('#importPanel')){
 const card=document.querySelector('#importPanel');card.querySelector('.analysis-policy')?.remove();
 const title=card.querySelector('h2');title.textContent='Importa una partita';
 const shortcuts=make('nav','import-shortcuts');shortcuts.setAttribute('aria-label','Altri modi per iniziare');
 for(const [name,url] of [['Le mie partite','progress.html#partite'],['Da Chess.com','progress.html#chesscom'],['Gioca col coach','coach.html']]){const a=make('a','',name);a.href=url;shortcuts.append(a)}card.append(shortcuts);
 }
 if(document.querySelector('#archiveList')){
 const sections=[...main.children].filter(n=>n.matches('section,.hub-grid,.stat-grid'));
 const groups=[['Andamento','andamento',sections.filter(n=>!n.querySelector('#connectForm,#archiveList'))],['Partite','partite',sections.filter(n=>n.querySelector('#archiveList'))],['Chess.com','chesscom',sections.filter(n=>n.querySelector('#connectForm'))]];
 const nav=make('nav','section-switcher');nav.setAttribute('aria-label','Sezioni dei progressi');main.querySelector('.page-tools').after(nav);
 const select=id=>{for(const [,,nodes] of groups)for(const n of nodes)n.hidden=n.dataset.section!==id;for(const b of nav.children)b.setAttribute('aria-pressed',String(b.dataset.section===id))};
 for(const [label,id,nodes] of groups){for(const n of nodes)n.dataset.section=id;const b=make('button','',label);b.type='button';b.dataset.section=id;b.onclick=()=>{select(id);history.replaceState(null,'','#'+id)};nav.append(b)}
 select(groups.some(g=>g[1]===location.hash.slice(1))?location.hash.slice(1):'andamento');
 }
}
