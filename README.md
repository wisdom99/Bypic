# Threadline

> Source African fabric in 24 hours, not 24 days.

Threadline is a marketplace prototype that connects fashion designers across Africa with verified textile producers in Nigeria's heritage hubs — Lagos, Aba, Kano, Onitsha, Abeokuta, and Ibadan. The headline feature is a mood-board AI matcher that takes an inspiration image and returns the closest fabrics in the catalogue, ranked by colour, mood, heritage, and texture, with a written explanation of *why* each match works.

Built in ~24 hours for the Cursor x Creative Economy hackathon.

## Why this matters

A Lagos-based designer trying to source 30 yards of indigo Adire today usually has to:

- Drive to Abeokuta or rely on a fixer.
- Trade WhatsApp voice notes with five different cooperatives.
- Wait 24+ days for swatches that may not match the mood she sketched.

Threadline collapses that loop. The catalogue is structured (heritage, palette, mood, MOQ, lead time, region), the suppliers are profiled with verification badges, and the AI matcher turns "this is the vibe" into "here are three fabrics that match it" in under five seconds.

## Demo script (90 seconds)

1. **Land on the home page.** Read the hero promise and scroll past the procedurally generated fabric tiles representing each heritage.
2. **Open `/marketplace`.** Filter by heritage (e.g. *Adire*) and region (e.g. *Abeokuta*). Notice price/MOQ controls, lead-time badges, and the heritage tints on each card.
3. **Click an Adire fabric.** Read the supplier story, palette swatches, and order details. Click **Send inquiry** to see the auto-drafted RFQ, edit a field, and submit. The success view shows a tracked RFQ id (also persisted to `localStorage`).
4. **Click *Try AI Match* in the navbar.** Pick the *Indigo dusk* sample mood-board (or upload one). Watch the vision summary populate (palette, mood, heritage guess) and the ranked matches arrive with per-fabric reasoning, score breakdowns, and direct *send inquiry* paths.
5. **Open `/about`.** Read the *Built with Cursor AI* notes describing how the prototype was put together.

## Feature highlights

- **Curated catalogue** — 30+ fabrics across 6 Nigerian heritage techniques (Adire, Ankara, Aso-oke, Akwete, Kente, George/lace), seeded from `data/fabrics.json` and `data/suppliers.json`.
- **Procedural fabric artwork** — every listing renders as a unique SVG generated from the fabric's palette and heritage. No external image hosts required, demo loads in milliseconds even offline.
- **AI mood-board matcher** — uploads or sample images are sent to Google `gemini-2.5-flash` with a strict JSON response schema (palette, mood, texture, heritage guess). A deterministic ranker (CIELAB ΔE colour distance + Jaccard tag overlap + heritage and texture bonuses) returns the top 6 fabrics with per-fabric reasoning.
- **Graceful AI fallback** — if no `GEMINI_API_KEY` is configured the API uses a built-in heuristic so the demo never blanks out, and sample mood-boards ship with a "vision hint" so judges always see deterministic, sensible matches.
- **Inquiry flow with auto-drafted RFQs** — `InquiryDialog` pre-fills name, MOQ, lead time, and a polished message that references the listing. Submissions hit `/api/inquiry`, get a tracked id, and persist locally for the demo.
- **Heritage-aware UX** — heritage badges, region pills, and palette swatches are themed per technique, so an Adire card looks different from a Kente or Akwete card at a glance.

## Tech stack

- **Next.js 15** (App Router, server components, static generation for fabric and supplier pages)
- **TypeScript** end-to-end with `zod` schemas for AI responses and inquiry validation
- **Tailwind CSS v4** with a custom heritage colour palette and `Fraunces` + `Inter` typography
- **Framer Motion** for hero, dialog, and match-result transitions
- **Google `gemini-2.5-flash`** (`@google/genai`) for vision-to-JSON mood-board analysis with response schema enforcement (and a deterministic fallback)
- **lucide-react** icons, `clsx` + `tailwind-merge` for class composition
- **Mock data layer** — JSON seed files plus `localStorage` for RFQs (no DB, no auth)

## Project structure

