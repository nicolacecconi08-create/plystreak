# Aggiornamenti Windows — preview 0.2.0

La preview Windows 0.2.0 include il core 1.24.1. Da Impostazioni → App per PC è possibile controllare e scaricare gli aggiornamenti del sito/applicazione, poi riavviare per applicarli. Il download non sostituisce i file utilizzati dalla sessione corrente. Concludere o salvare la partita prima del riavvio. Non è un controllo automatico in background.

Chi usa la preview 0.1.0 deve scaricare una volta il nuovo ZIP, estrarlo e aprire Plystreak.exe dalla nuova cartella. La 0.1.0 non contiene il meccanismo necessario per aggiornarsi da sola. Il nome applicazione, package e origine `plystreak://app` restano invariati: entrambe le preview usano lo stesso profilo Electron. Non cancellare il profilo e non aprire le due versioni contemporaneamente. Un backup da Progressi rimane consigliato; la verifica automatica usa esclusivamente dati sintetici.

## Canale e verifiche

- Manifest: `https://linea-chess-review.svole-scuole.chatgpt.site/desktop-updates/manifest.json`.
- Pacchetti completi JSON gzip sotto `/desktop-updates/`, distinti dagli archivi storici `/updates/`, che appartengono alla precedente shell non inclusa nell'esportazione.
- HTTPS verso la sola origine ufficiale, redirect rifiutati, limiti di download/espansione, controllo versione minima della shell, dimensione e SHA-256, validazione dei percorsi e dei file necessari. Il checksum protegge l'integrità del trasferimento; non è una firma indipendente dal server.
- I file vengono preparati in una cartella temporanea e attivati al riavvio. Un registro append-only conserva lo stato senza sovrascrivere il precedente. Partite e preferenze non vengono spostate o eliminate.
- Alla prima apertura del core aggiornato servono il caricamento della pagina, la conferma della shell e cinque secondi senza errori di avvio segnalati dal renderer. Se l'app si chiude prima della conferma, al prossimo avvio torna al core precedente (o a quello incluso). Il controllo non certifica tutte le funzioni e non annulla migrazioni dei dati. Per questo gli aggiornamenti devono mantenere compatibilità con i dati esistenti.
- Le versioni scaricate e i registri restano in `userData/core-updates`; non viene effettuata pulizia automatica delle versioni precedenti.

Gli aggiornamenti del core non aggiornano Electron, il preload o l'eseguibile nativo: per modifiche della shell e aggiornamenti di sicurezza Electron occorre un nuovo pacchetto. La preview x64 non è firmata e non è un installer/MSIX. Nessuna sincronizzazione account viene aggiunta.

## Riproduzione

```powershell
node native/windows/test-updater.cjs
node scripts/build-desktop-update.mjs
powershell -File native/windows/build.ps1 -OutputDirectory C:\percorso\nuovo-build -ElectronArchive C:\percorso\electron.zip
```

Il builder legge `native/windows/core-version.json`, ordina i file in modo deterministico, esclude worker offline e pacchetti di aggiornamento e valida il risultato con lo stesso lettore dell'app. Genera manifest e `.json.gz` in `dist/desktop-updates`. Il gzip non è tracciato in Git: va rigenerato e incluso nell'archivio di pubblicazione; verificare dimensione e hash contro il manifest dopo il deploy. Usare la stessa versione di Node/zlib per riprodurre byte identici. Incrementare la versione per ogni nuovo core pubblicato; non sostituire il contenuto di una versione già distribuita.

Il builder Windows controlla l'archivio Electron contro gli SHA256 ufficiali anche quando viene fornito un file già scaricato. Il pacchetto conserva licenze Electron/Chromium, licenza del progetto e attribuzioni. Non include fixture, backup utente o gli archivi di aggiornamento.

## Verifica e limiti

Test Node: manifest e origine, download limitato, checksum, percorsi ostili, preparazione senza cambiare il core in uso, attivazione, persistenza della conferma, rollback, versione minima della shell e conservazione dati sintetici. La prova non sostituisce una sessione su Windows con aggiornamento remoto reale, né verifica SmartScreen, antivirus o account Windows differenti. Il canale sarà disponibile soltanto quando manifest e gzip saranno stati pubblicati e verificati.
