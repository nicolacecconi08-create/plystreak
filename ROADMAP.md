## 1.16.0 — Overhaul ametista e affidabilità

- Sette sezioni aggiornate: layout compatto, introduzioni rimosse, navigazione attiva, safe area, temi ametista/lavanda, contorni pezzi e coach setup compatto. Rimossa realmente la card Momenti su cui lavorare.
- Frecce manuali indipendenti dal motore: tasto destro/drag, modalità touch esplicita e due tocchi, più frecce, toggle/clear, rotazione, reset al cambio posizione.
- Materiale dal vivo: catture per colore e vantaggio netto, incluse promozioni e presa al passo, derivato dalla posizione corrente.
- Accuracy: formula e aggregazione Lichess, metodo versionato e conservato nell’archivio; confronti separati per metodo. Stima Elo arbitraria sospesa; modello empirico ancora da realizzare, componente visibile.
- Geniali: il recupero tardivo del materiale non esclude più un sacrificio; PV interamente legale e affidabilità richieste.
- Verifiche: test-overhaul, accuracy-metric, performance-v1131, evidence-v1151, brilliant-v1121, brilliant-engine (Stockfish reale), live, review-practice-v195, review-resume, opening-study, navigation, draw-animation, rapid-analysis. Browser: annotazione a due tocchi, rotazione, analisi PGN matto rapido/ripresa/saliente, cattura dal vivo +1; sezioni a 390 px senza overflow e analisi a 820 px affiancata. Nessun test su hardware iOS o drag fisico touch.
- Core PC 1.16.0: esportazione nativa preservata, pacchetto con checksum. Nessuna migrazione distruttiva dei dati.
- Priorità residue dettagliate in PRIORITIES-RECOVERED.md. Overhaul consegnato come base condivisa; ulteriori raffinazioni e QA hardware restano aperti.

## 1.15.1 — Affidabilità dei giudizi e delle varianti

- Geniale: il sacrificio deve restare tale lungo tutta la PV legale fornita, non soltanto dopo la prima ricattura. Recuperi tardivi e code illegali impediscono il premio.
- Geniale/Grande mossa e differenze numeriche: esclusi risultati esplicitamente inaffidabili, bound, punteggi discordanti tra risultato e prima linea; profondità coerenti richieste.
- Ripresa: i flag di affidabilità sopravvivono al checkpoint e i premi speciali vengono ricontrollati senza scartare le mosse già analizzate.
- Spiegazioni: bilancio materiale delle varianti include promozioni e sottopromozioni; corretto accordo grammaticale delle inchiodature.
- Test: evidence-v1151, brilliant-v1121, brilliant-engine (Stockfish reale), review-practice-v195, review-resume, opening-study, explanations, line-story, performance-v1131, live. Tutti passati.
- Audit: confronto dalla stessa posizione, lezione apertura/ECO e trasposizioni già presenti; layout spiegazioni adiacenti mantenuto. Nessuna modifica visuale o verifica nuova su dispositivi fisici.
- Account/sync ancora bloccati dalla mancanza di progetto Supabase/Firebase configurato (vedi AUTH-PLAN.md); nessun login fittizio aggiunto. PC core aggiornato con app.js e integrazioni native preservati.

## 1.15.0 — Gioco dal vivo

Implementato gioco locale per due persone: tempi predefiniti/personalizzati con incremento, pausa concordata, salvataggio e ripresa, mosse legali, promozione, arrocco e presa al passo; matto/stallo/materiale, patte reclamabili e automatiche, offerta di patta e abbandono. Rotazione, cronologia, PGN, rivincita a colori invertiti e revisione diretta con archivio source=live. Orologi basati sul tempo trascorso anche in background. Nessun suggerimento durante il gioco.

Verifica: test-live, test-draw-animation, test-navigation, test-review-resume, test-rapid-analysis. Browser: avvio, mosse, offerta di patta, pausa, reload con ripresa, conclusione e importazione in Analisi. Limiti: stessa macchina, dati locali; posizioni morte rare non riconosciute dal solo controllo materiale richiedono accordo; nessuna certificazione arbitrale. Browser desktop verificato; dispositivi fisici iOS/iPad non disponibili. Pacchetto PC aggiornato preservando i file nativi non modificati.

