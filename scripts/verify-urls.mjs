#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYWORDS_FILE = resolve(__dirname, '..', 'src', 'data', 'keywords.json');

const TIMEOUT_MS = 12000;
const CONCURRENCY = 6;
// Use a clean browser UA — many municipal sites reject any UA with non-browser
// suffixes. The goal of this script is to verify "does a user's browser get a
// working response," so impersonating a browser here is the accurate test.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

async function fetchOnce(url, method) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'sv,en;q=0.8',
    };
    if (method === 'GET') headers.Range = 'bytes=0-2047';
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers,
    });
    return { status: res.status, finalUrl: res.url };
  } finally {
    clearTimeout(t);
  }
}

async function checkUrl(url) {
  // Always GET — many WAFs reject HEAD outright, which would false-positive.
  // Range header keeps us polite (we only need enough to see the response).
  try {
    return await fetchOnce(url, 'GET');
  } catch (e) {
    return { error: e.cause?.code || e.code || e.name || String(e.message || e) };
  }
}

function normHref(s) {
  return s.replace(/\/+$/, '').toLowerCase();
}

function classify(entry, result) {
  if (result.error) return { kind: 'error', detail: result.error };
  const { status, finalUrl } = result;
  if (status >= 500) return { kind: 'server_error', detail: String(status) };
  if (status === 404) return { kind: 'not_found', detail: '404' };
  if (status >= 400) return { kind: 'client_error', detail: String(status) };

  let requested, final;
  try { requested = new URL(entry.url); } catch { return { kind: 'bad_url' }; }
  try { final = new URL(finalUrl); } catch { return { kind: 'ok' }; }

  if (final.hostname.replace(/^www\./, '') !== requested.hostname.replace(/^www\./, '')) {
    return { kind: 'redirect_host', detail: finalUrl };
  }
  if (normHref(final.href) !== normHref(requested.href)) {
    return { kind: 'redirect_path', detail: finalUrl };
  }
  return { kind: 'ok' };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const KIND_ORDER = ['error', 'not_found', 'server_error', 'client_error', 'redirect_host', 'redirect_path', 'bad_url', 'ok'];
const KIND_LABEL = {
  ok: '✓ OK',
  redirect_path: '↪ redirected (same host, different path)',
  redirect_host: '↪ redirected to a different host',
  not_found: '✗ 404 not found',
  client_error: '✗ 4xx client error',
  server_error: '✗ 5xx server error',
  error: '✗ network/dns error',
  bad_url: '? bad URL in data file',
};

const main = async () => {
  const raw = await readFile(KEYWORDS_FILE, 'utf8');
  const data = JSON.parse(raw);
  const entries = data.entries;

  console.log(`Checking ${entries.length} URLs from ${KEYWORDS_FILE}`);
  console.log(`(timeout ${TIMEOUT_MS / 1000}s, ${CONCURRENCY} concurrent)\n`);

  const t0 = Date.now();
  const results = await mapLimit(entries, CONCURRENCY, async (entry) => {
    const result = await checkUrl(entry.url);
    const verdict = classify(entry, result);
    process.stdout.write('.');
    return { entry, result, verdict };
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\nFinished in ${elapsed}s.\n`);

  const buckets = {};
  for (const k of KIND_ORDER) buckets[k] = [];
  for (const r of results) buckets[r.verdict.kind].push(r);

  console.log('Summary:');
  for (const k of KIND_ORDER) {
    if (buckets[k].length === 0) continue;
    console.log(`  ${KIND_LABEL[k].padEnd(46)} ${buckets[k].length}`);
  }

  for (const k of KIND_ORDER) {
    if (k === 'ok' || buckets[k].length === 0) continue;
    console.log(`\n--- ${KIND_LABEL[k]} ---`);
    for (const r of buckets[k]) {
      console.log(`  [${r.entry.keyword}] ${r.entry.url}`);
      console.log(`        ${r.verdict.detail || ''}`);
    }
  }

  const okFalseVerified = buckets.ok.filter((r) => r.entry.verified === false);
  if (okFalseVerified.length > 0) {
    console.log(`\n--- ${okFalseVerified.length} entries are reachable but still marked verified:false ---`);
    for (const r of okFalseVerified) {
      console.log(`  [${r.entry.keyword}] ${r.entry.url}`);
    }
    console.log('  (these can be flipped to verified:true after eyeballing)');
  }

  const broken = buckets.error.length + buckets.not_found.length + buckets.client_error.length + buckets.server_error.length;
  console.log(`\nNet: ${buckets.ok.length}/${entries.length} OK · ${broken} need attention · ${buckets.redirect_host.length + buckets.redirect_path.length} redirects to review.`);

  if (broken > 0) process.exit(1);
};

main().catch((e) => { console.error(e); process.exit(2); });
