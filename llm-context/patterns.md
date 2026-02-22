# Patterns & Conventions

## Data Flow

```
content/*.md → content.ts (server, gray-matter + Zod) → page.tsx (server component) → Client component (props)
```

- No API routes. All content loaded at build time via server components.
- `/` route: `page.tsx` → `HomeClient` → `ZoneMap`
- `/zone/[zoneId]` route: `page.tsx` → `ZoneClient` → `NodeGraph`

## React Flow Usage

- **ZoneMap**: `useNodesState`/`useEdgesState` (nodes don't change dynamically)
- **NodeGraph**: Controlled state (`useState` + `applyNodeChanges`) because nodes expand/collapse dynamically. Wrapped in `ReactFlowProvider`.
- Custom node types registered via `nodeTypes` object **outside** the component (prevents re-registration on every render).
- Invisible `<Handle>` components needed on zone cards for edges to connect.

## Progressive Disclosure (NodeGraph)

1. Find root nodes (no incoming intra-zone edges)
2. Initial visible = roots + their direct children
3. Click `+` → add that node's children to visible set
4. Click `-` → remove all descendants from visible set
5. "Show All" → make all nodes visible
6. Visible set persisted to localStorage per zone

## Layout Algorithm

Dagre (`@dagrejs/dagre`, `rankdir: TB`, `ranksep: 120`, `nodesep: 100`).

Each content edge `A → B` is represented in the dagre graph as `A → q-A-B → B`, where `q-A-B` is a synthetic `QuestionNode`. This means:
- Dagre guarantees question nodes never overlap content nodes
- Multiple outgoing edges from the same source are spread horizontally by dagre automatically
- No post-processing or collision hacks needed

## Question Nodes

Question nodes (`type: questionNode`, id prefix `q-`) are synthetic nodes injected by `layoutNodes` for every visible intra-zone edge. They are **not** in `visibleIds` — they appear/disappear automatically when their target content node is added/removed from `visibleIds`. The `QuestionNode` component handles its own click/popover state internally; `handleNodeClick` in `NodeGraph` skips them with an early return.

## Cross-Zone Edges

Some nodes have `edges.to` entries with an explicit `zone:` field, pointing to nodes in other zones. These render as `ZonePortalCard` nodes at the end of the edge — no `QuestionNode` is injected for portal edges. Clicking a portal navigates to the target zone.

## Content Parsing

```
markdown file → gray-matter (frontmatter + body) → Zod validate frontmatter → parseContent(body)
```

`parseContent` splits on `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` markers → `{ summary, deepDive, resources }`

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `infra-roadmap-progress` | Node completion status + milestones |
| `infra-roadmap-visible-nodes` | Which nodes are expanded per zone |
| `infra-roadmap-viewport` | Zoom/pan position per zone |
| `infra-roadmap-zoom-lock` | Boolean: lock zoom on expand |
| `infra-roadmap-hint-dismissed` | Boolean: hide first-visit hint banner |

## Styling

- Tailwind v4 with dark mode support (`dark:` variants throughout)
- Difficulty colors: 1=green, 2=yellow, 3=red
- Node status borders: not-started=rose, in-progress=blue (with ring), completed=green
- Category icons: concept=💡, tool=🔧, practice=📋, principle=🎯
- Zone colors defined in `_zones.yaml` (hex values)
- Question nodes: small italic pill, same visual style as the old edge labels (white/semi-transparent bg, subtle border, blue on hover/open)