## 1.14.2 — Animazione patta
- Bagliore dorato neutro per 1,1 secondi sulla scacchiera e sui due re, senza cambiare pezzi o posizione e senza stile persistente.
- Motore di animazione condiviso da Analisi/coach/miniscacchiere; in Analisi cronologia memoizzata per riconoscere ripetizioni e risultato PGN alla posizione finale. Il matto ha precedenza.
- Non riparte a ogni render; si annulla cambiando posizione, rispetta riduzione movimento e animazioni off, viene rinviata all'arrivo durante scorrimento rapido.
- Test draw-animation, rapid-analysis, review-resume passati: stallo, materiale insufficiente, ripetizione, entrambi i re, lifecycle e accessibilità. Nessuna prova visiva su dispositivi fisici.
- PC core 1.14.2, export nativo conservato.

## 1.14.1 — Scorrimento saliente e ottimizzazioni
- Prossima mossa saliente riproduce tutte le semimosse intermedie, 45–110 ms ciascuna, con animazione pezzi accelerata; spiegazioni e frecce complete solo all'arrivo.
- Annullamento con altri comandi, tastiera o scheda nascosta; nessuna sovrascrittura tardiva della posizione. Riduzione movimento/animazioni off: salto immediato. Celebrazione solo all'arrivo.
- Analisi: cronologia scacchistica incrementale anziché ricostruzione dal principio a ogni valutazione, preservando ripetizione e regola 50 mosse. Cache anche dei ricontrolli profondi con chiavi distinte per posizione, qualità, searchmoves, livello e limiti. Nessuna riduzione di profondità o tempo motore.
- Test rapid-analysis, resume, key-moments, Brilliant, review-practice passati; Stockfish reale mantiene sacrificio di donna verificato e non assegna Geniale al matto ordinario.
- Browser: osservata mossa 1 Nero durante lo scorrimento, arrivo su 2 Bianco con spiegazione Grave errore. Nessuna misura comparativa su dispositivi fisici; guadagno dipende da partita e cache.
- PC core 1.14.1 con export nativo preservato.

## 1.14.0 — Ripresa, salvataggio e progressi
- Analisi salvata in IndexedDB dopo ogni mossa completata, inclusi risultati motore e giudizi verificati. Pulsante Riprendi analisi distinto dal ricalcolo completo, Riapri ultima analisi salvata; apertura da archivio recupera checkpoint coerenti col PGN.
- Checkpoint versionati e validati alla lettura: nessun salto oltre giudizi mancanti, varianti illegali troncate. Backup conserva checkpoint; snapshot ottimizzato senza rigiocare tutte le varianti a ogni salvataggio.
- Richiesta persistenza browser quando supportata, feedback di salvataggio, errori/abort transazioni gestiti; nessuna promessa di cloud sync o protezione dalla cancellazione dati browser.
- Illuminazione di un secondo sulla destinazione di Geniale (turchese) e Grande mossa (blu), cancellazione su navigazione, nessuna modifica alla posizione o stile finale. Rispetta animazioni disattivate e riduzione movimento.
- Progressi: errori e svarioni per 100 mosse, confronto ultime 5 con precedenti 5, solo concluse/analizzate/colore noto/almeno 10 mosse fuori teoria. Avviso sul campione e difficoltà diverse.
- Test: interruzione e ripresa senza ricalcoli, JSON/backup, checkpoint corrotti, errore salvataggio, ciclo animazioni, statistiche normalizzate; regressioni puzzle, rating, Elo prudente, mosse salienti, Brilliant.
- Browser: recuperate 12/17 mosse dopo reload, interruzione manuale e nuova ripresa; grande mossa selezionata con pezzo preservato. Animazioni verificate con test del ciclo, non con misurazione visiva su dispositivo fisico.
- PC core 1.14.0 conserva export PGN nativo. Le vecchie analisi senza checkpoint richiedono un nuovo calcolo per abilitare la ripresa persistente.

