# Linea
Browser-local PGN review with Stockfish.js 19.0.1 Lite single-threaded WASM, chess.js 1.4.0, Chessnut piece PNGs rendered from original SVGs, Lichess Green board and Lichess CC0 openings.

Static site: dist/. No external analysis API or account is needed. Stockfish is a worker on the same origin; serve .wasm with application/wasm MIME type. Google Fonts is optional; system fonts work offline.

Analysis: independent accuracy formula and heuristic move classifications, documented in the method dialog. Not Chess.com CAPS2. Local branches preserve the original game and can be exported to individual PGNs. Session data is in memory only.

Checks: node test.mjs. Browser QA covered a complete 17-ply game, mate, both colors in a branch, castling, additional branch creation, original restoration, and 390px/820px responsive layouts. Node tests cover legal PGN parsing, invalid PGN rejection, en passant, underpromotion and evaluation sign.

Licenses: Stockfish GPLv3 (dist/vendor/stockfish-LICENSE), chess.js BSD-2-Clause (dist/vendor/chess-LICENSE), Chessnut Apache-2.0 (dist/pieces/LICENSE.txt), board AGPLv3+ (dist/vendor/lichess-COPYING.md), opening data CC0. Third party source URLs are in the visible method dialog. Original application code is provided under AGPLv3 or later. Original SVG source and PNG derivatives are both included.
