# File Map

Quick reference for every file in the project and what it does.

## Content Layer (`content/`)

| File | Purpose |
|------|---------|
| `_zones.yaml` | 12 zone definitions: id, title, coreQuestion, description, color, position, active flag. Also `zoneEdges` array. All zones are `active: true`. |
| `<zone>/*.md` | Node content per zone. YAML frontmatter + markdown body split by `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` markers. |

### Active zones (12)
foundations, building, networking, running, scaling, delivery, containers, kubernetes, kubernetes-production, observability, platform, self-hosting

### Node frontmatter shape
```yaml
id: "hello-world"
title: "Hello, World!"
zone: "foundations"
edges:
  to:
    - id: "how-computers-run-code"
      question: "I wrote code and it ran... but how?"
      detail: "optional longer explanation"
difficulty: 1  # 1-3
tags: ["programming", "beginner"]
category: "concept"  # concept | tool | practice | principle
milestones:
  - "Write and run a Hello World program"
```

## Server/Lib (`src/lib/`)

| File | Purpose | Key exports |
|------|---------|-------------|
| `types.ts` | All TypeScript interfaces | `EdgeConnection`, `NodeFrontmatter`, `RoadmapNode`, `Zone`, `ZoneEdge`, `ZonesConfig`, `NodeStatus`, `NodeProgress`, `ProgressData` |
| `content.ts` | Server-side content parsing. Reads filesystem, parses with gray-matter, validates with Zod. | `getZonesConfig()`, `getZone(id)`, `getNodesByZone(zoneId)`, `getNode(zoneId, nodeId)`, `getAllNodes()`, `getZoneNodeCount(zoneId)`, `validateEdgeReferences()` |
| `validation.ts` | Zod schemas for content validation | `NodeFrontmatterSchema`, `ZonesConfigSchema` |
| `progress.ts` | Client-side localStorage helper (`"use client"`). Keys: `infra-roadmap-progress`, `infra-roadmap-last-node`, `infra-roadmap-resume-pref`. | `getProgress()`, `getNodeProgress(id)`, `setNodeStatus(id, status)`, `toggleMilestone(id, idx)`, `setEntryPoint(ep)`, `getCompletedCount(ids)`, `resetProgress()`, `getLastNode()`, `setLastNode(nodeId, zoneId, nodeTitle, zoneTitle)`, `getResumePref()`, `setResumePref(pref)`, `exportAllData()`, `importAllData(save)`, `resetAllData()`, `getProgressStats(nodeIds)` |
| `layout.ts` | Pure layout functions, no React hooks. Imported by `NodeGraph.tsx`. | `layoutNodes()`, `buildEdges()`, `findRoots()`, `getChildren()`, `getDescendants()`, `getInitialVisibleNodes()` |

## Pages (`src/app/`)

| File | Type | Purpose |
|------|------|---------|
| `layout.tsx` | Server | Root layout. Geist fonts, metadata. |
| `page.tsx` | Server | Home route `/`. Calls `validateEdgeReferences()`, loads zones config + node IDs, passes to HomeClient. |
| `HomeClient.tsx` | Client | Renders `<ZoneMap>` in a full-screen div. |
| `settings/page.tsx` | Server | Settings route `/settings`. Collects all active node IDs, passes to SettingsClient. |
| `settings/SettingsClient.tsx` | Client | Settings page UI. Resume pref radio, progress stats + reset, export/import JSON files, reset-everything danger zone. |
| `[zoneId]/page.tsx` | Server | Dynamic route `/:zoneId` (e.g. `/foundations`, `/scaling`). Validates zone exists + active, calls `notFound()` if invalid. Loads zone nodes. |
| `[zoneId]/ZoneClient.tsx` | Client | Reads `?node=` search param for highlighting. Wraps `<NodeGraph>` in Suspense. Back button → `router.push("/")`. |
| `error.tsx` | Client | Error boundary. Shows message + retry button. |
| `not-found.tsx` | Server | Custom 404. "Back to Roadmap" link. |
| `globals.css` | — | Tailwind imports + `.content-prose` styles. |

## Components (`src/components/`)

| File | Lines | Purpose |
|------|-------|---------|
| `ZoneMap.tsx` | ~295 | Bird's-eye zone view. Uses `useRouter()` for navigation (`router.push('/{zoneId}')`). Custom `ZoneNode` render with Handle components. `EntryPointSelector` integration navigates to `/{id}?node={nodeId}`. |
| `NodeGraph.tsx` | ~633 | Zone detail graph. **Biggest component.** Progressive disclosure: roots + 1 level visible initially. Expand/collapse via `+`/`-` buttons. Layout: dagre TB, ranksep=120. Q nodes injected between every content edge pair. Persists visible nodes + viewport to localStorage. Zoom controls bottom-right. Wrapped in `ReactFlowProvider`. |
| `NodeCard.tsx` | ~128 | Custom React Flow node (type: `roadmapNode`). Shows: category icon, title, difficulty dot (green/yellow/red), completion status. Bottom buttons: expand (+, blue) if hasHiddenChildren, collapse (-, gray) if canCollapse. |
| `QuestionNode.tsx` | ~95 | Custom React Flow node (type: `questionNode`). Small pill card between content nodes. Shows truncated italic question text. Click toggles a popover with full question + detail. |
| `ContentPanel.tsx` | ~302 | Modal overlay. Sections: header (title, difficulty, category, tags), summary (markdown), expandable deep dive, milestones (checkboxes), resources (markdown), "where to go next" (edge navigation), footer (mark complete button). |
| `EntryPointSelector.tsx` | ~130 | "Where do I start?" modal. 5 entry points mapping audience → zone + startNode. Calls `onSelect(zone, nodeId)`. |
| `ZonePortalCard.tsx` | ~49 | Custom React Flow node (type: `zonePortalNode`). Rendered at the end of cross-zone edges. Clicking navigates to the target zone. |
| `SearchModal.tsx` | ~168 | ⌘K search overlay. Filters nodes by title/tags across all zones. Focuses a node in the graph on select. |
| `HelpModal.tsx` | ~138 | Keyboard shortcuts and usage hints modal. |
| `ResumeModal.tsx` | ~100 | "Continue where you left off?" modal. Shows last node info + time ago. Four actions: Yes / No / Always / Never. |

## Tests (`src/lib/__tests__/`)

| File | Tests |
|------|-------|
| `content.test.ts` | getZonesConfig (3), getZone (2), getNodesByZone (2), getNode (2), content parsing (2), edge integrity (2) = 13 tests |
| `progress.test.ts` | getProgress (1), setNodeStatus (2), toggleMilestone (2), getCompletedCount (2), resetProgress (1) = 8 tests |

## Config files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest config: jsdom env, `@` → `./src` alias |
| `tsconfig.json` | TS strict, bundler resolution, `@/*` path alias, jsx: react-jsx |
| `next.config.ts` | Next.js config (likely minimal) |
| `package.json` | Scripts: dev, build, start, lint, test, test:watch |
