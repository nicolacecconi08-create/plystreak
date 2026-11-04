# 1.16.1 — Geometria della scacchiera

- Griglia esplicita 8×8, tracce minmax(0,1fr), celle senza dimensioni minime intrinseche, padding o interspazi.
- Altezza sincronizzata alla larghezza finale dopo il layout flex tramite ResizeObserver condiviso da Analisi e mini-board. Un solo osservatore per elemento, nessuna scrittura ripetuta a dimensione invariata; elementi nascosti gestiti alla riapertura.
- Coordinate fuori dalle caselle con gutter riservato; rotazione e impostazione per nasconderle conservate. Nessuna modifica al riuso delle immagini dei pezzi.
- Menu mobile: etichetta compatta «Opzioni», nome accessibile completo; safe-area superiore additiva.
- Pacchetto PC 1.16.1 con 136 file e integrazione nativa di esportazione preservata.

## Verifiche

PASS: test-board-geometry, test-overhaul, test-review-resume, test-draw-animation, test-navigation, test-opening-study, test-live, test-review-practice-v195; controlli sintassi JS modificati.
Browser Chrome, viewport simulati tramite iframe: telefono 390×844 (area contenuti 375px), tablet 820×900 (805px), desktop 1440×1000. Analisi: scacchiera rispettivamente 308×308, 355×355, 551×551; 64 celle quadrate, errore dimensionale 0, nessun overflow orizzontale. Toolbar sotto il bordo inferiore e visibile nelle altezze provate. Rotazione h1 in alto a sinistra, coordinate invertite; freccia manuale tra due case coerente con la rotazione. Fixture mini-board con posizione completa e senza pezzi: 64 celle e allineamento continuo verificati.

Limiti: nessun dispositivo fisico iPhone/iPad né Safari disponibile. La sovrapposizione della barra di sistema nello screenshot va ricontrollata nel contenitore iOS reale: le barre native di ChatGPT non sono controllabili dal CSS del Site. I font nuovi e le frecce automatiche in Aperture rimangono interventi separati aperti. Non dichiarare terminato l'overhaul complessivo.

Fixture riproducibile: copiare temporaneamente qa/board-fixture.html in dist/qa-board-fixture.html e aprirla nel preview; non distribuirla in produzione.
