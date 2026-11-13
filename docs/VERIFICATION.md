# Verifica esportazione — 13 novembre 2026

## Risultati
- 44 file di test Node eseguiti: **44 PASS**, zero fallimenti e timeout nell’esecuzione finale. Prima esecuzione: 39 PASS e 5 FAIL; correzioni dei test documentate in TEST-FIXES.md.
- Test con Stockfish WASM reale: confronto dalla stessa radice, soluzioni esercizi anche per il Nero, varianti complete, risposte legali. Passati inoltre accuracy, classificazioni/evidenze, aperture, geometria, navigazione, ripresa, backup, orologio e regole scacchistiche. Output integrale allegato, senza trasformare le frasi storiche dei singoli test in conteggi aggiornati.
- Server locale Python: HTTP 200 per Analisi, Coach, Esercizi, Aperture, Live, chess.js e WASM; MIME application/wasm corretto. Nessun riferimento locale HTML mancante.
- Tutti i file runtime dist/ verificati contro gli hash del commit originale: invariati. Core PC 1.24.0: checksum e dimensione del manifest validi, 153 file, differenza di esportazione Capacitor preservata.
- Scansione di pattern comuni di credenziali eseguita anche nei pacchetti gzip: nessuna corrispondenza. Nessun .git, file .env o backup di visitatori incluso. Dati individuali di ricerca e screenshot storici esclusi; attribuzioni delle licenze mantenute.

## Non verificato / limiti
Nessuna nuova sessione QA visiva in browser in questa esportazione: l’avvio HTTP e i test del motore non certificano l’interfaccia end-to-end. Restano Safari/iOS fisico, touch, safe area, audio/autoplay e accessibilità; i report storici descrivono prove precedenti, non svolte di nuovo qui.
Non provati import remoto Chess.com e disponibilità dei servizi esterni, né trasferimento di archivi utente reali. Backup verificato con fixture sintetiche; limiti del ripristino documentati in STORAGE.md.
Non compilate app PC/iOS: progetti nativi assenti. Script storico build-core-update.py non eseguito perché richiede storia Git non inclusa. Ricerca Elo non rieseguita: dataset individuale escluso per privacy, modello non validato per produzione.

Il sito online, i suoi dati e l’automazione non sono stati modificati. Lo ZIP è una copia per iniziare lo sviluppo, non una nuova release pubblicata.
