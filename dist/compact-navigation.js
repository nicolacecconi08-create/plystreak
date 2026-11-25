import {uiIcon} from './ui-icons.js';
import {navigationPage} from './navigation.js';

export function compactNavigation(nav){
 const primary=new Set(['index.html','progress.html']);
 const menu=document.createElement('nav');
 menu.id='moreNavigation';menu.className='more-links';menu.setAttribute('popover','auto');
 menu.setAttribute('aria-label','Altro');
 const more=document.createElement('button');
 more.type='button';more.className='mobile-more';more.id='moreNavigationButton';
 more.setAttribute('aria-controls',menu.id);more.setAttribute('aria-expanded','false');
 more.innerHTML='<span class="nav-icon" aria-hidden="true">'+uiIcon('more')+'</span><span>Altro</span>';
 for(const link of [...nav.querySelectorAll('a')]){
  if(primary.has(link.getAttribute('href')))continue;
  menu.append(link);
 }
 const settings=nav.querySelector('#preferencesButton');
 menu.append(settings);
 if(menu.querySelector('[aria-current="page"]')||navigationPage(location.pathname)==='settings.html')more.dataset.active='true';
 nav.append(more);
 // Keep the popup outside the fixed mobile bar and desktop sidebar.
 document.body.append(menu);
 const native=typeof menu.showPopover==='function';
 if(native)more.setAttribute('popovertarget',menu.id);else menu.hidden=true;
 const isOpen=()=>native?menu.matches(':popover-open'):!menu.hidden;
 function place(){
  const rect=more.getBoundingClientRect(),gap=6,edge=8;
  const below=window.innerHeight-rect.bottom-gap-edge,above=rect.top-gap-edge;
  const upwards=below<300&&above>below;
  menu.style.maxHeight=Math.max(40,upwards?above:below)+'px';
  menu.style.top=upwards?'auto':rect.bottom+gap+'px';
  menu.style.bottom=upwards?window.innerHeight-rect.top+gap+'px':'auto';
  menu.style.left=Math.max(edge,Math.min(rect.left,window.innerWidth-Math.min(256,window.innerWidth-2*edge)-edge))+'px';
 }
 function sync(){more.setAttribute('aria-expanded',String(isOpen()))}
 function close(){if(!isOpen())return;if(native)menu.hidePopover();else menu.hidden=true;sync()}
 more.addEventListener('click',()=>{place();if(!native){menu.hidden=!menu.hidden;sync()}});
 menu.addEventListener('toggle',sync);
 menu.addEventListener('click',event=>{if(event.target.closest('a,button'))close()},true);
 window.addEventListener('resize',()=>{if(isOpen())place()});
 if(!native){
  document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target)&&!more.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){close();more.focus()}});
 }
}
