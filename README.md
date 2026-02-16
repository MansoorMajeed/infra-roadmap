# Infra: Zero to Scale

**SRE for everyone** — an interactive, graph-based roadmap for learning infrastructure, SRE, and DevOps.

Software runs on infrastructure, but most engineers never learn how it works. Whether you're a frontend developer curious about what happens after `git push`, a vibe coder who wants to actually deploy and run their product, or a sysadmin looking to level up — this roadmap is for you.

Instead of handing you a flat checklist of 200 tools to memorize, topics connect through natural questions like *"VMs are heavy... is there something lighter?"* — guiding you from first principles to production-grade infrastructure, one curiosity-driven step at a time.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **@xyflow/react** (React Flow) for graph visualization
- **gray-matter** + **react-markdown** for markdown content
- **Zod** for content validation

## Getting Started

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
  _zones.yaml          # Zone definitions (7 zones, colors, positions)
  foundations/          # Markdown files for Zone 1 (10 nodes)
src/
  app/
    page.tsx            # Home — zone map (server component)
    HomeClient.tsx      # Client wrapper for ZoneMap
    zone/[zoneId]/      # Dynamic route for zone detail view
      page.tsx          # Server component — loads zone data
      ZoneClient.tsx    # Client wrapper for NodeGraph
    error.tsx           # Error boundary
    not-found.tsx       # Custom 404
  components/
    ZoneMap.tsx          # Bird's-eye view of all zones
    NodeGraph.tsx        # Zone detail — progressive disclosure graph
    NodeCard.tsx         # Custom React Flow node component
    ContentPanel.tsx     # Modal for node content
    EntryPointSelector.tsx # "Where do I start?" selector
  lib/
    content.ts           # Server-side content parsing
    validation.ts        # Zod schemas for content validation
    progress.ts          # localStorage progress tracking
    types.ts             # TypeScript types
```

## Adding Content

**New node in an existing zone:**
1. Create `content/<zone-id>/<node-slug>.md` with YAML frontmatter (id, title, zone, edges, difficulty, tags, category, milestones)
2. Add body content with `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` section markers
3. Ensure edge references match existing node IDs

**Activate a new zone:**
1. Create `content/<zone-id>/` directory with node markdown files
2. Set `active: true` for that zone in `content/_zones.yaml`

See [PLAN.md](./PLAN.md) for full architecture details.