## 1.13.1 — Navigazione saliente e stima Elo prudente
- Pulsante primario Prossima mossa saliente, descrizione del prossimo evento, 44px e ordine esplicito su layout mobile (prima mancava e il controllo poteva separarsi dalla navigazione).
- Stima performance: minimo 20 scelte non obbligate fuori teoria, cp iniziale entro 600, nessun matto, profondità prima/dopo >=18 e differenza <=2, no bound. Risultati mancanti/invalidi esclusi.
- Scala cubica prudente con penalità di perdita media, errori e svarioni; limiti superiori espliciti 2200, 1900 su campione sotto 30, 1600 per uno svarione, 1300 per almeno due. Anche gli errori che entrano in matto contano. Non è un modello calibrato su rating reali.
- Test regressione performance (90%, campioni corti, mosse obbligate, profondità discordanti, errori fuori campione), navigazione saliente, puzzle, rating, review e Brilliant passati.
- Browser: salto al grave errore e poi al matto, fine navigazione disabilitata, partita corta senza stima. CSS responsive verificato nel codice; nessun test su dispositivo fisico.
- Core PC 1.13.1 aggiornato con sostituzioni mirate su app.js/index.html per preservare integrazioni native.

## 1.13.0 — Elo problemi e allenamento continuo
- Indice locale da 800 punti, difficoltà nominale, esito, errori, aiuti; bonus contenuti di velocità e streak. Non è Elo ufficiale o calibrato sulle partite.
- Timer di riflessione esclude motore e scheda nascosta, conserva tempo/errori al reset. Storico pregresso senza misure non rivalutato.
- Traguardi ogni 200 punti fino a 3000, record conservato, barra accessibile e indicatori adattivi.
- Stessa famiglia/speculare senza nuovi punti entro 24 ore; errori interrompono la serie anche nei ripassi.
- Coda rinnovata dopo ciascun problema, ripassi liberi quando non ci sono nuove posizioni, difficoltà graduale aggiornata; uscita dopo soluzione con riepilogo. Catalogo finito, allenamento senza limite.
- Dati di rating inclusi nei tentativi e nel backup validato; salvataggi falliti segnalati, navigazione bloccata finché il risultato non è salvato.
- Test: rating, velocità/errori/aiuti/streak, duplicati/famiglie, traguardi, backup roundtrip, 25 passi di coda continua; regressioni difficoltà, linee legali, review, Brilliant, coaching e catalogo.
- Browser: soluzione reale 800→817, problema successivo automatico, soluzione assistita 817→808, serie azzerata, uscita/riepilogo verificati. Nessuna prova su dispositivi fisici.
- Pacchetto PC 1.13.0, app.js nativo identico. Nessun nuovo installer.

# Aggiornamento 1.12.1 · 29 ottobre 2026

Audit priorità: classificazioni, confronto, aperture e integrità dei problemi.

Correzioni effettive:
- Falso Brilliant quando la perdita apparente viene recuperata con una cattura su un’altra casa nella mossa successiva della variante. Ora si riproduce legalmente anche quel passaggio e si riconta il materiale.
- Mosse obbligate escluse dai sacrifici classificabili come Geniali; una variante priva della continuazione legale non fornisce prova sufficiente.
- Geniale richiede entrambe le valutazioni a profondità almeno 18 e differenza di profondità non superiore a due. Incertezza nella verifica approfondita elimina l’etichetta invece di conservarla.
- Criteri aggiornati nel dialogo informativo; corretta la descrizione della persistenza locale dei dati.
- Pacchetto PC 1.12.1 aggiornato sui soli file condivisi modificati, preservando tutte le altre integrazioni native.

Test superati: nuovi casi di controcattura, scelta forzata, PV troncate/illegali, colori invertiti, profondità incompatibili, ricontrollo che invalida l’etichetta. Stockfish reale conferma che il sacrificio di donna con matto conserva Geniale, mentre un semplice matto di torre non lo riceve. Regressioni classificazioni, confronto dalla stessa posizione, aperture/trasposizioni/link alla lezione, spiegazioni, riepiloghi, prossima mossa importante, frecce, problemi e progressione.

Funzioni già presenti e preservate: Mostra la mossa migliore, navigazione della variante e ritorno alla partita; Teoria con nome/ECO e studio della posizione effettiva. Nessuna modifica del layout; nessuna nuova prova visiva su iPad/telefono in questa patch.

Account/sincronizzazione: resta il prerequisito esterno descritto in AUTH-PLAN.md; progetto statico senza configurazione Supabase/Firebase, nessun login simulato. Le analisi storiche non sono sovrascritte: usare Ripeti analisi per applicare i criteri aggiornati.

---

# Aggiornamento 1.12.0 · 29 ottobre 2026

Richiesta: difficoltà graduale dei problemi, inclusi pezzi distrattori.

