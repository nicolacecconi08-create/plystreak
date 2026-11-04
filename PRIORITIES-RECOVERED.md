# Priorità recuperate — 4 novembre 2026

## Release 1.16.0

Sistema visivo ametista/nero condiviso da Analisi, Coach, Dal vivo, Esercizi, Aperture, Progressi e Impostazioni. Rimosse le introduzioni promozionali, la card «Momenti su cui lavorare» e il ritratto coach a tutta altezza. Temi ametista/lavanda; preferenze precedenti conservate. Frecce manuali separate dal motore, modalità touch esplicita, più frecce, toggle singolo, cancellazione e rotazione. Materiale dal vivo derivato da posizione e cronologia. Accuracy della partita secondo aggregazione Lichess; metodo salvato, confronti delle statistiche separati per metodo. Geniale: recupero tardivo ammesso nella PV legale, controlli di affidabilità e ricatture immediate mantenuti. La vecchia stima Elo non calibrata è sospesa; pannello visibile e senza numeri inventati.

## Lavoro residuo, ordinato

1. **P0 — Elo empirico**: acquisire campione umano rated stratificato (fonte Lichess CC0), analizzarlo con la stessa versione/configurazione Stockfish, estrarre feature reali, split per giocatore e data, addestramento e holdout MAE/bias/intervalli 80%, esportazione modello e inferenza. Nessun dataset è stato analizzato o modello addestrato in 1.16.0. Il pannello «in attesa di validazione» non completa questa priorità.
2. **P0 — Game Review e problemi**: ampliare benchmark di classificazione/accuracy su partite lunghe, terminali, più scelte equivalenti e sacrifici; metadati motore completi. Problemi meno ripetitivi, selezione adattiva recente, percorso principale verificato e alternative esplicite, difficoltà/distrattori legali, Elo problemi e sessione continua preservati.
3. **P1 — Didattica e coach**: approfondimenti concreti e spiegazioni umane senza notazione nelle frasi, distinguendo minacce immediate e ipotesi; scambi, perdita arrocco, attività, struttura e sicurezza del re verificati. Revisione guidata su 3–5 snodi; migliorare risposte del coach. Conservare prossima mossa saliente animata, migliore dalla stessa posizione, varianti legali navigabili e ritorno all’originale.
4. **P1 — Aperture profonde**: estendere catalogo con fonti e rami teorici significativi (spesso 10–20 mosse), ECO, piani, trappole e trasposizioni; niente mosse riempitive o attribuzioni inventate.
5. **P1 — Audio esiti**: matto/sconfitta distinti, evento unico sul termine reale, colore giocatore corretto, esclusione replay storico, on/off e volume, vincoli autoplay iOS.
6. **P1 — Verifica visuale ulteriore**: verificare gesti drag reali destro/touch, orientamento landscape e dispositivi fisici iPhone/iPad; stati scacco/promozione/selezione/animazione per entrambi i temi. In questa release verificati browser desktop e contenitori responsive 390/820 px; nessuna prova su hardware Apple.
7. **P2 — Dati e integrazioni**: salvataggi/backup/ripresa, statistiche coerenti, account Chess.com/import 30 partite, archivio e gioco locale. Login e sincronizzazione reali richiedono backend configurato (AUTH-PLAN.md); non simulare autenticazione. Tablebase e integrazioni avanzate dopo stabilità.

## Regole permanenti

Recuperare sempre sorgenti correnti; preservare modifiche concorrenti, dati e integrazioni native. Italiano naturale, varianti legali verificate, nessuna certezza inventata. Design viola/nero, minimalismo con personalità, comandi accessibili e spiegazioni vicine alla scacchiera. Test prima del rilascio; pubblicazione sul medesimo Site solo con deployment succeeded. Aggiornare core PC con checksum e mantenere export nativo. Resoconto sempre in questa conversazione; mai no_update. Automazione esistente alle 03:00 Europe/Rome, nessun duplicato; rimuovere soltanto TODO interamente chiusi, mantenendo requisiti e lavoro parziale.
