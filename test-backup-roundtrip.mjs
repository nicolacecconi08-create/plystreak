import assert from 'node:assert/strict';
import {Chess} from './dist/vendor/chess.js';
import {validateBackup} from './dist/backup.js';
import {personalStats} from './dist/archive.js';
import {ACCURACY_METHOD} from './dist/accuracy-metric.js';
import {gameDecisions} from './dist/game-performance.js';

// Synthetic legal PGN: no visitor data, engine or browser storage required.
const chess = new Chess();
chess.loadPgn('[White "Fixture White"]\n[Black "Fixture Black"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0');
const moves = chess.history({verbose: true});
const original = {
  id: 'backup-roundtrip', pgn: chess.pgn(), headers: chess.getHeaders(),
  side: 'w', playedAt: 1000,
  analysis: {
    version: 2, complete: true, total: moves.length, at: 1000,
    method: 'Synthetic regression fixture', methodId: 'fixture-v1',
    accuracyMethod: ACCURACY_METHOD, gameAccuracy: {w: 95, b: 72},
    performanceBasis: {version: 1, w: gameDecisions(moves, [], 'w'), b: gameDecisions(moves, [], 'b')},
    details: moves.map((move, ply) => ({
      ply, side: move.color, san: move.san, from: move.from, to: move.to,
      fen: move.before, afterFen: move.after, accuracy: 80, loss: 0.1,
      type: 'good', theme: 'position', best: move.from + move.to,
    })),
  },
};
const clone = value => structuredClone(value);
const envelope = (games, version = 2) => ({format: 'plystreak-backup', version, games});
const restore = (games, version = 2) => validateBackup(JSON.parse(JSON.stringify(envelope(games, version)))).games;

for (const version of [1, 2]) {
  const [restored] = restore([original], version);
  assert.equal(personalStats([restored]).accuracy, 95, `v${version}: do not replace game accuracy with the 80-point arithmetic mean`);
  assert.deepEqual(personalStats([restored]), personalStats([original]), `v${version}: outcomes, themes and accuracy survive migration`);
  for (const field of ['accuracyMethod', 'gameAccuracy', 'performanceBasis', 'method', 'methodId', 'total']) {
    assert.deepEqual(restored.analysis[field], original.analysis[field], `v${version}: preserve ${field}`);
  }
  assert.deepEqual(personalStats(restore([restored], version)), personalStats([original]), 'a second round trip must be stable');
}

const legacy = clone(original);
legacy.id = 'legacy';
delete legacy.analysis.accuracyMethod;
delete legacy.analysis.gameAccuracy;
delete legacy.analysis.performanceBasis;
for (const version of [1, 2]) {
  const [restored] = restore([legacy], version);
  assert.equal(restored.analysis.accuracyMethod, undefined, 'do not assign a new metric to historical results');
  assert.equal(restored.analysis.gameAccuracy, undefined);
  assert.equal(personalStats([restored]).accuracy, 80);
  assert.deepEqual(personalStats([restored]), personalStats([legacy]));
}

// Older methods must not enter the newest method's aggregate after import.
const otherMethod = clone(original);
otherMethod.id = 'older-method';
otherMethod.playedAt = 500;
otherMethod.analysis.accuracyMethod = 'historical-fixture-method';
otherMethod.analysis.gameAccuracy = {w: 20, b: 30};
legacy.playedAt = 100;
const mixed = [legacy, otherMethod, original];
for (const version of [1, 2]) {
  assert.deepEqual(personalStats(restore(mixed, version)), personalStats(mixed));
  assert.equal(personalStats(restore(mixed, version)).accuracy, 95);
}

const unknownAggregate = clone(original);
unknownAggregate.analysis.gameAccuracy = {w: null, b: null};
assert.deepEqual(restore([unknownAggregate])[0].analysis.gameAccuracy, {w: null, b: null});

const malformed = [
  ['empty metric', a => { a.accuracyMethod = ''; }],
  ['non-string metric', a => { a.accuracyMethod = 3; }],
  ['oversized metric', a => { a.accuracyMethod = 'a'.repeat(61); }],
  ['aggregate without method', a => { delete a.accuracyMethod; }],
  ['negative accuracy', a => { a.gameAccuracy.w = -1; }],
  ['accuracy above 100', a => { a.gameAccuracy.b = 101; }],
  ['non-numeric accuracy', a => { a.gameAccuracy.w = '95'; }],
  ['non-finite accuracy', a => { a.gameAccuracy.w = NaN; }],
  ['missing colour aggregate', a => { delete a.gameAccuracy.b; }],
  ['invalid performance version', a => { a.performanceBasis.version = 2; }],
  ['missing performance colour', a => { delete a.performanceBasis.b; }],
  ['negative decision count', a => { a.performanceBasis.w.tactical = -1; }],
  ['fractional decision count', a => { a.performanceBasis.w.counts = 1.5; }],
  ['more decisions than moves', a => { a.performanceBasis.w.counts = 4; }],
  ['more tactics than moves', a => { a.performanceBasis.w.tactical = 4; }],
  ['found exceeds tactical', a => { a.performanceBasis.w.found = 1; }],
  ['repeated exceeds pairs', a => { a.performanceBasis.w.repeated = 3; }],
  ['pawns exceed decisions', a => { a.performanceBasis.w.pawn = 4; }],
];
for (const [label, corrupt] of malformed) {
  const bad = clone(original);
  corrupt(bad.analysis);
  assert.throws(() => validateBackup(envelope([bad])), undefined, label);
}
console.log('PASS backup round trip: v1/v2 statistics, metric separation, legacy compatibility, decision evidence and invalid metadata');
