# CLAUDE.md

## Project Overview

Interactive SRE/DevOps roadmap — a graph-based, question-driven learning tool. Each topic connects to the next through a natural question ("VMs are heavy... is there something lighter?"). Built with Next.js, React Flow, and markdown content files.

See `PLAN.md` for full architecture and `TASKS.md` for current work items.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **@xyflow/react** (React Flow) for graph visualization
- **gray-matter** for parsing YAML frontmatter from markdown
- **react-markdown** + **remark-gfm** for rendering content

## Architecture

### Content (content/)
- `_zones.yaml` — zone definitions (7 zones, colors, positions, which are active)
- `content/<zone-id>/*.md` — one markdown file per node
- Each .md has YAML frontmatter (id, title, zone, edges with questions, difficulty, tags, category, milestones) and body sections separated by `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` markers
- Currently only Zone 1 (foundations/) has content (10 nodes). Other zones exist in _zones.yaml but are marked `active: false`

### Server / Build (src/lib/)
- `types.ts` — TypeScript types for Node, Edge, Zone, Progress
- `content.ts` — server-side functions to parse markdown files and build graph data. Uses `gray-matter` for frontmatter and custom parsing for the DEEP_DIVE/RESOURCES sections. Reads `_zones.yaml` by wrapping it in frontmatter delimiters and parsing with gray-matter (no direct js-yaml import — causes type errors)
- `progress.ts` — client-side localStorage helper for tracking node completion and milestones

### UI (src/components/)
- `ZoneMap.tsx` — bird's eye view showing 7 zone cards as React Flow nodes with edges between them
- `NodeGraph.tsx` — zone detail view with progressive disclosure (starts with roots + 1 level, expand via "+" buttons). Wrapped in ReactFlowProvider. Uses controlled node state (not useNodesState) so expand/collapse works
- `NodeCard.tsx` — custom React Flow node component with difficulty colors, category icons, completion status, and expand button
- `ContentPanel.tsx` — centered modal (not sidebar) showing node content with summary, expandable deep dive, milestones, resources, and "where to go next" navigation
- `EntryPointSelector.tsx` — "Where do I start?" modal with 5 audience-based entry points

### Pages (src/app/)
- `page.tsx` — server component that loads zones config and node data, passes to HomeClient
- `HomeClient.tsx` — client component managing zone/node navigation state
- `layout.tsx` — root layout with fonts and metadata
- `globals.css` — Tailwind imports + custom `.content-prose` styles for markdown rendering

## Key Patterns

- **Server → Client data flow**: `page.tsx` reads all content at build time (server component), serializes it, and passes to `HomeClient.tsx` (client component). No API routes.
- **Progressive disclosure**: NodeGraph starts with root nodes + their direct children visible. Clicking "+" on a node reveals its children. "Show All" button reveals everything.
- **Graph layout**: Topological sort via BFS from root nodes, arranged in rows by depth.
- **Progress**: localStorage under key `sre-roadmap-progress`. Schema: `{ nodes: { [id]: { status, completedAt, milestones[] } }, entryPoint }`.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build (validates content parsing works)
- `npm run lint` — ESLint

## Adding Content

To add a new node to an existing zone:
1. Create `content/<zone-id>/<node-slug>.md` with proper frontmatter
2. Ensure `edges.from` references exist in other nodes' `edges.to` and vice versa
3. The node will automatically appear in the graph

To activate a new zone:
1. Create `content/<zone-id>/` directory with node .md files
2. Set `active: true` for that zone in `_zones.yaml`

## Gotchas

- Don't import `js-yaml` directly — it lacks type declarations. Parse YAML through `gray-matter` instead.
- `useNodesState` from React Flow only initializes once — use controlled state (`useState` + `applyNodeChanges`) if nodes need to update dynamically.
- Zone nodes in ZoneMap need invisible `<Handle>` components for edges to connect properly.
- The user prefers to run `npm install` and `npm run build` themselves — don't run these without asking.
