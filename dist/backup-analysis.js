// Validate persisted metrics without silently replacing their calculation method.
const fail = () => { throw Error('Metriche di analisi nel backup non valide.'); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function restoreAnalysisMetrics(analysis, moves) {
  const clean = {};
  if (analysis.accuracyMethod !== undefined) {
    if (typeof analysis.accuracyMethod !== 'string' || !analysis.accuracyMethod.trim() || analysis.accuracyMethod.length > 60) fail();
    clean.accuracyMethod = analysis.accuracyMethod;
  }
  if (analysis.gameAccuracy !== undefined) {
    if (!clean.accuracyMethod || !object(analysis.gameAccuracy)) fail();
    clean.gameAccuracy = {};
    for (const side of ['w', 'b']) {
      const value = analysis.gameAccuracy[side];
      if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) fail();
      clean.gameAccuracy[side] = value;
    }
  }
  if (analysis.performanceBasis !== undefined) {
    const basis = analysis.performanceBasis;
    if (!object(basis) || basis.version !== 1) fail();
    clean.performanceBasis = {version: 1};
    for (const side of ['w', 'b']) {
      const source = basis[side];
      if (!object(source)) fail();
      const limit = moves.filter(move => move.color === side).length;
      const counters = {};
      for (const key of ['tactical', 'found', 'openingPairs', 'repeated', 'pawn', 'counts']) {
        const value = source[key];
        if (!Number.isInteger(value) || value < 0 || value > limit) fail();
        counters[key] = value;
      }
      if (counters.found > counters.tactical || counters.repeated > counters.openingPairs ||
          counters.tactical > counters.counts || counters.openingPairs > counters.counts || counters.pawn > counters.counts) fail();
      clean.performanceBasis[side] = counters;
    }
  }
  return clean;
}
