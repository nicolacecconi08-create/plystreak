import {getRecord} from './archive.js';
import {connectChessProfile} from './connect-profile.js';
import {t} from './i18n.js';

const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function welcome(brand){
 const entry=window.plyClaimWelcome?.();
 if(!entry)return;
 const {panel,started}=entry;
 if(!panel.open){panel.remove();return}
 const content=panel.querySelector('.welcome-content'),mark=panel.querySelector('.welcome-mark');
 content.innerHTML='<div class="welcome-lockup" aria-label="Plystreak" translate="no"><span class="welcome-word" aria-hidden="true"></span></div><div class="welcome-track" aria-hidden="true"><i></i></div><form hidden><h2></h2><label for="welcomeUser"></label><input id="welcomeUser" name="username" maxlength="50" required pattern="[a-zA-Z0-9_\\-]+" autocomplete="username" autocapitalize="none" spellcheck="false"><p role="status" hidden></p><div class="welcome-actions"><button class="primary" type="submit"></button><button class="text-button" type="button"></button></div></form><p class="welcome-greeting" role="status" hidden></p>';
 const word=panel.querySelector('.welcome-word');
 for(const [i,char] of [...'Plystreak'].entries()){
  const letter=document.createElement('span');letter.textContent=char;letter.style.setProperty('--letter',i);word.append(letter);
 }
 const knight=brand?.querySelector('.ply-mascot')?.cloneNode(true);
 if(knight)word.before(knight);
 const form=panel.querySelector('form'),input=form.elements.username,buttons=form.querySelectorAll('button'),status=form.querySelector('[role=status]'),track=panel.querySelector('.welcome-track');
 form.querySelector('h2').textContent=t('Collega il tuo profilo Chess.com');
 form.querySelector('label').textContent=t('Nome utente Chess.com');
 buttons[0].textContent=t('Collega');buttons[1].textContent=t('Più tardi');
 const controller=new AbortController();
 async function close(){
  if(controller.signal.aborted)return;
  controller.abort();panel.dataset.leaving='true';
  await delay(540);panel.close();panel.remove();
 }
 buttons[1].onclick=close;
 panel.oncancel=e=>{e.preventDefault();close()};

 async function greet(profile){
  const name=profile.profile?.username||profile.username;
  const greetings=['Ciao {0}, bentornato!','Bentornato, {0}!'];
  const greeting=panel.querySelector('.welcome-greeting');greeting.setAttribute('translate','no');
  greeting.textContent=t(greetings[Math.floor(Math.random()*greetings.length)],[name]);
  form.hidden=true;track.hidden=true;greeting.hidden=false;
  await delay(2500);if(panel.open)close();
 }
 form.onsubmit=async e=>{
  e.preventDefault();if(buttons[0].disabled)return;
  input.readOnly=true;buttons[0].disabled=true;track.hidden=false;status.hidden=true;
  try{
   const profile=await connectChessProfile(input.value,controller.signal);
   window.dispatchEvent(new CustomEvent('ply-profile-connected',{detail:profile}));
   if(panel.open)await greet(profile);
  }catch(error){if(panel.open){status.textContent=t(error.message);status.hidden=false}}
  finally{input.readOnly=false;buttons[0].disabled=false;track.hidden=true}
 };
 const [profile]=await Promise.all([getRecord('chess-profile','meta').catch(()=>null),delay(Math.max(0,1500-(performance.now()-started)))]);
 if(controller.signal.aborted)return;
 panel.dataset.stage='complete';
 await delay(320);
 if(controller.signal.aborted)return;
 const before=mark.getBoundingClientRect().top;
 const linked=profile?.username&&!profile.disconnected;
 content.hidden=false;track.hidden=true;form.hidden=Boolean(linked);
 if(linked)void greet(profile);
 const distance=before-mark.getBoundingClientRect().top;
 mark.animate([{translate:'0 '+distance+'px'},{translate:'0 0'}],{duration:540,easing:'cubic-bezier(.22,.75,.23,1)'});
 if(!linked)buttons[1].focus({preventScroll:true});
}
