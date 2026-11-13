# Correzioni nella sola copia esportata

Autorizzazione successiva: «eventuali errori correggili». Il sito e il runtime restano invariati; cinque test sono stati aggiornati in base ai contratti effettivi del codice, senza allentare i criteri di valutazione dell’app.

- test-coach.mjs: il fallback per un tema non valido è dark, come dichiarato in settings.defaults; il test pretendeva il vecchio system. Restano i controlli di sanitizzazione e del coach.
- test-v4.mjs: la fixture con sacrificio e valutazione successiva priva di profondità non prova un Geniale. Si verifica best, coerente con i criteri restrittivi; i test dedicati award-evidence/brilliant mantengono la copertura delle evidenze positive e negative.
- test-puzzles-v111.mjs: rimossa l’aspettativa di un intervallo Elo numerico per una funzione esplicitamente sospesa. Si controllano uncalibrated e assenza di low/high sia con buona sia con cattiva accuracy.
- test-engine-practice.mjs e test-engine-black-practice.mjs: per i problemi con linea esplicita si verifica la legalità dell’intera linea, la corrispondenza della prima mossa e il raggiungimento dell’obiettivo alla fine. Il sacrificio iniziale non è ancora matto: si controlla esplicitamente che il matto arrivi alla fine. Per i problemi a mossa singola restano i controlli meetsGoal originali. Il confronto effettivo con Stockfish resta attivo per entrambi i colori.

La prima esecuzione (39 PASS, 5 FAIL) è conservata in test-results-initial.json; il resoconto finale è in VERIFICATION.md. Nessuna correzione del codice applicativo era necessaria per questi cinque fallimenti. Ciò non certifica l’assenza di altri difetti nelle funzionalità.
