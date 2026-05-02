import type { KeywordEntry, KeywordMap } from './types';

const FOLDABLE: Record<string, string> = {
  å: 'a', ä: 'a', ö: 'o',
  Å: 'a', Ä: 'a', Ö: 'o',
};

export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[åäöÅÄÖ]/g, (c) => FOLDABLE[c] ?? c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function buildIndex(map: KeywordMap): Map<string, KeywordEntry> {
  const idx = new Map<string, KeywordEntry>();
  for (const entry of map.entries) {
    idx.set(normalize(entry.keyword), entry);
    for (const alias of entry.aliases ?? []) {
      const key = normalize(alias);
      if (!idx.has(key)) idx.set(key, entry);
    }
  }
  return idx;
}

export type ResolveResult =
  | { kind: 'exact'; entry: KeywordEntry }
  | { kind: 'prefix'; entry: KeywordEntry; matchedKey: string }
  | { kind: 'fallthrough'; query: string };

export function resolve(map: KeywordMap, query: string): ResolveResult {
  const q = normalize(query);
  if (!q) return { kind: 'fallthrough', query };

  const idx = buildIndex(map);

  const exact = idx.get(q);
  if (exact) return { kind: 'exact', entry: exact };

  const prefixHits: Array<{ key: string; entry: KeywordEntry }> = [];
  for (const [key, entry] of idx) {
    if (key.startsWith(q)) prefixHits.push({ key, entry });
  }
  const uniqueByEntry = new Map(prefixHits.map((h) => [h.entry.url, h]));
  if (uniqueByEntry.size === 1) {
    const [hit] = uniqueByEntry.values();
    return { kind: 'prefix', entry: hit.entry, matchedKey: hit.key };
  }

  return { kind: 'fallthrough', query };
}

export function fallthroughUrl(query: string): string {
  const q = encodeURIComponent(`site:.ax ${query}`);
  return `https://duckduckgo.com/?q=${q}`;
}
