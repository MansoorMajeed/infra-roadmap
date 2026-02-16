# CLAUDE.md

## Quick Start

Interactive SRE/DevOps roadmap — graph-based, question-driven learning tool. Next.js 16 + React Flow + markdown content.

**Commands:** `npm run dev` | `npm run build` | `npm run test` | `npm run lint`

**Don't run `npm install` or `npm run build` without asking the user first.**

## Detailed Context (read these instead of re-reading source files)

- **`llm-context/file-map.md`** — every file, what it does, key exports, line counts
- **`llm-context/patterns.md`** — data flow, React Flow usage, layout algorithm, localStorage keys, styling conventions
- **`llm-context/gotchas.md`** — things that will trip you up, known issues, NodeGraph complexity notes

## Routes

| URL | Server Component | Client Component |
|-----|-----------------|------------------|
| `/` | `src/app/page.tsx` | `HomeClient.tsx` → `ZoneMap` |
| `/zone/[zoneId]` | `src/app/zone/[zoneId]/page.tsx` | `ZoneClient.tsx` → `NodeGraph` |
| `/zone/nonexistent` | → `not-found.tsx` (404) | — |

## Key Rules

- Don't import `js-yaml` directly — parse YAML through `gray-matter`
- `useNodesState` only initializes once — use controlled state for dynamic updates (NodeGraph does this)
- Zone nodes need invisible `<Handle>` components for edges
- Next.js 16: `params` is a Promise — must `await params` in server components
- `useSearchParams` requires a `<Suspense>` boundary
- Cross-zone edges are valid — nodes can reference nodes in other (inactive) zones

## Adding Content

1. Create `content/<zone-id>/<node-slug>.md` with proper frontmatter (see `llm-context/file-map.md` for shape)
2. Ensure intra-zone `edges.to` IDs reference existing nodes
3. To activate a zone: set `active: true` in `content/_zones.yaml`

See `PLAN.md` for full architecture and `TASKS.md` for current work items.
