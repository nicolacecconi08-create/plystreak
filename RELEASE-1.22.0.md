# Plystreak 1.22.0 — Navigazione e importazione

- Schermata di importazione dedicata, senza scacchiera vuota o comandi di revisione prima del caricamento. Accessi ad archivio, Chess.com e coach; ripresa dell'analisi conservata.
- Progressi divisi in Andamento, Partite e Chess.com, con collegamenti diretti tramite hash.
- Note statiche secondarie raccolte in Informazioni utili; feedback e avvisi dinamici restano visibili. Legenda frecce e dettaglio prestazione espandibili.
- Form Dal vivo a due colonne adattive, configurazione Esercizi riordinata, traguardi espandibili, impostazioni con titoli più diretti. Tipografia e identità esistenti preservate.
- Nuovi testi tradotti nelle cinque lingue; nessuna modifica alle valutazioni del motore o al modello Elo.

## Verifiche
PASS test-navigation, test-overhaul, test-board-geometry, test-languages, test-review-resume; syntax shell.js e workspace-ux.js.
QA Chrome: importazione PGN breve → revisione → reset; archivio e sezione Chess.com; assenza overflow orizzontale import mobile (375px), live mobile (390px), esercizi tablet (805px). Screenshot qa-import-1.22.jpg. Nessuna verifica hardware iOS; non dichiarata chiusa.
Una prima invocazione usava un nome test inesistente (test-resume.mjs): corretta con test-review-resume.mjs, passato.
PC core 150 file, 3,059,641 byte, SHA256 8eab7b0a42a8f0f59809ee1e4262f308ceb4b4fe10339d6be07a41780cef5bcf. Export nativo preservato.

## Limiti
Revisione visiva dei percorsi modificati; non copertura esaustiva di ogni stato possibile di tutte le sezioni. Restano le priorità funzionali già documentate, Elo empirico non validato e QA Safari/iOS fisico.
