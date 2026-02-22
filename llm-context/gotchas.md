# Gotchas & Known Issues

## Must Know

- **Don't import `js-yaml`** — lacks type declarations. Parse YAML through `gray-matter` instead (wrap raw YAML in `---` delimiters).
- **`useNodesState` only initializes once** — use controlled state (`useState` + `applyNodeChanges`) when nodes update dynamically (NodeGraph does this).
- **Zone nodes need invisible `<Handle>` components** for React Flow edges to connect.
- **User prefers to run `npm install` and `npm run build` themselves** — don't run these without asking.
- **`useSearchParams` requires Suspense boundary** — ZoneClient wraps its inner component in `<Suspense>`.
- **Next.js 16 `params` is a Promise** — must `await params` in server components (see `zone/[zoneId]/page.tsx`).
- **`nodeTypes` must be defined outside the component** — if defined inside, React Flow re-registers types on every render and nodes flicker.

## Cross-Zone Edges

Nodes can reference nodes in other zones via `edges.to`. These are intentional "bridge" edges. Since inactive zones have no content files yet, validation and tests skip cross-zone edge references.

Example: `programming-fundamentals` → `what-is-a-web-service` (foundations → building)

## Content Validation

- Zod validation runs on every `getNodesByZone()` and `getZonesConfig()` call
- `validateEdgeReferences()` runs once in the home `page.tsx` at build time
- Invalid frontmatter throws with descriptive error including filename

## NodeGraph Complexity

NodeGraph.tsx (~870 lines) is the largest component. Key state:
- `visibleIds: Set<string>` — which content nodes are shown
- `progressMap: Map<string, NodeStatus>` — node completion status, re-computed when user marks progress
- `selectedNode: RoadmapNode | null` — opens ContentPanel
- `zoomLocked: boolean` — prevent auto-zoom on expand

The layout function (`layoutNodes`) is called in `useMemo`. It injects synthetic `QuestionNode`s into the dagre graph for every visible intra-zone edge, so question nodes are never in `visibleIds` but always in the React Flow nodes array.

## Question Nodes

- IDs are prefixed `q-` (e.g. `q-hello-world-how-computers-run-code`)
- They are not in `visibleIds` — they are synthetic, created purely in `layoutNodes`
- `handleNodeClick` returns early for `q-` nodes; the component handles its own click state
- Do NOT inject a question node for portal edges (cross-zone) — those go direct source → portal

## Pre-existing ESLint Warnings

The following lint errors exist in the codebase and are not new:
- `NodeGraph.tsx`: `nodesRef.current` and `anchorNodeRef.current` read inside `useMemo` — flagged by `react-hooks/refs`. These work correctly but violate the lint rule.
- `ContentPanel.tsx`, `SearchModal.tsx`, `ZoneMap.tsx`: `setState` called synchronously inside `useEffect` — flagged by `react-hooks/set-state-in-effect`.
