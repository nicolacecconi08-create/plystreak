# Plystreak 1.24.0 — esportazione per GitHub e Codex

Snapshot Site 51, commit `64bc30194f2562e3f6ce1bccd5219b49f0d06b4f`, preparato il 13 novembre 2026. Il codice applicativo è invariato; cinque test storici sono stati corretti su richiesta durante l’esportazione. Questa esportazione non modifica il sito online né i dati dei suoi visitatori. L’automazione delle 03:00 è disattivata e non deve essere riattivata.

## Avvio rapido

Servono Python 3 per il server e Node.js per i test (verificato Node 24.22.1, Python 3.12.14). Nessuna installazione npm è necessaria: le dipendenze runtime sono già locali.

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Aprire http://127.0.0.1:8080/ . Non aprire gli HTML con file://: moduli ES, Worker e WASM richiedono HTTP. Mantenere la stessa porta per riutilizzare i dati locali. Servire `.wasm` come `application/wasm`. Il server è per sviluppo, non per pubblicazione. Il package.json storico riporta ancora linea-chess/1.0.0: la versione distribuita è 1.24.0, confermata dal manifest del core e dalle release.

## Architettura e struttura

Applicazione statica multipagina, senza compilazione, framework o backend incluso. JavaScript ES modules e CSS condivisi. Tutta l’analisi viene eseguita sul dispositivo tramite un Web Worker Stockfish. Le spiegazioni sono generate da logica scacchistica, non da un servizio LLM.

| Percorso | Responsabilità |
| --- | --- |
| dist/index.html, app.js | Import PGN, analisi, confronto con migliore mossa, varianti e navigazione |
| dist/analysis.js, tactics.js | Motore, classificazioni ed evidenze tattiche |
| dist/accuracy-metric.js | Accuracy secondo metodo Lichess, distinta da CAPS2 |
| dist/coach* | Partite con allenatore, livelli, commenti e revisione |
| dist/practice*, repetition*, puzzle* | Esercizi, soluzioni, difficoltà e rating problemi |
| dist/open* | Lezioni, catalogo ECO ed esploratore dalla prima mossa |
| dist/live* | Partita locale a due giocatori, regole, orologio e materiale |
| dist/archive.js, backup.js, review-checkpoint.js | Archivio, validazione backup e ripresa analisi |
| dist/settings*, shell*, mobile-review*, *.css | Preferenze, navigazione, layout e temi |
| dist/vendor, pieces, fonts | Dipendenze, cataloghi, motore e risorse locali |
| dist/updates | Manifest e pacchetti storici del core PC, mantenuti integri |
| test*.mjs, qa/board-fixture.html, test-board.html | Test automatici e fixture UI |
| research/elo | Pipeline sperimentale Elo: codice e modello aggregato, non abilitato nel sito |
| ROADMAP.md, PRIORITIES-RECOVERED.md, RELEASE-*.md | Priorità e storico; leggere insieme alle precisazioni in docs/EXPORT.md |
| .openai/hosting.json | Configurazione originale Sites, conservata per documentazione |

Le funzionalità comprendono analisi PGN e ripresa, categorie delle mosse, accuracy, varianti legali navigabili, prossima mossa saliente, frecce automatiche/manuali, allenatore, revisione diretta, esercizi persistenti, progressi, import Chess.com pubblico, aperture, gioco locale con orologio, lingue e temi. Non tutte le funzionalità sono prive di difetti: consultare il rapporto dei test.

## Dipendenze

- Stockfish.js 19.0.1 Lite single-thread JS/WASM: incluso in dist/vendor; nessun download richiesto per analizzare localmente.
- chess.js 1.4.0: incluso, regole e validazione delle mosse.
- Cataloghi aperture e problemi, pezzi PNG/SVG, font Outfit/Source Sans 3 e font precedenti: inclusi.
- Ricerca Elo facoltativa: Python con `numpy` e `zstandard`; installare in un ambiente virtuale separato. Questi pacchetti non servono per eseguire il sito. Le versioni della ricerca non erano bloccate nel progetto originale, quindi la riproducibilità numerica completa non è garantita.
- Chess.com: importazione dipendente da rete, API pubblica, CORS e disponibilità esterna. Non è un login all’account e non sincronizza l’archivio locale tra dispositivi.

Non esistono node_modules o lockfile originali da recuperare. Le dipendenze runtime sono vendorizzate; i loro hash sono nel manifesto di esportazione. I sorgenti C++ e la toolchain completa per ricompilare Stockfish non erano presenti: vedere THIRD_PARTY_NOTICES.md.

## Test e sviluppo

Eseguire dalla radice:

```sh
node test-accuracy-metric.mjs
node test-award-evidence.mjs
node test-board-geometry.mjs
node test-navigation.mjs
node test-review-resume.mjs
node test-open-explorer.mjs
node test-brilliant-engine.mjs
python3 scripts/test-all.py
```

Il runner restituisce errore se un test fallisce o scade; non maschera i fallimenti storici. I test con motore reale possono impiegare minuti. Il rapporto dell’esportazione è in docs/test-results.json e docs/VERIFICATION.md. Cinque test storici non erano allineati alle implementazioni recenti e sono stati corretti su richiesta. Le modifiche riguardano esclusivamente i test, senza modificare funzioni o dati dell’app; dettagli in docs/TEST-FIXES.md.

Per lavorare con Codex: creare un repository GitHub **privato**, estrarre questo ZIP e caricarne il contenuto (non lo ZIP stesso) in un primo commit; collegare il repository a Codex, usare questa cartella come radice e far leggere README.md, AGENTS.md e docs/EXPORT.md. Configurare Node/Python e i comandi sopra. Non sono necessarie credenziali applicative per lo sviluppo locale. Non caricare mai backup utente o segreti. Nessun deploy automatico viene configurato da questo archivio.

Usare branch e commit piccoli, verificare i test pertinenti, preservare lo schema dei dati e controllare entrambe le orientazioni della scacchiera. Non interpretare un report storico come prova di verifica attuale. Prima di una futura pubblicazione servono autorizzazione e destinazione esplicite; la configurazione Sites originale non autorizza un deploy.

## Salvataggio e trasferimento dei dati

Vedere docs/STORAGE.md. I dati non sono dentro i sorgenti: cambiare host, protocollo o porta crea un’origine diversa e quindi un archivio locale separato. Il trasferimento del repository da solo non trasferisce partite o progressi.

## Licenze e limiti

Vedere LICENSE, THIRD_PARTY_NOTICES.md e docs/EXPORT.md. Le licenze e le attribuzioni originali restano valide anche in un repository privato. Non sono inclusi installer o shell native completi PC/iOS. I pacchetti core PC non li sostituiscono.
