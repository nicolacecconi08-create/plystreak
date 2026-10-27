# Plystreak — priorità e stato verificato

Aggiornato il 27 ottobre 2026, rilascio 1.9.5.

## Criterio deciso
Game Review e sistema dei problemi hanno pari priorità assoluta. Prima di aggiungere funzioni, riesaminare entrambe le aree e correggere i difetti rilevanti. Ordinare ogni lotto per affidabilità scacchistica, impatto sull’utente, dipendenze, costo e rischio; preservare dati e modifiche concorrenti.

## Lotto 1.9.5 completato
- Game Review e motore condiviso: scartate alternative MultiPV di profondità diversa dalla prima scelta, punteggi limitati (bound) e duplicati della prima mossa. “Grande mossa” richiede alternative alla stessa profondità, almeno 16, senza confrontare matto e centipawn.
- Motore: riusa anche risultati entrati in cache mentre un’identica richiesta attendeva in coda.
- Problemi: confronto tra migliore e risposta del giocatore dalla stessa posizione iniziale, con ricerca vincolata alla mossa effettiva e verifica più profonda quando necessaria. La probabilità satura non basta a far accettare una perdita importante; matto e punteggi ordinari sono distinti.
- Problemi: incertezza, ricerca troppo superficiale o linea non corrispondente alla risposta non registrano un errore. Conservati primo tentativo, aiuti e intervalli di ripasso.
- Soluzioni degli esercizi sulla scacchiera, con sequenza legale, commenti, avanti/indietro e ritorno al problema. La soluzione del catalogo viene verificata prima di mostrarla, anche se una nuova ricerca preferisce un’altra mossa.

## Prossima rivalutazione: pari priorità
1. Problemi: aumentare varietà e copertura degli errori ricorrenti con posizioni verificate; valutare esercizi che richiedano più risposte del giocatore, senza trasformare una sola sequenza in unica soluzione accettata.
2. Game Review: approfondire le spiegazioni posizionali e il confronto concreto tra partita e alternativa; rafforzare campioni di regressione per accuracy e classificazioni, senza presentare equivalenza ai criteri proprietari di Chess.com.
3. Infrastruttura trasversale: audit prestazioni su dispositivi reali, analisi approfondita selettiva e verifiche dei finali. Tablebase non implementate; richiedono decisione su disponibilità online/offline e fonte.
4. Archivio e PGN: conservazione, recupero e integrità delle analisi. Archivio locale già presente; sincronizzazione richiede servizio esterno reale.
5. Gioco dal vivo essenziale, dopo le priorità precedenti: regole, rotazione, cronologia, accesso alla revisione; poi orologi, ripresa, rivincita, patta e annullamento.

## Vincoli e blocchi
- Login e sincronizzazione reali restano bloccati dalla configurazione di un servizio esterno: vedere AUTH-PLAN.md. Nessuna autenticazione fittizia.
- In questa sessione il recupero della conversazione aggiuntiva sulle priorità non era disponibile. Questo elenco usa le decisioni presenti nel contesto e nell’incarico salvato; non attribuisce approvazioni a dettagli non recuperati.
- Test browser su formati responsive non equivalgono a prove su iPad/iPhone fisici.
