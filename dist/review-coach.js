import {avatarSVG,getSettings,escapeHTML as esc} from './settings.js';
import {explainMove} from './explanations.js';
export function renderReviewCoach(host,move,before,after,grade){const s=getSettings(),box=document.createElement('section');box.className='coach-inline';const ex=explainMove({move,before,after,grade});box.innerHTML=`<div class="coach-inline-head">${avatarSVG(s)}<div><span class="eyebrow">UN’IDEA PER LA PROSSIMA PARTITA</span><strong>${esc(s.coachName)}</strong></div></div><p>${esc(ex.tip)}</p>`;host.append(box);}