- Tre livelli didattici dichiarati: Essenziale, Intermedio, Sfida. Non sono rating Elo calibrati.
- Percorso guidato predefinito: livello consigliato dal completamento senza aiuti di quattro famiglie diverse al livello precedente. Si considerano i tentativi più recenti per famiglia/livello; un errore può riportare un tema da consolidare. Il livello della coda viene aggiornato all’inizio di una nuova sessione. Copie speculari e ripetizioni dello stesso primo tentativo non aumentano il conteggio.
- Scelta manuale di ciascun livello o Tutti i livelli. Ripassi mantenuti, filtri tema/origine compatibili. Le posizioni personali sono etichettate intermedie indicative, non calibrate e non contano per il passaggio di livello.
- Otto varianti verificate: quattro intermedie con sei pezzi aggiuntivi e quattro Sfida con dieci; forchetta, inchiodatura, cattura favorevole, matto. Posizioni composte, non partite storiche. Soluzione originale conservata, linee legali e confronto Stockfish per ogni passaggio non forzato/non già matto. Negli scenari Sfida l’obiettivo testuale è meno esplicito.
- Catalogo: 28 posizioni di base/varianti, 56 contando i colori invertiti; una sola famiglia per sessione.

Test: progressione 1→2→3, aiuti esclusi, copie speculari e ripetizioni escluse dal conteggio, filtri e selezione manuale, priorità ripassi, legalità/dimensione dei nuovi scenari, verifiche Stockfish; regressioni catalogo, problemi, riepilogo, backup e intervalli. Browser: selezione Sfida + tema forchetta, pezzi aggiuntivi, soluzione completa in due mosse del giocatore, risposta automatica, spunta finale, nessun overflow orizzontale alla larghezza disponibile. Non ripetuti test fisici iPad/telefono.

Core PC aggiornato a 1.12.0. Nessuna modifica ad account, automazioni o dati esistenti.

---

# Aggiornamento 1.11.1 · 29 ottobre 2026

Audit delle priorità Game Review / problemi:
- Riepilogo: un errore decisivo determina l’obiettivo prima di piccole imprecisioni ripetute. Nessuna mossa corretta elencata come errore da rivedere; gestita la selezione di un colore senza mosse ancora analizzate.
- Spiegazioni: catture e ricatture sono riprodotte legalmente. Il saldo materiale distingue parità, guadagno e perdita; segnala ulteriori ricatture possibili e non confonde materiale con vantaggio posizionale. Nessuna notazione nelle nuove frasi. Le minacce immediate di matto vengono prima dei dettagli secondari.
- Problemi: una PV non valida o interrotta prima della risposta del giocatore non viene più troncata per dichiarare completata la soluzione. Resta possibile saltare il problema senza penalità.
- Aggiornamento del core PC 1.11.1, senza cambiare la shell nativa o i dati locali.

Test: bilancio scambi per entrambi i colori, ricatture ancora aperte, PV invalide, priorità del matto, riepilogo vuoto e senza errori, soluzioni incomplete; regressioni spiegazioni, classificazioni, prossima mossa importante, ripasso/backup, catalogo. Controllo Stockfish delle quattro nuove linee. Nessuna modifica al layout in questa patch; non ripetuta una prova visiva su dispositivi.

Restano prioritarie: spiegazioni posizionali più approfondite, qualità e ampiezza del catalogo, analisi confrontabili e classificazioni affidabili. La stima Elo della 1.11.0 resta euristica non calibrata.

---

# Aggiornamento 1.11.0 · 28 ottobre 2026

Implementato:
- Problemi a sequenza: linea principale, risposte automatiche, nessuna riuscita prima della fine; alternative indicate e confrontate dal motore dalla posizione corrente. Le linee sono esercizi su una difesa verificata, non una prova che tutte le altre mosse siano sbagliate.
- Spunta sulla scacchiera attenuata e Prossimo problema nel pannello. Ripeti, indizi e soluzione mostrata conservano il primo tentativo e gli intervalli di ripasso. Fallimenti del salvataggio segnalati senza annullare il risultato.
- Quattro nuovi scenari (20 originali / 40 con inversione colori): sacrificio sulla colonna, matto affogato, promozione, infilata. Tutte le mosse controllate con Stockfish e legalità; due combinazioni con matto in due. Una famiglia per sessione; rotazione dei nuovi esercizi a pari priorità.
- Stima Elo sperimentale della performance per colore: intervallo euristico, non calibrato su rating reali. Almeno 12 mosse utili, esclusione teoria, matto trovato, valutazioni estreme e profondità insufficienti. Nessuna equivalenza certificata con Chess.com/FIDE.
- Layout problemi responsive, configurazione richiudibile, dimensionamento sulla finestra, comandi touch, focus tastiera, pannello laterale iPad e sotto la scacchiera su telefono.

