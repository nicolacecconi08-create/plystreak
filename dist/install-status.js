import './i18n.js';
const status=document.getElementById('offlineStatus');
if(window.plystreakDesktop)status.textContent='L’app Windows include le risorse per giocare e analizzare offline.';
else if(!('serviceWorker' in navigator)||location.protocol!=='https:')status.textContent='Preparazione offline non disponibile in questo ambiente. Puoi usare il sito online.';
else {
  navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{updateViaCache:'none'}).then(registration=>{
    const update=()=>{status.textContent=registration.waiting?'Aggiornamento pronto. Salva il lavoro e scegli Aggiorna ora.':registration.active?'Risorse offline installate. Quando è pronto un aggiornamento, puoi applicarlo dal messaggio nell’app.':'Download delle risorse offline in corso. Mantieni la connessione.';};
    const watch=()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='redundant')status.textContent='Download offline non riuscito. Riprova con connessione e spazio disponibili.';else update();});update();};
    registration.addEventListener('updatefound',watch);watch();
    navigator.serviceWorker.ready.then(update);
  }).catch(()=>{status.textContent='Risorse offline non installate. Verifica connessione e spazio disponibile; il sito resta utilizzabile online.';});
}
