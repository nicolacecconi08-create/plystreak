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
