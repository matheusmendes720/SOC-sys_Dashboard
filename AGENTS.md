# AGENTS.md

**AXE-GUARD SOC SUITE** — a high-fidelity Security Operations Center (SOC) dashboard. Pure-frontend **by usage** (no `src/` file imports a backend SDK or `@google/genai`): a custom `MetricsEngine` simulates telemetry in-memory. `package.json` nevertheless ships `express`, `tsx`, `dotenv`, and `@google/genai` as latent dependencies — mirroring `PetroShield_Finance-CyberSec`'s toolchain but **not consumed by the app**. Vite + React 19 + TypeScript + Tailwind v4 + Motion + Recharts + lucide-react. Apache-2.0 licensed. This fork lives in the parent `central/` workspace and is committed to its own git repo.

> **Read first** before non-trivial edits: `ARCHITECTURE.md` (BFF pattern, MetricsEngine, data flow) and `DEVELOPMENT.md` (extending agents, sim params, TUI commands). This AGENTS.md is the cross-agent orientation layer; those two docs go deeper and this file defers to them.

## Setup commands

- Install: `npm install` · Dev: `npm run dev` (Vite on `0.0.0.0:3000`) · Build: `npm run build` · Preview: `npm run preview`
- Lint / typecheck: `npm run lint`  *(alias for `tsc --noEmit`)*
- Test: none configured.

## Environment variables

- `GEMINI_API_KEY` — read by `vite.config.ts` and injected into the client bundle as `process.env.GEMINI_API_KEY` via `define:`. **Not consumed by any `src/` file** (the `@google/genai` dep is latent); placeholder only.
- `DISABLE_HMR` — set to `true` to disable Vite HMR (used by AI Studio's agent-edit loop to avoid flicker during file watching).

See `.env.example` in this repo for the canonical template.

## Project layout

```
SOC-sys_Dashboard/
├── src/
│   ├── App.tsx              # Root orchestrator
│   ├── main.tsx             # Vite entry point
│   ├── index.css            # Tailwind v4 + global TUI theme tokens
│   ├── components/          # Bento-grid widgets
│   └── services/            # MetricsEngine — heuristic synthesis + agentic state
├── ARCHITECTURE.md          # Deep dive: BFF pattern, MetricsEngine, data flow
├── DEVELOPMENT.md           # How to extend: new agents, sim params, TUI cmds
├── index.html               # Vite root HTML
├── metadata.json            # AI Studio export metadata
├── vite.config.ts           # Vite + @tailwindcss/vite + GEMINI_API_KEY define
└── tsconfig.json            # TypeScript (NOT strict — see Code style)
```

## Core architecture (1-minute version)

1. **Ticker** — `MetricsEngine` ticks every 1000 ms.
2. **Snapshot** — `generateSnapshot()` returns a **new object literal** (no deep clones) keyed off current `MetricsConfig` (Sensitivity/Speed).
3. **Propagation** — `App.tsx` receives the snapshot and pushes it via props to every Bento-Grid cell.
4. **Local buffering** — chart components maintain 60-point sliding windows for time-series visualizers.

When adding a new metric field, the order of operations is **non-negotiable** (from `ARCHITECTURE.md` §7):

1. Update the `MetricSnapshot` / `MetricsConfig` interface in `src/services/metricsService.ts`.
2. Update the `initialize()` method so backfilled history doesn't flatline on cold start.
3. Have `generateSnapshot()` return a new object literal.

## Design tokens

- Background: `#020205` (`bg-deep-void`)
- Accent greens for "system normal" / orchestration; cyans for terminal/live tooling
- Defined as CSS variables in `index.css` under `@theme` (Tailwind v4)
- Use `text-[9px]` / `text-xs` for technical metadata; never responsive text that breaks TUI alignment
- Strict character-cell grid: fixed-aspect Bento cells, independent scroll zones, 90% data-ink ratio

## Code style

- TypeScript — `tsconfig.json` does **not** enable `"strict": true` (out of scope for this audit).
- Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`).
- React 19 + functional components + hooks; `motion` (Framer Motion) for animation; `lucide-react` for icons; Recharts for time-series charts.
- `@/*` path alias maps to the repo root in both `tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias`).
- **State management**: local React state + props only. No Redux / Zustand / Context — any reference to "Redux" elsewhere (e.g. the parent workspace map) is stale.
- No ESLint / Prettier configured — `npm run lint` is just `tsc --noEmit`.
- Components are **molecular**: decompose complex widgets into "atoms" (Status LEDs, Sparklines, Metadata Tags). Don't reach for a new abstraction unless it earns its place.

## Branching & commits

- Has its own `.git/` — branch and commit inside this sub-repo.
- Conventional commits where it makes sense (`feat:` / `fix:` / `docs:` / `refactor:`).

## License

Apache-2.0 licensed. (No `LICENSE` file currently ships in this sub-repo — please add one before publishing.)

## Related sub-projects (sibling, not imported)

- `../AXE-Guard_Muilti_Agents-Shell/` — Gemini-powered shell half of AxeGuard (this dashboard is the pure simulation half).
- `../PetroShield_Finance-CyberSec/` — the Prisma+SQLite backend half (real data + API).
- `../../PetroShield-GranPrix_Nacional_2026/` — the competition strategy dossier this product is being pitched against.