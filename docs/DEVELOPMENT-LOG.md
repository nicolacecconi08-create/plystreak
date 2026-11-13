# Registro sviluppo

## 2026-11-13 — Backup: preservare le statistiche

Base: esportazione 1.24.0 / Site 51, commit 92ecfd6.

Problema riprodotto nell'audit: il validatore ometteva metodo e aggregati dell'accuracy, facendo ricadere le statistiche sulla media delle mosse dopo un ripristino (fixture sintetica: 95 prima, 80 dopo).

Intervento locale: validazione esplicita e conservazione di accuracyMethod, gameAccuracy e performanceBasis; intestazioni ricostruite dal PGN; numero totale delle mosse ricavato dalla partita. Backup v1/v2 e record storici senza metadati continuano a essere supportati. Nessuna migrazione di dati esistenti.

Verifica completata: PASS per node test-backup-roundtrip.mjs, node test-review-resume.mjs, node test-puzzle-rating.mjs, node test-accuracy-metric.mjs e node test-overhaul.mjs; git diff --check senza errori. Il nuovo test copre v1/v2, statistiche, metodi misti, compatibilità legacy, ripristini ripetuti e 18 casi di metadati invalidi. Non è stata rieseguita la suite completa del motore: il motore non è modificato. Nessun deploy o aggiornamento dei pacchetti core nativi in questa fase. SHA256SUMS resta il manifesto storico dell'esportazione, non della copia in sviluppo.

## Priorità registrata — Prestazioni Chess.com

L'utente segnala almeno 90 minuti per importazione e analisi; misura riferita dall'utente, non ancora riprodotta con un benchmark. Prima di modificare questo flusso misurare separatamente download, parsing/deduplicazione, salvataggi e tempo Stockfish, con numero di partite/mosse e dispositivo. Confrontare importazione iniziale e aggiornamento incrementale; evitare rianalisi dei dati già validi. Rendere i primi risultati disponibili progressivamente, con avanzamento e cancellazione affidabili. Definire obiettivi misurabili sulla baseline senza ridurre silenziosamente l'accuratezza o assegnare giudizi definitivi ad analisi preliminari.

Questo lavoro segue la correzione P0 del backup e precede l'espansione dell'integrazione con avatar, filtri e account. Le modifiche architetturali invasive, i servizi a pagamento e la pubblicazione richiedono l'approvazione prevista dal master prompt.

## 2026-11-13 — Installazione e primo intervento sui tempi Chess.com

Backup pubblicato su Sites 52 (deploy succeeded). Aggiunti manifest, icone, pagina di installazione e cache offline delle risorse locali; gestione dei redirect .html del provider, nessuna cache delle API remote, aggiornamenti senza reload forzato. Il generatore deve essere eseguito dopo ogni modifica runtime.

Collegamento Chess.com separato dall’analisi approfondita automatica. Importazione con durata osservata e pulsante di aggiornamento separato; qualità Stockfish invariata. Non dimostrata una riduzione del tempo totale del motore.

Preparata shell Windows Electron 45.3.2, checksum ufficiale verificato, renderer isolato e test dei percorsi. Pacchetto preview non firmato; UI non osservabile nell’ambiente, quindi QA desktop non conclusa. Web app iPhone da verificare su dispositivo fisico.

Verifica: 48 test Node PASS, zero fallimenti e timeout; successivo test offline PASS dopo correzione dei redirect e versione cache. git diff --check senza errori. Prossime priorità: benchmark e riduzione dei ricalcoli Chess.com, verifica delle sequenze problemi e layout mobile.
