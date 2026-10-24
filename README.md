# Linea
Browser-local PGN review with Stockfish.js 19.0.1 Lite single-threaded WASM, chess.js 1.4.0, Chessnut piece PNGs rendered from original SVGs, Lichess Green board and Lichess CC0 openings.

Static site: dist/. No external analysis API or account is needed. Stockfish is a worker on the same origin; serve .wasm with application/wasm MIME type. Google Fonts is optional; system fonts work offline.

Analysis: independent accuracy formula and heuristic move classifications, documented in the method dialog. Not Chess.com CAPS2. Local branches preserve the original game and can be exported to individual PGNs. Session data is in memory only.

Checks: node test.mjs. Browser QA covered a complete 17-ply game, mate, both colors in a branch, castling, additional branch creation, original restoration, and 390px/820px responsive layouts. Node tests cover legal PGN parsing, invalid PGN rejection, en passant, underpromotion and evaluation sign.

Licenses: Stockfish GPLv3 (dist/vendor/stockfish-LICENSE), chess.js BSD-2-Clause (dist/vendor/chess-LICENSE), Chessnut Apache-2.0 (dist/pieces/LICENSE.txt), board AGPLv3+ (dist/vendor/lichess-COPYING.md), opening data CC0. Third party source URLs are in the visible method dialog. Original application code is provided under AGPLv3 or later. Original SVG source and PNG derivatives are both included.

Move explanations: position-specific legal-move facts, opening name, engine score comparison, material/center counts, best and reply PVs with direct branch exploration. Claims are derived locally from chess.js and Stockfish output, not an external text model. Move classification symbols are original SVG path assets in dist/icons, consistently rendered in list, legend, detail and board overlay.

## Coach and preferences
coach.html offers five Stockfish Skill Level presets (0, 3, 8, 14, 20) with bounded searches, human color selection, hints in three stages, four-step move explanations, undo, PGN export and transfer to review. Advice uses full-strength analysis regardless of playing level. Explanations are deterministic chess facts and PVs, not an LLM conversation. No calibrated Elo claim. Preferences and the current training PGN are stored locally. SVG avatar customization is original code. Theme supports system/light/dark, board palettes, motion speed, sound, coordinates, legal targets and analysis defaults. Local fonts preserve offline desktop rendering.
Validation: node test-coach.mjs, existing chess and explanation tests; browser checks covered human e4, bot response, guided feedback, undo, resume, playing Black, hints, transfer to review, avatar/theme persistence; mobile 390 and tablet 820 layouts checked for horizontal overflow. Native OS builds still require device testing.


## Version 1.3
Specific brief coach feedback on legal tactical evidence, no unsolicited move sequence. Original 16-position training catalogue, full Stockfish validation, themes matched to personal mistakes, spaced repetition from first attempts. Backup restores validated analyses and review schedules.
Checks: node test.mjs; node test-explanations.mjs; node test-coach.mjs; node test-v2.mjs; node test-v3.mjs; node test-engine-v3.mjs (actual WASM).
The static updates/manifest.json and versioned gzip JSON bundle serve the desktop core updater introduced in shell 1.3.0. This private Site requires user authentication. The Windows/source deliverables include the updater, tests, and build-update.cjs. Increment core version and regenerate the bundle from native web/ for each subsequent desktop release. Do not place secrets in a core bundle. Native/runtime updates require redistributing the shell; iOS builds update through signed distribution.

## Version 1.4
Coach rendering preserves moving DOM nodes across lock/turn updates; motion state is per board; mate effects respect reduced motion. Shared move-grade.js handles all classification inputs for coach and review. Review reset clears working state after cancellation, preserving archived games and guarding late archive saves. Coach last grade persists across resume; hints clear after a move.
QA: node test-v4.mjs plus prior suites; browser confirmed both piece animations finished on connected nodes, book grade with automatic reply, reset during analysis, replacement PGN and mate state. Native core 1.4.0 is compatible with desktop shell 1.3.0.

## Versione 1.5 — Ultime 30 partite e allenamento mirato
Progressi → username → Collega e analizza ultime 30 legge fino a 30 partite standard concluse, dalle più recenti, senza password e senza duplicati. Analisi locale sequenziale, salvataggio dopo ogni mossa, interruzione e ripresa con il pulsante dedicato. Tieni aperta la pagina: l’operazione può richiedere decine di minuti. Dopo il download delle partite, la ripresa funziona offline nelle app; non è un servizio attivo ad app chiusa.
Il profilo riassume precisione e temi frequenti del campione; non stima l’Elo. Le analisi complete alimentano gli esercizi personali e un obiettivo del coach. Importare altri mesi manualmente non avvia analisi automatica.
Giudizi decisivi ricontrollati a profondità massima 24 o 5 secondi per posizione, senza garanzia di infallibilità. Mostrami perché evidenzia caratteristiche geometriche sulla posizione subito dopo la mossa. Riepilogo dei momenti importanti e obiettivo successivo. Quattro finali da allenare, commenti contestuali allo sviluppo recente.
Verifiche: test automatici per selezione ultime 30, checkpoint e ripresa, classificazione condivisa, finali legali. Flusso browser con API simulate e Stockfish reale; il collegamento live al proprio account e l’esecuzione Windows/iOS richiedono ancora collaudo sui dispositivi reali. PC 1.3+ può ricevere il nucleo 1.5 da Impostazioni → Aggiornamenti; iOS richiede nuova build firmata.
