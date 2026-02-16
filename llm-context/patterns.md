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
- Custom node types registered via `nodeTypes` object outside component.
- Invisible `<Handle>` components needed on zone cards for edges to connect.

## Progressive Disclosure (NodeGraph)

1. Find root nodes (no incoming intra-zone edges)
2. Initial visible = roots + their direct children
3. Click `+` → add that node's children to visible set
4. Click `-` → remove all descendants from visible set
5. "Show All" → make all nodes visible
6. Visible set persisted to localStorage per zone

## Layout Algorithm

- BFS from roots through visible nodes
- Assign depth = max distance from any root
- Group by depth, center each row horizontally
- xSpacing=320, ySpacing=200

## Content Parsing

```
markdown file → gray-matter (frontmatter + body) → Zod validate frontmatter → parseContent(body)
```

`parseContent` splits on `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` markers → `{ summary, deepDive, resources }`

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `sre-roadmap-progress` | Node completion status + milestones |
| `sre-roadmap-visible-nodes` | Which nodes are expanded per zone |
| `sre-roadmap-viewport` | Zoom/pan position per zone |
| `sre-roadmap-zoom-lock` | Boolean: lock zoom on expand |

## Cross-Zone Edges

Some nodes have `edges.to` pointing to nodes in other zones (e.g., `programming-fundamentals` → `what-is-a-web-service` in building zone). These are valid — they won't render in the graph until the target zone is active. Validation skips these.

## Styling

- Tailwind v4 with dark mode support (`dark:` variants throughout)
- Difficulty colors: 1=green, 2=yellow, 3=red
- Node status borders: not-started=rose, in-progress=blue (with ring), completed=green
- Category icons: concept=💡, tool=🔧, practice=📋, principle=🎯
- Zone colors defined in `_zones.yaml` (hex values)
