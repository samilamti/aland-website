export interface KeywordEntry {
  keyword: string;
  aliases?: string[];
  url: string;
  category: string;
  label_sv: string;
  verified?: boolean;
}

export interface KeywordMap {
  version: number;
  updated: string;
  note?: string;
  entries: KeywordEntry[];
}

export const CATEGORIES = {
  myndighet: 'Myndigheter',
  kommun: 'Kommuner',
  halsa: 'Hälsa & vård',
  utbildning: 'Utbildning',
  transport: 'Transport',
  tjanst: 'Tjänster',
  media: 'Media',
  bank: 'Bank & finans',
  foretag: 'Företag',
  verktyg: 'Verktyg',
  info: 'Information',
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
