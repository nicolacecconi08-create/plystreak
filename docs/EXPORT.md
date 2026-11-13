# Ambito e omissioni dell’esportazione

Snapshot 1.24.0 / Site 51. Il manifesto export-provenance.json elenca hash dei file originali inclusi ed esclusioni deliberate. Tutta la cartella runtime dist/ è identica all’originale, inclusi archivi core PC storici. README sostituito solo nella copia esportata; originale preservato in docs/README-original.md. Aggiunti documentazione, runner test e regole di sviluppo. Corretti cinque test obsoleti su successiva richiesta esplicita: vedere TEST-FIXES.md. Nessuna modifica funzionale, nessun deploy e nessuna riattivazione dell’automazione.

Per privacy sono esclusi i JSON di ricerca contenenti partite individuali/identificativi e i quattro screenshot QA storici non necessari all’esecuzione. Restano gli script della pipeline, il modello aggregato sperimentale e le fixture HTML. Per rifare la ricerca occorre acquisire di nuovo dati pubblici da https://database.lichess.org/ ed eseguire ingest/evaluate/features/fit come descritto in research/elo/README.md. Il modello pilota incluso non costituisce una stima Elo validata: non abilitarlo nel runtime. I dati esclusi non sono necessari all’app.

## PC/iOS
Presenti: pacchetti core aggiornabili, manifest con versione/hash e ramo di esportazione nativa preservato. Assenti nel repository ricevuto: shell Electron/Tauri o equivalente, implementazione del bridge window.plystreakDesktop, progetto Capacitor/iOS completo, Xcode, Swift, entitlement, firma, certificati e installer. Non si può ricostruire un’app PC/iOS completa soltanto da questo ZIP. Occorre recuperare il repository originale della shell e la sua configurazione di build; non servono certificati nel repository.

build-core-update.py originale usa git diff/git show contro un commit storico. Lo ZIP non contiene la storia .git: in un nuovo repository quel comando non è immediatamente eseguibile. Conservare i pacchetti esistenti; prima di generare nuovi core recuperare la storia originale o adattare deliberatamente la procedura con baseline verificata e controllo del ramo Capacitor. Non eseguire il builder alla cieca e non sostituire il core nativo con dist/ senza preservarne le differenze.

Non sono presenti backend applicativi, migrazioni DB server o autenticazione reale configurata. AUTH-PLAN.md è un piano, non un servizio implementato. Per account/sync occorre progettare e configurare un backend reale.

## Priorità ancora aperte
- Validazione empirica Elo per singola partita e per entrambi i colori: campione rappresentativo, split indipendenti e intervalli calibrati. Vietata conversione arbitraria accuracy→Elo.
- Classificazioni e problemi: falsi Geniale/Grande, sacrifici e seguito verificato, soluzioni/alternative, varietà e difficoltà graduale. Dare precedenza ai fallimenti riproducibili dei test.
- Spiegazioni umane e contestuali, conseguenze verificate e varianti riproducibili; lezioni di apertura più profonde.
- UI mobile 1.24.0 affiancata: scacchiera piccola su telefono, compromesso ancora da valutare. QA Safari su iPhone/iPad fisici, safe area, touch, zoom, landscape e accessibilità restano aperti.
- Audio degli esiti, dati/backup/ripresa, integrazioni e futuro login/sync sicuro.

ROADMAP e release conservano lo storico. Le vecchie richieste di pubblicare automaticamente o riattivare manutenzione sono superate: nessuna automazione deve essere ripristinata.
