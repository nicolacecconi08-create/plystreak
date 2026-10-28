# Plystreak — priorità e stato verificato

Aggiornato il 28 ottobre 2026, rilascio 1.10.0.

## Criterio deciso
Navigazione alla prossima mossa importante, Game Review e sistema dei problemi hanno pari priorità assoluta. Prima di aggiungere funzioni, riesaminare entrambe le aree e correggere i difetti rilevanti. Ordinare ogni lotto per affidabilità scacchistica, impatto sull’utente, dipendenze, costo e rischio; preservare dati e modifiche concorrenti.

## Lotto 1.10.0 — navigazione ai momenti importanti
- Pulsante «Prossima mossa importante» vicino ai controlli della scacchiera. Cerca dopo la mossa attuale nella partita originale, esce dalle varianti e torna alla revisione; non modifica PGN o dati.
- Rileva mosse già analizzate classificate geniali, grandi mosse, errori, gravi errori e occasioni mancate; nuovi doppi attacchi non inchiodati, inchiodature al re, perdita del diritto di arrocco, matto/stallo e risposta di matto legale. Mostra il motivo del salto e distingue fine dei risultati da analisi incompleta. Non pretende di riconoscere ogni svolta strategica.
- Dimensionamento scacchiera aggiornato per includere il nuovo comando.
- Spiegazioni: perdita del diritto di arrocco dopo movimento del re e conseguenza indiretta dello scambio di donne con ricattura del re in una linea verificata. Il testo distingue risposta obbligata da possibilità e non attribuisce automaticamente un vantaggio nel finale.
- Regressioni superate per Game Review, problemi e spiegazioni, più test dedicati alla navigazione e alle conseguenze indirette.

## Lotto 1.9.9 — colori delle frecce di cattura
- Rosso riservato alla cattura consigliata dalla prima linea del motore, dalla posizione visibile, con profondità almeno 16 e variante legale.
- Giallo per attacchi possibili, controllo delle caselle e catture legali non necessariamente consigliate.
- Alternative di cattura favorevoli mostrate in giallo con legenda distinta: solo linee MultiPV alla stessa profondità, vantaggio di almeno 50 centipawn dal lato che muove e perdita rispetto alla prima scelta tra 0 e 50. Non si confrontano matto e centipawn; nessuna promessa di esito certo. La copertura è limitata alle alternative effettivamente restituite dal motore.
- Test dedicati per prospettiva Bianco/Nero, profondità, bound, continuazioni illegali, mosse tranquille e vantaggi non confermati.

## Lotto 1.9.8 — revisione grafica di Ply
- Sostituito il cavallino cartoon con un emblema sobrio da scacchi. Eliminati volto espressivo, accessori e animazione di saluto, come richiesto.

## Lotto 1.9.7 — frecce nell’analisi e mascotte
- Freccia verde per la migliore dalla posizione visibile, solo con analisi disponibile; nel confronto delle alternative si parte dalla stessa posizione iniziale.
- Frecce per gli attacchi del pezzo appena mosso o selezionato, catture legali immediate e, su richiesta, controllo delle caselle vuote. Turno, inchiodature, ostacoli ed en passant sono verificati; nessuna promessa di guadagno materiale.
- Modalità migliore + attacchi, solo migliore, solo attacchi o nessuna; preferenza salvata. Frecce responsive, ruotabili e senza intercettare i tocchi.

- Mascotte originale Ply: cavallino vettoriale nel marchio di tutte le pagine e nelle impostazioni, con movimento disattivabile e rispetto delle preferenze di accessibilità.

## Lotto 1.9.6 completato
- Problemi: filtro per tema e alternanza dei temi tra le nuove posizioni; i ripassi dovuti conservano la precedenza.
- Catalogo: 32 configurazioni legali, composte dai 16 scenari originali e dalle loro 16 versioni a colori invertiti, esplicitamente indicate. Verifica del motore anche dal lato del Nero.
- Game Review: osservazioni concrete su difese abbandonate, pedoni passati, colonne libere per le torri e diagonali aperte per gli alfieri. I fatti geometrici non vengono presentati come vantaggi certi; promozioni e catture avversarie sono controllate.
- Avvio sessione disabilitato fino al caricamento dei dati, con feedback quando nessuna posizione corrisponde ai filtri.
- Verifiche: regressioni del progetto, legalità e obiettivi di tutte le 32 configurazioni, quattro casi dal lato del Nero con Stockfish, interazione browser sul filtro e sul matto del Nero.

## Lotto 1.9.5 completato
- Game Review e motore condiviso: scartate alternative MultiPV di profondità diversa dalla prima scelta, punteggi limitati (bound) e duplicati della prima mossa. “Grande mossa” richiede alternative alla stessa profondità, almeno 16, senza confrontare matto e centipawn.
- Motore: riusa anche risultati entrati in cache mentre un’identica richiesta attendeva in coda.
- Problemi: confronto tra migliore e risposta del giocatore dalla stessa posizione iniziale, con ricerca vincolata alla mossa effettiva e verifica più profonda quando necessaria. La probabilità satura non basta a far accettare una perdita importante; matto e punteggi ordinari sono distinti.
- Problemi: incertezza, ricerca troppo superficiale o linea non corrispondente alla risposta non registrano un errore. Conservati primo tentativo, aiuti e intervalli di ripasso.
- Soluzioni degli esercizi sulla scacchiera, con sequenza legale, commenti, avanti/indietro e ritorno al problema. La soluzione del catalogo viene verificata prima di mostrarla, anche se una nuova ricerca preferisce un’altra mossa.

## Priorità aggiornate dall’utente
| Priorità | Area | Prossimo lavoro |
| --- | --- | --- |
| Massima assoluta | Prossima mossa importante | Pulsante implementato in 1.10.0; ampliare con evidenza verificata il riconoscimento delle svolte strategiche. |
| Massima assoluta | Game Review | Correttezza di classificazioni e accuracy, regressioni, chiarezza e visibilità delle spiegazioni. |
| Massima assoluta | Problemi | Audit delle risposte; varietà verificata e copertura degli errori ricorrenti; valutare esercizi con più risposte accettando alternative valide. |
| Alta | Spiegazioni | Conseguenze indirette, attività e controllo delle case, struttura pedonale, sicurezza del re; spiegare chi beneficia degli scambi senza ridurre tutto al materiale. |
| Alta | Approfondimenti | Varianti legali, risposte avversarie, conseguenze tattiche e strategiche, opportunità future e cambiamenti affidabili della valutazione. Distinguere possibilità da necessità. |
| Successiva | Infrastruttura | Prestazioni su dispositivi reali, analisi selettiva, finali e tablebase da valutare. |
| Successiva | Archivio e PGN | Integrità e recupero; sincronizzazione subordinata a servizio esterno reale. |
| Successiva | Gioco dal vivo | Prima regole, rotazione, cronologia e revisione; poi orologi, ripresa, rivincita e patta/annullamento. |

Le tre nuove priorità provengono dall’ultimo messaggio esplicito dell’utente. Il completamento del pulsante non equivale al completamento di tutti i miglioramenti delle spiegazioni.

## Vincoli e blocchi
- Login e sincronizzazione reali restano bloccati dalla configurazione di un servizio esterno: vedere AUTH-PLAN.md. Nessuna autenticazione fittizia.
- In questa sessione il recupero della conversazione aggiuntiva sulle priorità non era disponibile. Questo elenco usa le decisioni presenti nel contesto e nell’incarico salvato; non attribuisce approvazioni a dettagli non recuperati.
- Test browser su formati responsive non equivalgono a prove su iPad/iPhone fisici.
