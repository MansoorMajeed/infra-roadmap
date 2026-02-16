# Gotchas & Known Issues

## Must Know

- **Don't import `js-yaml`** — lacks type declarations. Parse YAML through `gray-matter` instead (wrap raw YAML in `---` delimiters).
- **`useNodesState` only initializes once** — use controlled state (`useState` + `applyNodeChanges`) when nodes update dynamically (NodeGraph does this).
- **Zone nodes need invisible `<Handle>` components** for React Flow edges to connect.
- **User prefers to run `npm install` and `npm run build` themselves** — don't run these without asking.
- **`useSearchParams` requires Suspense boundary** — ZoneClient wraps its inner component in `<Suspense>`.
- **Next.js 16 `params` is a Promise** — must `await params` in server components (see `zone/[zoneId]/page.tsx`).

## Cross-Zone Edges

Nodes can reference nodes in other zones via `edges.to`. These are intentional "bridge" edges. Since inactive zones have no content files yet, validation and tests skip cross-zone edge references.

Example: `programming-fundamentals` → `what-is-a-web-service` (foundations → building)

## Content Validation

- Zod validation runs on every `getNodesByZone()` and `getZonesConfig()` call
- `validateEdgeReferences()` runs once in the home `page.tsx` at build time
- Invalid frontmatter throws with descriptive error including filename

## NodeGraph Complexity

NodeGraph.tsx (~607 lines) is the largest component. Key state:
- `visibleIds: Set<string>` — which nodes are shown
- `selectedNode: RoadmapNode | null` — opens ContentPanel
- `allEdgesExpanded: boolean` — show/hide question labels
- `zoomLocked: boolean` — prevent auto-zoom on expand
- `refreshKey: number` — force re-layout on progress change

All persisted to localStorage. The layout function (`layoutNodes`) is called in `useMemo` and creates React Flow node objects with expand/collapse callbacks baked into `data`.
