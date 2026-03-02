# CLAUDE.md

## Quick Start

Interactive SRE/DevOps roadmap — graph-based, question-driven learning tool. Next.js 16 + React Flow + markdown content.

**Commands:** `npm run dev` | `npm run build` | `npm run test` | `npm run lint`

**Don't run `npm install` or `npm run build` without asking the user first.**

## Detailed Context (read these instead of re-reading source files)

- **`llm-context/file-map.md`** — every file, what it does, key exports, line counts
- **`llm-context/patterns.md`** — data flow, React Flow usage, layout algorithm, localStorage keys, styling conventions
- **`llm-context/gotchas.md`** — things that will trip you up, known issues, NodeGraph complexity notes

## Architecture Decision Records

Non-obvious decisions are documented in `docs/adr/`. Read the relevant ADR before changing anything related to layout, rendering, or content parsing.

- **[ADR-0001](docs/adr/0001-dagre-layout-no-fork-join-correction.md)** — Why we don't post-process Dagre's layout (fork-join correction was removed)

## Routes

| URL | Server Component | Client Component |
|-----|-----------------|------------------|
| `/` | `src/app/page.tsx` | `HomeClient.tsx` → `ZoneMap` |
| `/[zoneId]` | `src/app/[zoneId]/page.tsx` | `ZoneClient.tsx` → `NodeGraph` |
| `/nonexistent` | → `not-found.tsx` (404) | — |

## Key Rules

- Don't import `js-yaml` directly — parse YAML through `gray-matter`
- `useNodesState` only initializes once — use controlled state for dynamic updates (NodeGraph does this)
- Zone nodes need invisible `<Handle>` components for edges
- Next.js 16: `params` is a Promise — must `await params` in server components
- `useSearchParams` requires a `<Suspense>` boundary
- Cross-zone edges are valid — nodes can reference nodes in other (inactive) zones. They require an explicit `zone:` field on the `to` entry:
  ```yaml
  to:
    - id: "installing-software"
      zone: "running"
      question: "..."
  ```
  Intra-zone edges do NOT have a `zone:` field. Validation skips cross-zone edge references.

## Adding Content

1. Create `content/<zone-id>/<node-slug>.md` with proper frontmatter (see `llm-context/file-map.md` for shape)
2. Ensure intra-zone `edges.to` IDs reference existing nodes
3. To activate a zone: set `active: true` in `content/_zones.yaml`

### Frontmatter edges format

Edges are **outgoing only** — defined with `edges.to` on the source node. There is no `edges.from` field; incoming edges are implied by other nodes' `to` entries.

```yaml
edges:
  to:
    - id: "next-node-slug"
      question: "..."
      detail: "..."          # optional
    - id: "other-node"
      zone: "other-zone"     # cross-zone edges only
      question: "..."
```

Nodes with no outgoing edges can omit `edges` entirely.

## Graph Design Principles

**Branch out, don't go linear.** The whole point of the graph format is that people at different levels can take different paths. When a topic needs deeper explanation, create a side branch — not extra steps on the main path.

The pattern:
- Main path: A → B → C (for people who already know the topic)
- Side branch off A: A → A1 → A2 → A3 → B (for people who need to learn it)
- B gets two incoming edges: one from A (skip), one from A3 (branch end)

This means someone who knows Docker can go straight from `docker-for-self-hosting` → `docker-compose`. Someone who doesn't can branch through `docker-ports` → `docker-volumes` → `docker-networking` → `docker-compose`.

**When to branch:**
- A concept is a prerequisite but not everyone needs it explained
- A topic is large enough to deserve 2+ nodes of explanation
- You'd otherwise force knowledgeable users through beginner content

**Never insert explanation nodes into the middle of the main path.** That forces everyone through them regardless of background.

## Writing Edge Questions

Edge questions are what the user clicks to move to the next node. They must be written from the user's perspective — their problem, not the answer.

**The question (`question:`) must:**
- Express the user's felt problem or curiosity, never name-drop the solution
- Be something a person who has never heard of the next node could still say
- Feel like a natural thought, not a chapter title

```yaml
# Wrong — names the solution before the user knows it exists
question: "How do I set it up with ArgoCD?"

# Wrong — sounds like a textbook heading
question: "I want to learn about GitOps."

# Right — expresses the problem in the user's own words
question: "My manifests are in Git — how do I make the cluster apply them automatically when I merge?"
```

The one exception: if the user just finished a node *about* a tool, they now know its name. Referring to it in the next edge question is fine.

**The detail field (`detail:`) must:**
- Be written in the user's voice — first person, as if they're thinking aloud or elaborating on their own question
- Deepen the tension or make the user feel the problem more acutely
- Ask a question they hadn't considered, or reveal a hidden complexity
- Never start answering — the answer is in the next node

```yaml
# Wrong — narrator voice, starts explaining the solution
detail: "Terraform is the dominant IaC tool. You write HCL configs and it figures out what to create."

# Wrong — narrator voice, even though it doesn't answer
detail: "Every server you've set up manually is a liability. You can't recreate it or hand it to someone else."

# Right — user's voice, elaborating on their own pain
detail: "If a server dies tonight I have no idea how to recreate it. I've been making changes by hand and none of it is documented anywhere. What do I even do?"
```

Think of `detail` as the user continuing to think out loud — more of their problem, not the beginning of the answer.

## Content Formatting

Use markdown headings inside node body content — not `**bold text**` as fake headings.

Heading hierarchy:
- `##` — major sections within the deep dive (e.g. `## Why would you want this?`, `## The performance question`)
- `###` — subsections within a major section (e.g. `### Snapshots and backups`, `### Safe experimentation`)

Reserve `**bold**` for emphasis within prose, not as section titles. The summary section (before `<!-- DEEP_DIVE -->`) is usually short prose with no headings needed.

See `PLAN.md` for full architecture and `TASKS.md` for current work items.

## LLM Context Maintenance

After any major code change (new component, deleted component, significant refactor, changed data flow), update the relevant files in `llm-context/`:

- **`file-map.md`** — add/remove/update component entries (line counts, purpose, key exports)
- **`patterns.md`** — update if data flow, layout algorithm, localStorage keys, or styling conventions changed
- **`gotchas.md`** — update key state list, add new gotchas, remove stale ones

Do this as the final step of the implementation, not as a separate task.

## Planning Workflow

For non-trivial tasks, always write the plan to a dedicated markdown file (e.g. `PLAN-<feature-name>.md`) before implementing. The user will annotate it with `n2c:` (note to claude) inline. Read and incorporate all `n2c:` annotations into the plan, then clean up the annotations from the file. **Do not start implementing until the user verbally says the plan looks good.**