```text
Bypic/
├── app/
│   ├── api/
│   │   ├── inquiry/route.ts        # Mock RFQ endpoint
│   │   └── match/route.ts          # Gemini vision + ranker
│   ├── about/page.tsx              # Story + Built with Cursor
│   ├── fabrics/[id]/page.tsx       # Fabric detail
│   ├── marketplace/page.tsx        # Filterable catalogue
│   ├── match/page.tsx              # AI mood-board matcher
│   ├── suppliers/[id]/page.tsx     # Supplier profile
│   ├── globals.css                 # Tailwind layers + tokens
│   ├── layout.tsx                  # Navbar + Footer shell
│   └── page.tsx                    # Landing page
├── components/                     # Hero, FabricCard, InquiryDialog, MoodboardUploader, …
├── data/
│   ├── fabrics.json                # 30+ fabrics
│   └── suppliers.json              # 10 suppliers
├── lib/
│   ├── data.ts                     # Catalogue access helpers
│   ├── matching.ts                 # ΔE + Jaccard ranker, palette describer
│   ├── gemini.ts                   # gemini-2.5-flash client + schema
│   ├── types.ts                    # Shared types (Heritage, Fabric, …)
│   └── utils.ts                    # cn(), formatters
├── public/                         # favicon + grain texture
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Local development

```bash
cd Bypic
cp .env.example .env.local        # add GEMINI_API_KEY (optional — fallback works)
npm install
npm run dev                       # http://localhost:3000
```

Useful scripts:

```bash
npm run dev      # Next.js dev server
npm run build    # Production build (used for Vercel deploy)
npm run start    # Run the production build locally
npm run lint     # ESLint
```

## Environment configuration

Copy `.env.example` to `.env.local` (or set in Vercel project settings):

| Variable          | Required | Notes                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------- |
| `GEMINI_API_KEY`  | optional | Enables real `gemini-2.5-flash` vision analysis. Get a key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, the API falls back to a deterministic heuristic so the demo still works end-to-end. |

## Deployment

The app is a stock Next.js 15 project and deploys to Vercel with no extra configuration:

1. Import the `Bypic` directory as the project root in Vercel.
2. Add `GEMINI_API_KEY` (optional) in *Project → Settings → Environment Variables*.
3. Deploy — Vercel detects Next.js automatically.

## Built with Cursor AI

The entire prototype — copy, data, components, AI plumbing, and SVG fabric generator — was authored inside Cursor in a single working session. Cursor was used as a creative collaborator across:

- **Scaffolding** — Cursor generated the Next.js 15 + Tailwind v4 + TypeScript skeleton, custom theme, and base primitives.
- **Catalogue authoring** — instead of stock photos, Cursor and I co-designed the heritage-aware `FabricArtwork` SVG generator and seeded 30+ richly tagged fabrics with palettes that actually mean something to the ranker.
- **AI matcher** — Cursor wrote the Gemini vision prompt, the response schema, the CIELAB ΔE colour-distance maths, and the human-readable reasoning string used on each match card.
- **UX polish** — Framer Motion choreography, hydration-safe components, mobile breakpoints, and the auto-drafted RFQ message were all iterated through Cursor edits.
- **Debugging** — Cursor's terminal + browser tooling caught a palette-averaging bug (neutrals were skewing indigo to "earth-warm"), a Next.js workspace-root warning from a stray lockfile, and a dev-tools overlay intercepting the inquiry click.

The result: a credible, opinionated, and end-to-end clickable prototype in roughly one working day.

## Hackathon mapping

| Criterion                                | Where to look |
| ---------------------------------------- | ------------- |
| Relevance to the creative economy (30%)  | `/about`, `/marketplace`, `/suppliers/[id]` — heritage-led catalogue, Nigerian textile hubs, designer-first flows. |
| Functionality and completeness (30%)     | Marketplace filtering, fabric and supplier detail pages, AI matcher, working inquiry flow with mock API + localStorage. |
| Effective and creative use of Cursor AI (20%) | This README's *Built with Cursor AI* section, plus the bespoke `FabricArtwork` generator and `lib/matching.ts` ranker that Cursor co-authored. |
| Originality and innovation (20%)         | Mood-board → fabric matching with reasoning, procedurally drawn fabric artwork per heritage, auto-drafted RFQs grounded in supplier metadata. |

## License

Hackathon prototype — not yet licensed for production use.
