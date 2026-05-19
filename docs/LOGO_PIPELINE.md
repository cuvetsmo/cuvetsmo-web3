# Sub-brand logo pipeline (Pollinations.ai + PIL)

End-to-end pipeline to generate a polished sub-brand logo for any CUVETSMO product, with zero API key cost.

Used for the 2026-05-19 sub-brand logo cohort: **CUVETSMO Web3**, **CUVETSMO Labs**, **Imaging Lab**, **CUVETSMO Docs**.

---

## Why Pollinations.ai

- Free (no API key, no rate-limited account)
- Backed by Flux (open-source SOTA text-to-image)
- Deterministic via `seed=N` — same seed + prompt = same image, so winners are reproducible
- Returns 1024×1024 by default (good for downsampling)
- One caveat: **shared queue per IP** — if you fire 16 parallel curls, only the first 1-2 succeed and the rest return `{"x402Version":1,"error":"Queue full"...}`. Always download **sequentially with 3s gap**.

Fallback: dicebear.com (also free, deterministic SVG avatars — less polished but more reliable for emergencies).

---

## Step 1 — Generate candidates (Pollinations.ai)

URL pattern:
```
https://image.pollinations.ai/prompt/<URL-encoded-prompt>?width=1024&height=1024&model=flux&nologo=true&seed=<N>&enhance=true
```

Generate **4 candidates per brand** with seeds 1, 2, 3, 4. Use English prompts for best Flux results. Include color (sky blue `#0369a1`), style (minimalist app icon, vector, isolated on white, no text), and a metaphor (chain link infinity, atom orbital, abstract eye, book→code brackets).

**Download sequentially with `sleep 3` between requests** to avoid queue rate limit.

Example bash loop:
```bash
for seed in 1 2 3 4; do
  for brand in web3 labs imaging docs; do
    encoded=$(python -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1],safe=''))" "$prompt")
    curl -sL --max-time 180 -o "candidates/$brand/$seed.png" \
      "https://image.pollinations.ai/prompt/$encoded?width=1024&height=1024&model=flux&nologo=true&seed=$seed&enhance=true"
    # Stub files (rate-limited) are < 5 KB JSON. Delete and retry.
    [ $(stat -c %s candidates/$brand/$seed.png) -lt 5000 ] && rm candidates/$brand/$seed.png
    sleep 3
  done
done
```

The full bash script lives at `C:\Users\palmz\Desktop\logo-candidates\download_sequential.sh`.

---

## Step 2 — Pick winner

Open all 4 candidates per brand. Heuristic:
1. **Cleanest silhouette** at 32×32 (favicon size) — squint test
2. **Single primary color** that matches brand sky-700 palette
3. **No text in the image** (Flux often hallucinates fake letters)
4. **Recognizable metaphor** that matches the prompt

If all look equivalent, default to seed=1 (Pollinations' enhance pass tends to favor the first seed).

Copy winner to `candidates/<brand>/winner.png` and **log the seed number** in the skill log so future cohorts can re-generate.

**2026-05-19 winners logged:**
| Brand   | Seed | Notes |
|---------|------|-------|
| Web3    | 1    | Clean infinity, blue→violet gradient |
| Labs    | 2    | Atom + orbital, sky-blue + cyan, visible nucleus |
| Imaging | 1    | Bold eye + radial scan lines |
| Docs    | 2    | All-blue book, code-like text marks |

---

## Step 3 — Process winner into full asset family

PIL script: `C:\Users\palmz\Desktop\logo-candidates\process.py`

Generates:
- `master-1024.png` — 1024×1024 source (white bg)
- `favicon-16.png`, `-32.png`, `-48.png`, `-180.png` — multi-size PNG favicons (white bg for browser tab visibility)
- `favicon.ico` — multi-size ICO (16+32+48)
- `icon-192.png`, `icon-512.png` — PWA icons (transparent bg, white→transparent dropped)
- `icon-maskable-512.png` — PWA maskable (logo in safe 70% inner zone, sky-700 bg)
- `apple-touch-icon.png` — copy of favicon-180
- `og.png` — 1200×630 OG card (sky-700 gradient bg + logo upper-left + auto-fitted wordmark + tagline)

Run:
```bash
python process.py <brand> candidates/<brand>/winner.png candidates/<brand>/out "Wordmark Text" "Tagline text"
```

Notes on the OG composer:
- Sky-700 (`#0369a1`) to sky-900 (`#0c4a6e`) vertical gradient
- Wordmark uses Segoe UI Black/Bold, auto-shrinks from 84 → 48px to avoid clipping
- Tagline uses Segoe UI Regular at 32px in sky-200
- The logo's white background is dropped to transparent (any pixel with R/G/B all > 235) so it composites cleanly on the gradient
- Logo size = 360px, left at x=80, vertically centered

---

## Step 4 — Wire into each project

For each Next.js project (web3, labs, imaging):
1. Copy these files into `public/`:
   - `favicon.ico`, `og.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`
   - `<brand>-logo.png` (master 1024) and `<brand>-logo-mark.png` (512 transparent) for direct use in components
2. Update `app/layout.tsx` `metadata.icons`:
   ```ts
   icons: {
     icon: [
       { url: "/favicon.ico", sizes: "any" },
       { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
       { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
     ],
     shortcut: "/favicon.ico",
     apple: "/apple-touch-icon.png",
   }
   ```
3. Update header `<Image src=...>` to use the new `/<brand>-logo-mark.png` (replacing `/smo-logo.png`)
4. Ensure `openGraph.images` includes `{ url: "/og.png", width: 1200, height: 630, alt: "..." }` and `twitter.images: ["/og.png"]`

For the Astro/Starlight docs project:
- Keep the institutional `smo-logo.png` in the title bar (per brand convention: docs is the official org-facing surface)
- Replace only `public/og.png` with the docs-themed OG

---

## Step 5 — Ship

Per-project:
```bash
cd <project>
git add public/* app/layout.tsx components/header.tsx
git commit -m "brand — sub-brand logo (Pollinations AI generated, seed=N)"
git push
```

Vercel auto-deploys on push for all 4 projects. To force re-deploy without a code change, use `npx vercel deploy --prod --yes` from the project root.

---

## Known issues

- **Pollinations queue rate limit** — first parallel burst returns mostly stub JSON. Always sequential, sleep 3s between requests. 4-brand × 4-seed run takes ~3-4 minutes.
- **Flux text hallucination** — even with "no text" in prompt, Flux sometimes adds fake glyph noise inside the logo. Pick a clean seed; don't waste time editing.
- **White-background bleed** — the white-to-transparent threshold (R/G/B > 235) is aggressive and may eat near-white pixels in the logo itself. For logos with very light areas, lower threshold to 245 in `process.py` `make_maskable` and `make_og`.
- **OG wordmark clipping** — the auto-fit cascades down to 48px. If the brand name is longer than ~22 chars at 48px, manually shorten the wordmark or split into 2 lines (edit `make_og` in `process.py`).
- **JPEG vs PNG output** — Pollinations returns JPEG for some seeds. PIL handles both transparently; no action needed.

---

## Re-running this skill

1. Edit prompts in `download_sequential.sh` (top of file — `WEB3_PROMPT`, `LABS_PROMPT`, etc.)
2. Bump seed range if the existing winners are stale
3. Run `bash download_sequential.sh`
4. Eyeball candidates, update the winners table above, copy chosen seeds to `winner.png`
5. Run `process.py` for each brand
6. Copy to projects' `public/`, commit, push

Total time: ~10 min per brand once the script is in place. Bulk of latency is Pollinations queue.
