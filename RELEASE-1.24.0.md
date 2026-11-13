# 1.24.0 — Completamento pannello laterale mobile
Ripristinato il lavoro locale interrotto dopo la pulizia automatica del workspace, partendo dal commit pubblicato cb0dee350f746a8266aa16df08196653ba8daa67.
- Selettore categoria e contenuti nella colonna destra, scacchiera e controlli a sinistra.
- Cambio categoria riparte dall'inizio del pannello, correggendo lo scorrimento residuo visibile nella registrazione utente.
- Lista mosse adattata alla colonna stretta, badge e indicazione colore; testi lunghi scorrono nel solo pannello.
- Il layout affiancato comporta una scacchiera più piccola su telefono. Nessuna modifica al motore o ai dati.

Verifica ripetuta il 13 novembre: syntax mobile-review.js; PASS test-board-geometry, test-navigation, test-review-resume, test-overhaul. Chrome iframe 390x844: body clientHeight=scrollHeight=844, pannello 681px, scrollTop=0; categorie Dati/Mosse visibili dopo selezione. Non verificato Safari su iPhone/iPad fisici.
PC core aggiornato preservando export nativo; checksum nel manifest.
