# Infra: Zero to Scale (SRE/DevOps Roadmap)

**SRE for everyone** — an interactive, graph-based roadmap for learning infrastructure, SRE, and DevOps. Live version at [roadmap.esc.sh](https://roadmap.esc.sh/)

Software runs on infrastructure, but most engineers never learn how it works. Whether you're a frontend developer curious about what happens after `git push`, a vibe coder who wants to actually deploy and run their product, or a sysadmin looking to level up — this roadmap is for you.

Instead of handing you a flat checklist of 200 tools to memorize, topics connect through natural questions like *"VMs are heavy... is there something lighter?"* — guiding you from first principles to production-grade infrastructure, one curiosity-driven step at a time.

## Features

- **Question-driven navigation** — edges between nodes are written as the questions a learner would actually ask, not chapter titles
- **Progressive disclosure** — only the next step is revealed; the graph expands as you explore
- **Entry point selector** — "Where do I start?" guides you to the right starting node based on your background
- **⌘K search** — find any topic across all zones instantly
- **Progress tracking** — milestones and completion state persist in browser localStorage
- **Cross-zone edges** — topics link across zones where they naturally connect
- **Fully static, works offline** — no backend, no account required
- **Markdown-based content** — easy to read, contribute to, and extend

## Tech Stack

- **Next.js** (App Router, TypeScript, Tailwind CSS v4)
- **@xyflow/react** (React Flow) for graph visualization
- **gray-matter** + **react-markdown** for markdown content
- **Zod** for content validation

## Getting Started Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the roadmap.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
content/
  _zones.yaml             # Zone definitions (id, title, color, position, active flag)
  foundations/            # Markdown files per zone
  building/
  networking/
  running/
  scaling/
  delivery/
  containers/
  kubernetes/
  kubernetes-production/
  observability/
  platform/
  self-hosting/
src/
  app/
    page.tsx              # Home — zone map (server component)
    HomeClient.tsx        # Client wrapper for ZoneMap
    [zoneId]/
      page.tsx            # Server component — loads zone data
      ZoneClient.tsx      # Client wrapper for NodeGraph
    error.tsx             # Error boundary
    not-found.tsx         # Custom 404
  components/
    ZoneMap.tsx           # Bird's-eye view of all zones
    NodeGraph.tsx         # Zone detail — progressive disclosure graph
    NodeCard.tsx          # Custom React Flow node component
    QuestionNode.tsx      # Edge question pill shown between content nodes
    ContentPanel.tsx      # Slide-in panel for node content, milestones, resources
    EntryPointSelector.tsx  # "Where do I start?" audience-based entry point modal
    SearchModal.tsx       # ⌘K search across all zones and nodes
    ZonePortalCard.tsx    # Cross-zone edge destination node
    HelpModal.tsx         # Keyboard shortcuts and usage hints
  lib/
    content.ts            # Server-side content parsing
    validation.ts         # Zod schemas for content validation
    progress.ts           # localStorage progress tracking
    types.ts              # TypeScript types
```

## Adding Content

**New node in an existing zone:**
1. Create `content/<zone-id>/<node-slug>.md` with YAML frontmatter (id, title, zone, edges, difficulty, tags, category, milestones)
2. Add body content with `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` section markers
3. Ensure edge references match existing node IDs

**Activate a new zone:**
1. Create `content/<zone-id>/` directory with node markdown files
2. Set `active: true` for that zone in `content/_zones.yaml`
