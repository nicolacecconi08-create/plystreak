# Sviluppo Plystreak
Runtime statico in dist/: nessuna build o installazione npm per avviarlo. Consultare README e documentazione pertinente alla modifica; esportazioni e roadmap sono anche storiche.
Preservare funzioni, dati locali, integrazioni native e licenze. Non includere dati utente o segreti; test con dati sintetici.
Analisi: varianti legali, valutazioni dalla stessa posizione, nessuna tattica o certezza inventata. Elo: modello documentato, limiti espliciti, nessuna conversione arbitraria dalla precisione.
Preferenza del proprietario: versionare tutte le modifiche su Git, eseguire push su GitHub e pubblicare sul Site esistente dopo i controlli. Conservare URL e accessi attuali; non riattivare l’automazione delle 03:00.
Eseguire i test pertinenti e riportare i fallimenti. Suite completa: python3 scripts/test-all.py.

Per ogni pubblicazione che modifica il runtime, incrementare native/windows/core-version.json, rigenerare node scripts/build-desktop-update.mjs, includere manifest e pacchetto gzip nel commit e nella pubblicazione del sito; verificare il canale Windows dopo il deploy. Non cambiare le versioni già distribuite.

## Promemoria per chi modifica il progetto
- Prima di intervenire, controllare lo stato Git e recuperare la versione corrente, preservando eventuali modifiche locali.
- Dopo ogni modifica eseguire i controlli pertinenti, registrare le modifiche in Git e inviarle al repository GitHub. Per modifiche al runtime, eseguire `node scripts/build-offline.mjs` e preparare l'aggiornamento Windows secondo le istruzioni sopra.
- Pubblicare la versione verificata sul Site ChatGPT esistente e controllare che il deploy sia riuscito, che l'URL sia invariato e che il manifest e il pacchetto Windows pubblicati corrispondano. Un push GitHub non dimostra che il sito sia aggiornato. Se lo strumento Sites non è disponibile, segnalarlo chiaramente e indicare quale commit attende la pubblicazione.
- La revisione completa delle traduzioni richieste dal proprietario è ancora aperta: analizzare e correggere le traduzioni errate nelle cinque lingue, verificare le pagine e rigenerare il catalogo con `python3 build-locales.py`. Non dichiarare completata la revisione senza averla verificata.
- Non riattivare l'automazione delle 03:00; non includere dati personali, backup o credenziali nel repository.

## Richieste aperte del proprietario
- Impostazioni: mostrare un'anteprima dei diversi stili grafici e dei pezzi selezionati. Esiste una prima anteprima: verificarne completezza e funzionamento per tutte le opzioni.
- Scacco matto: animare il re che cade a terra di lato. Rendere più evidenti sulla scacchiera le pulsazioni associate alle mosse.
- Analisi: mantenerla aperta e conservare il suo stato anche quando si cambia schermata all'interno di Plystreak.
- Traduzioni: revisionare e correggere tutte le lingue, con particolare attenzione all'inglese.
- Istruttore: rendere le spiegazioni più utili e spiegare i cambiamenti posizionali della mossa, senza descrivere una continuazione di Stockfish come risposta obbligata dell'avversario. Nelle spiegazioni identificare il pezzo presente sulla casella per nome; usare la notazione della casella quando è vuota.
- Correzione durante la partita: quando l'istruttore interrompe il gioco per una mossa errata, mostrare l'interfaccia di correzione al posto del pannello accanto alla scacchiera con le valutazioni delle mosse. Rendere evidente che invita a correggere l'errore e a riflettere sulla natura della mossa.
- Difficoltà: differenziare sensibilmente i livelli inferiori, rendendoli più deboli e capaci di commettere errori e lasciare maggiore libertà al giocatore. Il livello più forte deve usare Stockfish a piena forza disponibile.
- Aggiungere bot predefiniti con nomi, aspetti individuali e rating dichiarato, da 250 a 2400, con livelli intermedi significativi per l'evoluzione del gioco. Calibrare e verificare la forza; distinguere un rating stimato da un rating misurato, senza attribuire valori non supportati.
