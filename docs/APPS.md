# App Windows e iPhone

## Web app installabile

Aprire install.html dal collegamento in fondo alle pagine. Su iPhone: Safari → Condividi → Aggiungi alla schermata Home → Apri come app web, se disponibile. Non richiede Apple Developer. Non è una build App Store.

Il service worker scarica le risorse runtime locali, incluso Stockfish WASM, escludendo gli archivi storici dist/updates. Il primo download richiede Internet; la pagina installazione mostra lo stato. Non vengono memorizzate risposte Chess.com o dati di altri servizi nella cache. IndexedDB rimane separato dalla cache degli asset.

Dopo ogni modifica runtime eseguire `node scripts/build-offline.mjs` PRIMA del pacchetto e del deploy: genera la versione della cache dagli hash dei file. Il worker non forza reload o skipWaiting; gli aggiornamenti entrano in uso dopo la chiusura delle vecchie finestre. Lo spazio può essere recuperato dal sistema operativo: offline non significa conservazione garantita dei dati.

## Windows x64, preview 0.1.0

Shell Electron 45.3.2 con renderer isolato, sandbox e Node disabilitato nel renderer. Protocollo locale plystreak://app con controllo dei percorsi e MIME WASM. Nessuna disattivazione di webSecurity. Le pagine e il motore sono inclusi nel pacchetto, mentre Chess.com richiede Internet. Non implementa il precedente bridge di aggiornamento core: gli aggiornamenti della preview sono pacchetti completi manuali.

Preparazione riproducibile da PowerShell:

```powershell
./native/windows/build.ps1 -OutputDirectory 'C:/percorso/nuova-cartella'
```

Il comando scarica Electron dal repository ufficiale e verifica SHASUMS256 prima dell'estrazione. La cartella di destinazione deve essere nuova. Per riutilizzare il download verificato si può fornire -ElectronArchive con il percorso dello ZIP; viene comunque ricontrollato con il checksum ufficiale. Non richiede npm e non installa componenti di sistema.

Avviare Plystreak-Windows/Plystreak.exe, mantenendo accanto tutti gli altri file. La preview non è firmata e non è un installer. Il processo è stato avviato nell'ambiente di sviluppo, ma la finestra non era esposta allo strumento di controllo: QA visuale, motore nella shell, import/export e riavvio con dati persistenti restano da completare prima di una release stabile. I test Node del routing non sostituiscono questa verifica.

L'origine dell'app è diversa dal sito: esportare un backup dal sito e importarlo nell'app. Non cancellare i dati originali prima del controllo. Le licenze e i sorgenti corrispondenti Stockfish richiedono la verifica distributiva già indicata in THIRD_PARTY_NOTICES prima di una distribuzione pubblica.

## iOS nativo, fase successiva

Capacitor è l'architettura candidata per un eventuale percorso nativo, ma non è ancora stato creato un progetto Xcode. Per il momento il percorso concordato è la web app. Firma, provisioning, Mac/Xcode e futura iscrizione Apple Developer rimangono dipendenze esterne. Nessuna promessa di approvazione App Store o di aggiornamento automatico del codice nativo tramite il sito.
