import {uiIcon} from './ui-icons.js';
if(document.body.classList.contains('analysis-page')){
 const intro=document.querySelector('.analysis-welcome');
 if(intro){const section=document.createElement('nav');section.className='desk-shortcuts';section.setAttribute('aria-label','Esplora Plystreak');
 for(const [url,icon,title,desc] of [['coach.html','coach','Gioca','Sfida il coach'],['practice.html','practice','Esercizi','Allena le tattiche'],['openings.html','openings','Aperture','Studia il repertorio']]){
  const a=document.createElement('a');a.href=url;const graphic=document.createElement('span');graphic.setAttribute('aria-hidden','true');graphic.innerHTML=uiIcon(icon);const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('small');small.textContent=desc;a.append(graphic,strong,small);section.append(a)}intro.append(section)}
}
