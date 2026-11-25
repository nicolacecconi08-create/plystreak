import './popup-swipe.js';
import {getSettings} from './settings.js';
import {startupUpdateGuard} from './auto-update.js';
let sessionStore;try{sessionStore=window.sessionStorage}catch{}
const startup=startupUpdateGuard({storage:sessionStore,referrer:document.referrer,origin:location.origin});
for(const event of ['pointerdown','keydown','touchstart','input'])window.addEventListener(event,()=>startup.interact(),{capture:true,passive:true});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  let requested = false, banner, checkingClients = false;
  const labels = {
    it: ['Aggiornamento disponibile', 'Salva prima il lavoro in corso.', 'Aggiorna ora'],
    en: ['Update available', 'Save your current work first.', 'Update now'],
    es: ['Actualización disponible', 'Guarda primero tu trabajo.', 'Actualizar ahora'],
    fr: ['Mise à jour disponible', 'Enregistre d’abord ton travail.', 'Mettre à jour'],
    de: ['Update verfügbar', 'Speichere zuerst deine Arbeit.', 'Jetzt aktualisieren']
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (requested) location.reload();
  });
  navigator.serviceWorker.register(new URL('./sw.js', import.meta.url), {updateViaCache: 'none'}).then(registration => {
    const showUpdate = () => {
      if (!registration.waiting || !navigator.serviceWorker.controller || banner) return;
      if(startup.canApply()&&!checkingClients&&window.MessageChannel){
        checkingClients=true;const candidate=registration.waiting,channel=new MessageChannel();
        const timer=setTimeout(()=>{channel.port1.close();checkingClients=false;startup.interact();showUpdate()},3000);
        channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();checkingClients=false;
          if(e.data===true&&startup.canApply()&&registration.waiting===candidate){requested=true;candidate.postMessage({type:'SKIP_WAITING'})}
          else{startup.interact();showUpdate()}
        };
        candidate.postMessage({type:'CAN_AUTO_UPDATE'},[channel.port2]);return;
      }
      if(checkingClients)return;
      const [title, hint, action] = labels[getSettings().language] || labels.it;
      banner = document.createElement('div');
      banner.dataset.swipeNotice='';
      banner.setAttribute('role', 'status');
      banner.style.cssText = 'position:fixed;z-index:10000;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(92vw,420px);padding:14px 16px;border:1px solid #e9a173;border-radius:12px;background:#291823;color:#fff0e2;box-shadow:0 8px 28px #0009;font:16px system-ui;display:flex;align-items:center;gap:12px';
      const text = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = title;
      const small = document.createElement('div');
      small.textContent = hint;
      small.style.cssText = 'font-size:13px;margin-top:3px';
      text.append(strong, small);
      const button = document.createElement('button');
      button.textContent = action;
      button.style.cssText = 'margin-left:auto;padding:9px 12px;border:0;border-radius:8px;background:#e9a173;color:#21111b;font-weight:700;cursor:pointer';
      button.addEventListener('click', () => {
        if (!registration.waiting) return location.reload();
        requested = true;
        button.disabled = true;
        registration.waiting.postMessage({type:'SKIP_WAITING'});
      });
      banner.append(text, button);
      document.body.append(banner);
    };
    const watch = () => registration.installing?.addEventListener('statechange', showUpdate);
    registration.addEventListener('updatefound', watch);
    watch();
    showUpdate();
    let lastCheck = 0;
    const check = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastCheck < 60000) return;
      lastCheck = Date.now();
      registration.update().then(showUpdate).catch(() => {});
    };
    document.addEventListener('visibilitychange', check);
    setInterval(check, 300000);
    navigator.serviceWorker.ready.then(({active})=>{
      if(!active || !window.MessageChannel)return;
      const channel=new MessageChannel();
      channel.port1.onmessage=event=>{
        channel.port1.close();
        if(typeof event.data!=='string'||!event.data.startsWith('plystreak-offline-'))return;
        try{
          const old=localStorage.getItem('plystreak-active-version');
          localStorage.setItem('plystreak-active-version',event.data);
          if(!old||old===event.data)return;
          const notice=document.createElement('div');notice.dataset.swipeNotice='';notice.setAttribute('role','status');
          const labels={it:'Plystreak è aggiornata',en:'Plystreak is up to date',es:'Plystreak está actualizado',fr:'Plystreak est à jour',de:'Plystreak ist aktualisiert'};
          notice.textContent=labels[getSettings().language]||labels.it;
          notice.style.cssText='position:fixed;z-index:10000;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);padding:14px 18px;border:1px solid #e9a173;border-radius:12px;background:#291823;color:#fff0e2;box-shadow:0 8px 28px #0009;font:600 16px system-ui';
          document.body.append(notice);setTimeout(()=>notice.remove(),8000);
        }catch{}
      };
      active.postMessage({type:'GET_VERSION'},[channel.port2]);
    }).catch(()=>{});
    window.addEventListener('online', check);
    check();
  }).catch(() => { /* Online use remains available if offline storage is denied. */ });
}

if (window.plystreakDesktop) {
  let desktopNotice;
  let checking=false;
  const checkDesktop=async()=>{if(checking)return;checking=true;try{const result=await window.plystreakDesktop.check();
    if(result.status==='available'&&startup.canApply()){await window.plystreakDesktop.install();if(startup.canApply()){await window.plystreakDesktop.restart();return;}}
    if (result.status !== 'available' && result.status !== 'shell') return;
    if(desktopNotice)return;
    const link = document.createElement('a');desktopNotice=link;link.dataset.swipeNotice='';
    const labels = {it:'Aggiornamento disponibile',en:'Update available',es:'Actualización disponible',fr:'Mise à jour disponible',de:'Update verfügbar'};
    link.textContent = labels[getSettings().language] || labels.it;
    link.href = 'settings.html#app';
    link.style.cssText = 'position:fixed;z-index:10000;top:12px;right:12px;padding:12px 16px;border-radius:10px;background:#e9a173;color:#21111b;font:700 15px system-ui;box-shadow:0 5px 20px #0008';
    document.body.append(link);
  }catch{}finally{checking=false}};
  checkDesktop();
  setInterval(()=>{if(document.visibilityState==='visible')checkDesktop()},300000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkDesktop()});
}
