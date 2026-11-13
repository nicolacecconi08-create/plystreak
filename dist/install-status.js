const status=document.getElementById('offlineStatus');
if(!('serviceWorker' in navigator)||location.protocol!=='https:')status.textContent='Preparazione offline non disponibile in questo ambiente. Puoi usare il sito online.';
else {
  navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{updateViaCache:'none'}).then(registration=>{
    const update=()=>{status.textContent=registration.active?'Risorse offline installate. Se è pronto un aggiornamento, chiudi tutte le finestre di Plystreak e riapri l’app.':registration.waiting?'Aggiornamento pronto. Chiudi tutte le finestre di Plystreak e riapri l’app.':'Download delle risorse offline in corso. Mantieni la connessione.';};
    const watch=()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='redundant')status.textContent='Download offline non riuscito. Riprova con connessione e spazio disponibili.';else update();});update();};
    registration.addEventListener('updatefound',watch);watch();
    navigator.serviceWorker.ready.then(update);
  }).catch(()=>{status.textContent='Risorse offline non installate. Verifica connessione e spazio disponibile; il sito resta utilizzabile online.';});
}
