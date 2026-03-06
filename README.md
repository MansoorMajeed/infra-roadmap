# Infra: Zero to Scale (SRE/DevOps Roadmap)

**SRE for everyone** — an interactive, graph-based roadmap for learning infrastructure, SRE, and DevOps. Live version at [roadmap.esc.sh](https://roadmap.esc.sh/)

Software runs on infrastructure, but most engineers never learn how it works. Whether you're a frontend developer curious about what happens after `git push`, a vibe coder who wants to actually deploy and run their product, or a sysadmin looking to level up, or even a fellow self-hosting enthusiast who wants to learn more — this roadmap is for you.

Instead of handing you a flat checklist of 200 tools to memorize, topics connect through natural questions like *"I keep SSHing in to fix things manually — there has to be a better way, right?"* — guiding you from first principles to production-grade infrastructure, one curiosity-driven step at a time.

<video src="https://github.com/user-attachments/assets/e595f900-894a-45eb-9769-0874b0708791" controls width="100%"></video>

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

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the roadmap.

Other commands: `npm run build` | `npm run lint` | `npm run test`

## Contributing

Contributions welcome! The easiest way to contribute is by adding or improving content.

**Add a node to an existing zone:**
1. Create `content/<zone-id>/<node-slug>.md` with YAML frontmatter (id, title, zone, edges, difficulty, tags, category, milestones)
2. Add body content with `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` section markers
3. Ensure edge references match existing node IDs

**Activate a new zone:**
1. Create `content/<zone-id>/` directory with node markdown files
2. Set `active: true` for that zone in `content/_zones.yaml`
