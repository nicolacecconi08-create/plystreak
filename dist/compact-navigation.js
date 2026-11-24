import {uiIcon} from './ui-icons.js';
// Native dialog preserves keyboard focus, Escape and modal semantics.
export function compactNavigation(nav,openSettings){
 const secondary=['live.html','openings.html','lessons.html'];
 for(const link of nav.querySelectorAll('a'))if(secondary.includes(link.getAttribute('href')))link.classList.add('nav-overflow');
 nav.querySelector('#preferencesButton').classList.add('nav-overflow');
 const more=document.createElement('button');more.type='button';more.className='mobile-more';more.id='moreNavigationButton';more.setAttribute('aria-haspopup','dialog');more.setAttribute('aria-controls','moreNavigation');more.setAttribute('aria-expanded','false');more.innerHTML='<span class="nav-icon" aria-hidden="true">'+uiIcon('more')+'</span><span>Altro</span>';
 const dialog=document.createElement('dialog');dialog.id='moreNavigation';dialog.setAttribute('aria-labelledby','moreNavigationTitle');dialog.innerHTML='<button type="button" class="dialog-close" aria-label="Chiudi menu">×</button><h2 id="moreNavigationTitle">Esplora Plystreak</h2><div class="more-links"></div>';
 const links=dialog.querySelector('.more-links');
 for(const href of secondary){const link=nav.querySelector('a[href="'+href+'"]').cloneNode(true);link.classList.remove('nav-overflow');links.append(link);if(link.hasAttribute('aria-current')){more.dataset.active='true';more.setAttribute('aria-label','Altro · '+link.textContent.trim())}}
 if(location.pathname.replace(/\/$/,'').split('/').pop().replace(/\.html$/,'')==='settings')more.dataset.active='true';
 const settings=document.createElement('button');settings.type='button';settings.innerHTML=uiIcon('settings')+'<span>Impostazioni</span>';settings.onclick=()=>{dialog.close();openSettings()};links.append(settings);
 dialog.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>more.setAttribute('aria-expanded','false'));more.onclick=()=>{dialog.showModal();more.setAttribute('aria-expanded','true')};
 const mq=matchMedia('(max-width:700px)');mq.addEventListener('change',()=>{if(!mq.matches&&dialog.open)dialog.close()});nav.append(more);document.body.append(dialog);
}
