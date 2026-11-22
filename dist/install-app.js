import {getSettings} from './settings.js';

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  let requested = false, banner;
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
      const [title, hint, action] = labels[getSettings().language] || labels.it;
      banner = document.createElement('div');
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
    window.addEventListener('online', check);
    check();
  }).catch(() => { /* Online use remains available if offline storage is denied. */ });
}

if (window.plystreakDesktop) {
  window.plystreakDesktop.check().then(result => {
    if (result.status !== 'available' && result.status !== 'shell') return;
    const link = document.createElement('a');
    const labels = {it:'Aggiornamento disponibile',en:'Update available',es:'Actualización disponible',fr:'Mise à jour disponible',de:'Update verfügbar'};
    link.textContent = labels[getSettings().language] || labels.it;
    link.href = 'settings.html#app';
    link.style.cssText = 'position:fixed;z-index:10000;top:12px;right:12px;padding:12px 16px;border-radius:10px;background:#e9a173;color:#21111b;font:700 15px system-ui;box-shadow:0 5px 20px #0008';
    document.body.append(link);
  }).catch(() => {});
}
