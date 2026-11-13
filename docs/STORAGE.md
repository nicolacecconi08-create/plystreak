# Dati e migrazione

IndexedDB `plystreak-records`, versione 1: object store `games`, `attempts`, `meta`, chiave `id`. Contiene partite PGN, analisi/checkpoint, tentativi e metadati di progresso/profilo. Nessun database server o account di sincronizzazione è incluso.

localStorage conserva `plystreak-settings` (preferenze), `plystreak-training` (sessione coach), `plystreak-chess-user` (profilo pubblico), `plystreak-review-import`, `plystreak-review-id`, `plystreak-review-side` (passaggio alla revisione), `plystreak-live-v1` (partita live/orologio). Lo snapshot live viene duplicato nello store meta; i PGN vengono archiviati anche come games. Altre chiavi ausiliarie sono definite nei moduli runtime: non considerare questa lista un formato universale di esportazione.

## Backup supportato
1. Sul dispositivo e sull’origine originali aprire Progressi → Partite → Esporta backup JSON.
2. Conservare il JSON privatamente, fuori dal repository; contiene informazioni delle partite e del profilo.
3. Avviare l’app sulla nuova origine e usare l’importazione/ripristino del backup in Progressi.
4. Verificare partite, progressi, impostazioni e analisi prima di abbandonare l’origine precedente. Eseguire la procedura per ogni dispositivo che conserva dati distinti.

Il formato `plystreak-backup` v2 contiene games, attempts, settings e meta; v1 è ancora accettato. L’import valida PGN, dettagli delle analisi e checkpoint, e non sovrascrive record con ID già presenti. Il limite dell’interfaccia di import è 50 MB. Le preferenze possono essere ripristinate con l’opzione dedicata.

## Limiti verificati nel codice
Il ripristino conserva `accuracyMethod`, gli aggregati `gameAccuracy` e i contatori `performanceBasis` quando presenti e validi. Non converte il metodo di accuracy durante l'importazione. I backup precedenti privi di questi campi restano leggibili con il comportamento storico; informazioni già eliminate da vecchi ripristini non possono essere ricostruite automaticamente. Metadati presenti ma non validi vengono rifiutati prima dell'importazione. Le intestazioni della partita vengono ricavate dal PGN validato.

La validazione conserva solo campi riconosciuti: il backup non equivale a una clonazione byte per byte di IndexedDB/localStorage. validateMeta accetta profilo Chess.com, batch, report e obiettivi settimanali; non ripristina lo snapshot live/orologio. La sessione corrente coach e le chiavi temporanee localStorage non sono tutte nel backup. Alcuni dettagli diagnostici delle analisi sono normalizzati o omessi. Terminare/esportare in PGN le partite in corso prima della migrazione; non promettere la ripresa esatta di un orologio o di una sessione coach su un’altra origine.

Per conservazione forense completa servirebbe un’esportazione esplicita di tutti gli store e delle chiavi dal dispositivo originario, non presente come funzione completa verificata. Non è stata eseguita in questa esportazione e nessun dato utente è stato letto, modificato o incluso.

Non usare cancellazione dati browser, modalità privata o cambio porta come procedura di migrazione. Nessun account GitHub/Codex può recuperare automaticamente i dati locali di un altro dispositivo.