Verifiche: test sequenze e obiettivi, mate reali, nessuna riuscita anticipata, catalogo e simmetrie, ripasso e backup, valutazioni conservative, spiegazioni, frecce, navigazione. Browser: sequenza completa, risposta automatica, spunta, attenuazione e passaggio al successivo. Misure DOM a 390×844 e 820×1180 senza overflow orizzontale. Non eseguito test su dispositivi fisici; acquisizione screenshot browser non riuscita per timeout.

Restano aperti: ampliamento sostanziale del catalogo da partite reali, modelli Elo calibrati su dataset, ulteriori spiegazioni strategiche contestuali e sincronizzazione account. Le priorità precedenti restano valide.

---

# Plystreak — priorità e stato verificato

Aggiornato il 28 ottobre 2026, rilascio 1.10.0.

## Criterio deciso
Navigazione alla prossima mossa importante, Game Review e sistema dei problemi hanno pari priorità assoluta. Prima di aggiungere funzioni, riesaminare entrambe le aree e correggere i difetti rilevanti. Ordinare ogni lotto per affidabilità scacchistica, impatto sull’utente, dipendenze, costo e rischio; preservare dati e modifiche concorrenti.

## Lotto 1.10.0 — navigazione ai momenti importanti
- Pulsante «Prossima mossa importante» vicino ai controlli della scacchiera. Cerca dopo la mossa attuale nella partita originale, esce dalle varianti e torna alla revisione; non modifica PGN o dati.
- Rileva mosse già analizzate classificate geniali, grandi mosse, errori, gravi errori e occasioni mancate; nuovi doppi attacchi non inchiodati, inchiodature al re, perdita del diritto di arrocco, matto/stallo e risposta di matto legale. Mostra il motivo del salto e distingue fine dei risultati da analisi incompleta. Non pretende di riconoscere ogni svolta strategica.
- Dimensionamento scacchiera aggiornato per includere il nuovo comando.
- Spiegazioni: perdita del diritto di arrocco dopo movimento del re e conseguenza indiretta dello scambio di donne con ricattura del re in una linea verificata. Il testo distingue risposta obbligata da possibilità e non attribuisce automaticamente un vantaggio nel finale.
- Regressioni superate per Game Review, problemi e spiegazioni, più test dedicati alla navigazione e alle conseguenze indirette.

## Lotto 1.9.9 — colori delle frecce di cattura
- Rosso riservato alla cattura consigliata dalla prima linea del motore, dalla posizione visibile, con profondità almeno 16 e variante legale.
- Giallo per attacchi possibili, controllo delle caselle e catture legali non necessariamente consigliate.
- Alternative di cattura favorevoli mostrate in giallo con legenda distinta: solo linee MultiPV alla stessa profondità, vantaggio di almeno 50 centipawn dal lato che muove e perdita rispetto alla prima scelta tra 0 e 50. Non si confrontano matto e centipawn; nessuna promessa di esito certo. La copertura è limitata alle alternative effettivamente restituite dal motore.
- Test dedicati per prospettiva Bianco/Nero, profondità, bound, continuazioni illegali, mosse tranquille e vantaggi non confermati.

## Lotto 1.9.8 — revisione grafica di Ply
- Sostituito il cavallino cartoon con un emblema sobrio da scacchi. Eliminati volto espressivo, accessori e animazione di saluto, come richiesto.

## Lotto 1.9.7 — frecce nell’analisi e mascotte
- Freccia verde per la migliore dalla posizione visibile, solo con analisi disponibile; nel confronto delle alternative si parte dalla stessa posizione iniziale.
- Frecce per gli attacchi del pezzo appena mosso o selezionato, catture legali immediate e, su richiesta, controllo delle caselle vuote. Turno, inchiodature, ostacoli ed en passant sono verificati; nessuna promessa di guadagno materiale.
- Modalità migliore + attacchi, solo migliore, solo attacchi o nessuna; preferenza salvata. Frecce responsive, ruotabili e senza intercettare i tocchi.

