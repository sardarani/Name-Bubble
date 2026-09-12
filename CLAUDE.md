# PALS-CCode

Product Anatomy live-session workspace for **NameGenius**: a business-name generator for solo founders. This folder is a lab, not a monorepo with a shared build. Several prototypes sit side by side; pick the one that matches the task.

## Layout

| Path | What it is |
|---|---|
| `index.html`, `app.js`, `style.css` | Vanilla prototype. Keyword → 10 names (Groq if a key is stored, else offline generator) → live `.com` RDAP checks. |
| `namegenius/` | Full React + Vite + Tailwind 3 app. Brief → results → shortlist / compare / questions. Names from `src/generator.js` (deterministic, no API). |
| `result-card-app/` | Later UI pass of the same flow. Mock pool in `src/data.js` (`pickBatch`). Dev server port **5178**. |
| `s3-card-app/` | Isolated **result card** gallery (available / taken / loading). Mock data only. Port **5190**. |
| `design/`, `wireframe/`, `s3-card/` | HTML / Paper canvas comps. Treat as visual references, not runtime code. |
| `.claude/skills/prompt-enhancer/` | Required brief (Bar / Reference / Limits / Check) before writing UI. |

There is no root `package.json`. Each Vite app has its own.

## Commands

```bash
# Vanilla prototype — open index.html, or any static server from repo root
python3 -m http.server 8080

# Full product (Tailwind 3, generator.js)
cd namegenius && npm install && npm run dev    # port 5180

# UI flow with mock names
cd result-card-app && npm install && npm run dev  # port 5178

# Result-card gallery
cd s3-card-app && npm install && npm run dev     # port 5190
```

`.claude/launch.json` starts `result-card-app` and `s3-card-app` for Claude Code.

## Product behavior (keep these)

- **Screens:** brief (name, description, competitors, TLD) → results → shortlist, compare (max 2), brand-discovery questions.
- **Regen:** after 3 regenerations without a shortlist/compare action, surface the next unanswered question inline; answering it regenerates.
- **TLDs:** `.com` / `.io` / `.co` (and `.ai` in some mocks). Availability is **mocked** in the React apps; only the vanilla `app.js` hits Verisign RDAP.
- **Vanilla AI:** optional Groq key in `localStorage` (`namegenius_groq_api_key`), model `llama-3.1-8b-instant`. Never commit keys.

## Code conventions

- React 19, Vite, JSX (no TypeScript). Prefer functional components and colocated state in `App.jsx`.
- Tailwind: `namegenius` uses v3 + PostCSS; `result-card-app` and `s3-card-app` use v4 via `@tailwindcss/vite`.
- Name items in `namegenius` look like `{ name, slug, tlds, tags }`. Helpers live in `src/data.js`; generation in `src/generator.js`.
- `namegenius` also has Figma preview entries (`mainFigma.jsx`, `ResultCardFigma.jsx`) — do not mix those into the main `main.jsx` tree unless asked.
- UI work: follow `.claude/skills/prompt-enhancer/SKILL.md` (approve a four-line brief, then build one screen).
- Verify UI in the browser (or the closest substitute) before calling a visual change done.

## Do not

- Treat design HTML as the source of truth for app logic.
- Add a backend, auth, or real domain APIs to the React apps unless the user asks.
- Install new dependencies without a reason that the current stack cannot cover.
- Commit `node_modules`, `.env`, or Groq keys.
