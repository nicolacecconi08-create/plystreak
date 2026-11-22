# Revisione UI e analisi — 22 novembre 2026

Nuova UI desktop/mobile, colori valutazioni, frecce cancellabili con clic su casa vuota, traduzioni e spiegazioni strategiche contestuali.
Ai-Guess-the-Elo eseguito sul dispositivo tramite ONNX Runtime Web, senza rating dei giocatori: stima sperimentale su scala Lichess. Modello e licenze in dist/vendor/elo. Origine: https://github.com/HliasOuzounis/Ai-Guess-the-elo ; port ONNX: https://github.com/imnathaniel28/whats-the-ELO (10aacc0efe9421d7de8a6d687fb04f004b770110).

Verifica: suite di 54 test passata il 17 novembre; il 22 novembre rieseguiti con successo lingue, modello reale Stockfish/ONNX e offline. Parità numerica Python/JavaScript < 1e-5. Nessuna nuova validazione statistica indipendente; i risultati statistici riportati sono degli autori. Test su iPhone fisico ancora da svolgere.

Preferenza permanente: commit/push GitHub e pubblicazione sul Site esistente dopo controlli pertinenti. Automazione delle 03:00 disattivata.