- Mascotte originale Ply: cavallino vettoriale nel marchio di tutte le pagine e nelle impostazioni, con movimento disattivabile e rispetto delle preferenze di accessibilità.

## Lotto 1.9.6 completato
- Problemi: filtro per tema e alternanza dei temi tra le nuove posizioni; i ripassi dovuti conservano la precedenza.
- Catalogo: 32 configurazioni legali, composte dai 16 scenari originali e dalle loro 16 versioni a colori invertiti, esplicitamente indicate. Verifica del motore anche dal lato del Nero.
- Game Review: osservazioni concrete su difese abbandonate, pedoni passati, colonne libere per le torri e diagonali aperte per gli alfieri. I fatti geometrici non vengono presentati come vantaggi certi; promozioni e catture avversarie sono controllate.
- Avvio sessione disabilitato fino al caricamento dei dati, con feedback quando nessuna posizione corrisponde ai filtri.
- Verifiche: regressioni del progetto, legalità e obiettivi di tutte le 32 configurazioni, quattro casi dal lato del Nero con Stockfish, interazione browser sul filtro e sul matto del Nero.

## Lotto 1.9.5 completato
- Game Review e motore condiviso: scartate alternative MultiPV di profondità diversa dalla prima scelta, punteggi limitati (bound) e duplicati della prima mossa. “Grande mossa” richiede alternative alla stessa profondità, almeno 16, senza confrontare matto e centipawn.
- Motore: riusa anche risultati entrati in cache mentre un’identica richiesta attendeva in coda.
- Problemi: confronto tra migliore e risposta del giocatore dalla stessa posizione iniziale, con ricerca vincolata alla mossa effettiva e verifica più profonda quando necessaria. La probabilità satura non basta a far accettare una perdita importante; matto e punteggi ordinari sono distinti.
- Problemi: incertezza, ricerca troppo superficiale o linea non corrispondente alla risposta non registrano un errore. Conservati primo tentativo, aiuti e intervalli di ripasso.
- Soluzioni degli esercizi sulla scacchiera, con sequenza legale, commenti, avanti/indietro e ritorno al problema. La soluzione del catalogo viene verificata prima di mostrarla, anche se una nuova ricerca preferisce un’altra mossa.

## Priorità aggiornate dall’utente
| Priorità | Area | Prossimo lavoro |
| --- | --- | --- |
| Massima assoluta | Prossima mossa importante | Pulsante implementato in 1.10.0; ampliare con evidenza verificata il riconoscimento delle svolte strategiche. |
| Massima assoluta | Game Review | Correttezza di classificazioni e accuracy, regressioni, chiarezza e visibilità delle spiegazioni. |
| Massima assoluta | Problemi | Audit delle risposte; varietà verificata e copertura degli errori ricorrenti; valutare esercizi con più risposte accettando alternative valide. |
| Alta | Spiegazioni | Conseguenze indirette, attività e controllo delle case, struttura pedonale, sicurezza del re; spiegare chi beneficia degli scambi senza ridurre tutto al materiale. |
| Alta | Approfondimenti | Varianti legali, risposte avversarie, conseguenze tattiche e strategiche, opportunità future e cambiamenti affidabili della valutazione. Distinguere possibilità da necessità. |
| Successiva | Infrastruttura | Prestazioni su dispositivi reali, analisi selettiva, finali e tablebase da valutare. |
| Successiva | Archivio e PGN | Integrità e recupero; sincronizzazione subordinata a servizio esterno reale. |
| Successiva | Gioco dal vivo | Prima regole, rotazione, cronologia e revisione; poi orologi, ripresa, rivincita e patta/annullamento. |

Le tre nuove priorità provengono dall’ultimo messaggio esplicito dell’utente. Il completamento del pulsante non equivale al completamento di tutti i miglioramenti delle spiegazioni.

## Vincoli e blocchi
- Login e sincronizzazione reali restano bloccati dalla configurazione di un servizio esterno: vedere AUTH-PLAN.md. Nessuna autenticazione fittizia.
- In questa sessione il recupero della conversazione aggiuntiva sulle priorità non era disponibile. Questo elenco usa le decisioni presenti nel contesto e nell’incarico salvato; non attribuisce approvazioni a dettagli non recuperati.
- Test browser su formati responsive non equivalgono a prove su iPad/iPhone fisici.
