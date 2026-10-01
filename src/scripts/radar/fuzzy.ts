// Subsequence-based fuzzy matcher. Scores contiguous runs, word-boundary hits
// and early matches higher, so "agwf" ranks "Agentic Workflows" above
// coincidental letter matches elsewhere.

export interface FuzzyResult<T> {
  item: T;
  score: number;
}

export function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  const exact = t.indexOf(q);
  if (exact === 0) return 1000;
  if (exact > 0) return 800 - exact;

  let score = 0;
  let qi = 0;
  let lastMatch = -2;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;
    score += 10;
    if (ti === lastMatch + 1) score += 15; // contiguous run
    if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '(') score += 20; // word start
    lastMatch = ti;
    qi++;
  }
  if (qi < q.length) return -1; // not all query chars matched
  return score - t.length * 0.1;
}

export function fuzzySearch<T>(query: string, items: T[], keyFn: (item: T) => string[], limit = 30): FuzzyResult<T>[] {
  if (!query.trim()) return [];
  const results: FuzzyResult<T>[] = [];
  for (const item of items) {
    let best = -1;
    for (const key of keyFn(item)) {
      const s = fuzzyScore(query, key);
      if (s > best) best = s;
    }
    if (best > 0) results.push({ item, score: best });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
