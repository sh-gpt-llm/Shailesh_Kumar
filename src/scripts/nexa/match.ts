// The radar's fuzzy matcher is a subsequence scorer built for short typed
// queries, so a full sentence never matches. Estate suggestions are driven by a
// description, which needs term overlap instead.

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'our', 'their', 'your', 'are', 'was', 'were', 'has',
  'have', 'had', 'but', 'not', 'can', 'will', 'would', 'should', 'could', 'all', 'any', 'how', 'why', 'what', 'when',
  'who', 'its', 'it’s', 'use', 'using', 'used', 'via', 'per', 'one', 'two', 'new', 'more', 'most', 'than', 'then',
  'them', 'they', 'you', 'we', 'us', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'by', 'or', 'is', 'be', 'as', 'it',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/** Crude stem so "agents"/"agentic" and "platform"/"platforms" collide. */
const stem = (t: string) => (t.length > 5 ? t.slice(0, 5) : t);

export interface Matchable {
  name: string;
  summary: string;
  tags: string[];
}

export interface ScoredMatch<T> {
  item: T;
  score: number;
}

/** A name token is worth 6, a tag token 3, a summary token 1. */
export const NAME_HIT = 6;

export function termMatchScored<T extends Matchable>(query: string, items: T[], limit = 8): ScoredMatch<T>[] {
  const qTokens = [...new Set(tokenise(query).map(stem))];
  if (!qTokens.length) return [];

  const scored = items.map((item) => {
    const nameTokens = new Set(tokenise(item.name).map(stem));
    const tagTokens = new Set(item.tags.flatMap((t) => tokenise(t)).map(stem));
    const summaryTokens = new Set(tokenise(item.summary).map(stem));

    let score = 0;
    for (const q of qTokens) {
      if (nameTokens.has(q)) score += NAME_HIT;
      else if (tagTokens.has(q)) score += 3;
      else if (summaryTokens.has(q)) score += 1;
    }
    // Favour tighter names over long summaries that happen to contain the words.
    return { item, score: score - item.name.length * 0.01 };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function termMatch<T extends Matchable>(query: string, items: T[], limit = 8): T[] {
  return termMatchScored(query, items, limit).map((s) => s.item);
}
