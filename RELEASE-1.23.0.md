# 1.23.0 — Revisione mobile per categorie

Richiesta: screenshot iPhone con accuracy senza etichetta e revisione troppo lunga.
- Accuracy tolta dalle righe giocatori: rimane nel riepilogo chiaramente denominato Accuracy, per entrambi i colori.
- Analisi caricata su telefono: area vincolata al viewport visivo, header compatto, scacchiera e comandi sempre insieme; categorie Spiega, Mosse, Dati, Frecce, Varianti.
- Riutilizzo dei nodi originali con placeholder: nessun controllo duplicato; ripristino struttura desktop/tablet al cambio breakpoint. Motore, metodo, esportazione, reset e strumenti conservati.
- Dettagli lunghi scorrono nel solo pannello interno. Non dichiarato zero scrolling per testi di lunghezza arbitraria o landscape molto basso; fallback accessibile in landscape.
- Nessuna modifica a engine, accuracy, Elo, archivio o calcolo delle mosse.

## Prove
Chrome iframe 390x844: body clientHeight=scrollHeight=844, scacchiera 327px; tutti i comandi principali e categorie visibili. Cambio Spiega/Mosse mantiene posizione; Dati contiene accuracy; Frecce mostra controlli originali; Varianti entra in esplorazione e Revisione torna a Spiega. Cambio 820px ripristina layout e nodi originari, ritorno 390px ricrea categorie senza duplicati. Ripresa analisi locale verificata.
PASS syntax mobile-review.js, test-board-geometry, test-navigation, test-review-resume, test-languages, test-overhaul.
Screenshot qa-mobile-1.23.jpg. QA simulata Chrome, non Safari né iPhone/iPad fisici. Restano prove di safe area nativa, tastiera e zoom reale. Modifica circoscritta alla pagina Analisi; le altre pagine non sono state convertite in viewport fissi.
PC core aggiornato preservando export nativo; checksum nel manifest.
