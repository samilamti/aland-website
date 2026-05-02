# Deploying Åland.website

Two paths. Pick one. The first is set-and-forget; the second is faster for tinkering before DNS is live.

## Path A — GitHub + Cloudflare Pages auto-deploy (recommended)

Once-off setup:

1. **Create the repo on GitHub.** Either via `gh`:
   ```bash
   gh repo create samilamti/aland-website \
     --public \
     --description "Åland.website — civic-tech homepage for the Åland web" \
     --source=. \
     --push
   ```
   …or by clicking through github.com and then:
   ```bash
   git remote add origin git@github.com:samilamti/aland-website.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect Cloudflare Pages.** In dash.cloudflare.com:
   - Workers & Pages → Create → Pages → Connect to Git
   - Pick `samilamti/aland-website`, branch `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: none
   - Click *Save and Deploy*

   First build takes ~1 minute. You'll get a `aland-website.pages.dev` URL.

3. **Add the custom domain.** In your Pages project → Custom domains → Set up custom domain → enter `åland.website`. Cloudflare will tell you which DNS records to add at your registrar (CNAME if your DNS is elsewhere; auto if you transfer DNS to Cloudflare).

4. **Verify HTTPS.** Cloudflare auto-issues a cert. Wait a few minutes after DNS propagates.

After this, every `git push` to `main` auto-deploys.

## Path B — Direct deploy via wrangler (no GitHub needed)

Useful for the first deploy if you haven't created the GitHub repo yet, or for quick iteration.

```bash
npm run build
npx wrangler login              # opens browser, one-time
npx wrangler pages deploy dist --project-name=aland-website
```

You still need to add the custom domain via the dashboard (step 3 above) once.

## After first deploy: post-launch checklist

- [ ] Set up email forwarding for `hej@åland.website` (Cloudflare Email Routing is free; forwards to your real inbox)
- [ ] Submit the site to search engines (Google Search Console, Bing Webmaster) — set up after DNS is live
- [ ] Test the OpenSearch descriptor: visit the live site in Firefox, right-click in the address bar → *Add Search Engine*. In Chrome, the engine auto-registers after a few visits and can be set as default in `chrome://settings/searchEngines`.
- [ ] Verify all `verified: false` entries in `src/data/keywords.json` (currently: `posten`, `väder`)
- [ ] Run `npm run verify` before each release
- [ ] Make sure `åland.website` and `xn--land-poa.website` (punycode) both resolve — Cloudflare handles this automatically once you add either one

## Useful commands

```bash
npm run dev          # local dev at http://127.0.0.1:4321
npm run build        # produces dist/
npm run preview      # serve dist/ locally
npm run verify       # check every URL in keywords.json
npm run check        # astro typecheck
```
