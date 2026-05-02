const WORDBREAK_SUFFIXES = [
  'regering',
  'förvaltningen',
  'service',
  'marknad',
  'pension',
  'anstalten',
];

export function wordbreak(s: string): string {
  let out = s;
  for (const suffix of WORDBREAK_SUFFIXES) {
    const re = new RegExp(`(?<=\\p{L})${suffix}`, 'giu');
    out = out.replace(re, '­$&');
  }
  return out;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]!);
}

export function formatLabel(s: string): string {
  const broken = wordbreak(s);
  const escaped = escapeHtml(broken);
  return escaped.replace(/\(([^)]+)\)/g, '<span class="dim">($1)</span>');
}
