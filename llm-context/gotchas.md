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

Nodes can reference nodes in other zones via `edges.to`. These are intentional "bridge" edges. Validation and tests skip cross-zone edge reference checks (they don't verify the target node exists in the target zone).

## Content Validation

- Zod validation runs on every `getNodesByZone()` and `getZonesConfig()` call
- `validateEdgeReferences()` runs once in the home `page.tsx` at build time
- Invalid frontmatter throws with descriptive error including filename

## NodeGraph Complexity

NodeGraph.tsx (~633 lines) is the largest component. Key state:
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

## Resume Feature

- `ContentPanel` now requires `zoneId` and `zoneTitle` props — it calls `setLastNode()` whenever a node is opened.
- Resume uses `sessionStorage` (`infra-roadmap-session-active`) to distinguish returning users from in-session back-navigation.
- **New session**: `ResumeModal` (bottom notification card) appears if pref=`"ask"`. Auto-navigates if pref=`"always"`.
- **In-session (back from zone)**: A "Continue" button appears in the top bar instead of the modal.
- Resume navigates with `?focus=` (centers on node) not `?node=` (which opens ContentPanel).
- Settings page (`/settings`) is all client-side — server component only passes `allNodeIds` for stats display.
- Export/import uses a versioned JSON format (`version: 1`). `importAllData` replaces all localStorage keys.

## Pre-existing ESLint Warnings

The following lint errors exist in the codebase and are not new:
- `NodeGraph.tsx`: `nodesRef.current` and `anchorNodeRef.current` read inside `useMemo` — flagged by `react-hooks/refs`. These work correctly but violate the lint rule.
- `ContentPanel.tsx`, `SearchModal.tsx`, `ZoneMap.tsx`: `setState` called synchronously inside `useEffect` — flagged by `react-hooks/set-state-in-effect`.
