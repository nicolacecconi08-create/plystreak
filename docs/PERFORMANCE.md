# Prestazioni dell’analisi batch

## Intervento misurato — 14 novembre 2026

La qualità Stockfish non cambia: profondità massima 20 / 2200 ms per posizione, ricontrolli profondità 24 / 5000 ms per giudizi critici, stessa accuracy e classificazione. Il metodo rimane `plystreak-1.5-verified`.

Prima, ogni semimossa ricostruiva tutti i dettagli tattici precedenti tramite `analysisRecord`, poi `saveGame` rileggeva e riparsava l’intero PGN. Per N semimosse questo comportava N(N+1)/2 elaborazioni di dettagli, oltre al riepilogo finale, e N+1 parsing del PGN per i salvataggi.

Ora il batch costruisce il dettaglio della sola nuova semimossa; aggiorna accuracy e indicatori aggregati usando l’intera serie, e calcola il riepilogo completo finale con la funzione originale. Il salvataggio legge il record attuale, conserva i metadati aggiornati e scrive l’analisi senza riparsare il PGN. Non ricrea partite eliminate e rifiuta di scrivere su un PGN sostituito. Nessun salvataggio viene saltato: resta una transazione IndexedDB attesa per ogni semimossa completata, più il salvataggio finale. Le scansioni aggregate e la copia del checkpoint restano proporzionali alla lunghezza della partita; non si dichiara eliminato ogni costo quadratico.

I nuovi checkpoint includono metodo e lista delle posizioni e sono validati prima della ripresa. I vecchi checkpoint batch vengono riutilizzati solo se ogni risultato riporta la FEN attesa; in caso contrario l’analisi viene ricalcolata. Il metodo di analisi non cambia e le analisi complete restano valide. Il formato comune è anche riconoscibile dal validatore dei backup.

## Misure riproducibili

Comando: `node test-batch-performance.mjs`, Node 24.22.1, Windows.
Fixture sintetica di 20 semimosse, 10 ripetizioni, motore simulato e nessuna misura IndexedDB/browser:

| Segmento | Tempo osservato |
| --- | ---: |
| Riepiloghi ripetuti col percorso precedente | 2548,97 ms |
| Riepiloghi incrementali nuovi | 259,44 ms |
| Intera analisi nuova con motore simulato | 820,37 ms |

La misura riguarda il costo JavaScript dei riepiloghi e varia col dispositivo/JIT; non è una misura di accelerazione dell’analisi Stockfish, dell’importazione di rete o di una sessione reale di 30 partite. I test confrontano tutti i riepiloghi parziali e quello finale con `analysisRecord`, verificano una persistenza per semimossa, ripresa senza ricalcoli inutili, checkpoint di altra partita, interruzione, errore di salvataggio, conservazione metadati e protezione da eliminazione/sostituzione.

Ulteriori regressioni eseguite: `node test-review-resume.mjs`, `node test-accuracy-metric.mjs`, `node test-award-evidence.mjs`, `node test-v5.mjs`: PASS.

## Perché 30 partite possono richiedere 90 minuti

Esempio di budget, non benchmark: 30 partite di 80 semimosse richiedono fino a 81 posizioni ciascuna. A 2,2 secondi per ricerca, 30 × 81 × 2,2 = 5346 secondi, cioè **89,1 minuti**, prima dei ricontrolli e degli altri costi. Un giudizio critico può aggiungere due ricerche da 5 secondi. Il motore può fermarsi prima per profondità raggiunta, riusare la cache o gestire terminali senza ricerca: la durata reale non è garantita da questa formula.

Questo intervento riduce lavoro evitabile senza ridurre il budget del motore; non promette di trasformare 90 minuti in pochi minuti. Per misurare il carico reale, `runBatch` e `analyzeRecord` accettano `onTiming(event)`: fasi `resume`, `engine-and-grade`, `summary`, `checkpoint`, `complete`, con tempi in millisecondi e avanzamento numerico. Nessun PGN, FEN, nome utente o dato di account è incluso; nessun dato viene inviato all’esterno. La callback è facoltativa e un suo errore non interrompe l’analisi. `engine-and-grade` include cache/attese motore e ricontrolli, non è tempo CPU puro. Non sono ancora misurati i tempi su iPhone/iPad fisici o una sessione reale Chess.com completa.
