# 1.23.1 — Categorie a destra della scacchiera
Richiesta: categorie non visibili sul telefono, collocarle a destra della scacchiera.
- Griglia mobile con colonna dedicata da 68px per Spiega, Mosse, Dati, Frecce e Varianti. Pulsanti 44px, stato attivo evidenziato.
- Larghezza scacchiera calcolata riservando la colonna categorie. Navigazione mosse e pannello contenuti restano sotto; nessuna modifica al motore o ai dati.
- QA Chrome simulato: 390x844, scacchiera quadrata 253px, menu a destra (x312 contro bordo scacchiera x306); body senza overflow verticale. 320x667: client/scroll 320x667, tutti i pulsanti 44px, menu interamente visibile. Cambio categoria Dati verificato.
- PASS test-board-geometry, test-navigation, test-review-resume, test-overhaul.
- Screenshot qa-side-1.23.1.jpg. Nessuna verifica Safari/iPhone fisico; non è stata riprodotta la causa specifica della segnalazione sul dispositivo dell'utente.
- PC core aggiornato, export nativo preservato. Checksum nel manifest.
