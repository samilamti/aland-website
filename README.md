# Åland.website

> En enkel, snabb och spårningsfri startsida för Ålands webb.
> A simple, fast, no-tracking homepage for Åland's web.

## Vad är det här? / What is this?

**Svenska:** `Åland.website` är en oberoende civic-tech-sida som låter dig hitta rätt åländsk webbplats genom att bara skriva ett ord. Skriv `polisen` och du hamnar på polisen.ax. Skriv `mariehamn` och du kommer till stadens webb.

**English:** `Åland.website` is an independent civic-tech homepage that lets you find any Åland-Islands site by typing a single word. Type `polisen` and land on polisen.ax. Type `mariehamn` and reach the city's site. Built for the ~30,000 inhabitants of Åland and the ~3,200 active `.ax` domains.

## Köra lokalt / Run locally

```bash
npm install
npm run dev
```

Sidan startar på <http://127.0.0.1:4321>.

## Bidra / Contributing

Det viktigaste innehållet är `src/data/keywords.json` — en kuraterad lista med sökord och tillhörande URL:er. Saknar du något? Öppna ett ärende eller en pull request.

The most important content is `src/data/keywords.json` — a curated list of keywords and their URLs. Missing something? Open an issue or pull request.

URL:er märkta `"verified": false` behöver granskas innan första lansering / URLs marked `"verified": false` need to be confirmed before launch. Run the link checker before each release:

```bash
npm run verify
```

## Stack

- [Astro](https://astro.build) (static output, ingen JS i kritiska sökvägen / no JS on the critical path)
- TypeScript
- Cloudflare Pages för hosting (planerat / planned)
- Inga tredjepartsspårare. Inga cookies. / No third-party trackers. No cookies.

## Domännamn / Domain note

The domain `åland.website` is an IDN; in many tools and headers it appears as its punycode form, `xn--land-poa.website`. Both forms resolve to the same site. Email to `hej@åland.website` should also work as `hej@xn--land-poa.website` — verify with your provider.

## Licens / License

MIT — se [LICENSE](./LICENSE).
