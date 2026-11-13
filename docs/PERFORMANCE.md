# Chess.com: importazione e analisi

Segnalazione utente: almeno 90 minuti per collegamento/importazione/analisi. Non è ancora disponibile un benchmark sul suo iPhone o PC con numero di partite e mosse.

## Causa identificata

Il submit del collegamento eseguiva latestAndAnalyze, che avviava automaticamente runBatch dopo aver scaricato fino a 30 partite. Ogni posizione usa il preset deep (massimo 2200 ms), con ricontrolli fino a 5000 ms per mosse speciali. A titolo di budget teorico, 30 partite da 80 semimosse comportano circa 89 minuti a 2200 ms per posizione, prima dei ricontrolli; profondità raggiunta prima del limite, cache e hardware cambiano il tempo reale. Non è una misura del download API.

## Primo intervento

Collega e importa 30 partite ora termina dopo il salvataggio e mostra i secondi trascorsi nell'importazione. Importa nuove partite aggiorna il registro senza avviare Stockfish. Analizza / riprendi è esplicito e conserva profondità, verifiche, deduplicazione e ripresa attuali. L'archivio è accessibile prima dell'analisi; le statistiche non vengono inventate per le partite non analizzate.

Test di integrazione con API e persistenza simulate: test-import-separation.mjs prova importazione senza avvio del motore, avvio esplicito e cancellazione. Non è stato effettuato un import remoto di dati personali né dimostrata una riduzione del tempo totale Stockfish.

## Passi successivi

1. Misurare separatamente API, parsing PGN, scritture IndexedDB, analisi e ricontrolli con partite sintetiche/riproducibili.
2. Ridurre ricalcoli e salvataggi ridondanti, preservando checkpoint affidabili e cancellazione.
3. Valutare un primo passaggio preliminare chiaramente distinto dall'analisi definitiva, con benchmark di accuratezza prima di cambiare i preset.
4. Collaudare iPhone (memoria, sospensione, calore) e Windows. Definire obiettivi sulla baseline osservata, senza promettere un fattore di accelerazione non misurato.
