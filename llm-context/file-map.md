# File Map

Quick reference for every file in the project and what it does.

## Content Layer (`content/`)

| File | Purpose |
|------|---------|
| `_zones.yaml` | 7 zone definitions: id, title, coreQuestion, description, color, position, active flag. Also `zoneEdges` array. Only `foundations` is `active: true`. |
| `foundations/*.md` (10 files) | Node content. YAML frontmatter + markdown body split by `<!-- DEEP_DIVE -->` and `<!-- RESOURCES -->` markers. |

### Foundations nodes (10)
hello-world, how-computers-run-code, operating-system-basics, the-terminal, files-and-filesystems, processes-and-memory, version-control-git, programming-fundamentals, scripting-bash-python, text-editors-and-ides

### Node frontmatter shape
```yaml
id: "hello-world"
title: "Hello, World!"
zone: "foundations"
edges:
  from: []
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
| `progress.ts` | Client-side localStorage helper (`"use client"`). Key: `sre-roadmap-progress`. | `getProgress()`, `getNodeProgress(id)`, `setNodeStatus(id, status)`, `toggleMilestone(id, idx)`, `setEntryPoint(ep)`, `getCompletedCount(ids)`, `resetProgress()` |

## Pages (`src/app/`)

| File | Type | Purpose |
|------|------|---------|
| `layout.tsx` | Server | Root layout. Geist fonts, metadata. |
| `page.tsx` | Server | Home route `/`. Calls `validateEdgeReferences()`, loads zones config + node IDs, passes to HomeClient. |
| `HomeClient.tsx` | Client | Renders `<ZoneMap>` in a full-screen div. |
| `zone/[zoneId]/page.tsx` | Server | Dynamic route `/zone/:zoneId`. Validates zone exists + active, calls `notFound()` if invalid. Loads zone nodes. |
| `zone/[zoneId]/ZoneClient.tsx` | Client | Reads `?node=` search param for highlighting. Wraps `<NodeGraph>` in Suspense. Back button → `router.push("/")`. |
| `error.tsx` | Client | Error boundary. Shows message + retry button. |
| `not-found.tsx` | Server | Custom 404. "Back to Roadmap" link. |
| `globals.css` | — | Tailwind imports + `.content-prose` styles. |

## Components (`src/components/`)

| File | Lines | Purpose |
|------|-------|---------|
| `ZoneMap.tsx` | ~190 | Bird's-eye zone view. Uses `useRouter()` for navigation (`router.push('/zone/...')`). Custom `ZoneNode` render with Handle components. `EntryPointSelector` integration navigates to `/zone/{id}?node={nodeId}`. |
| `NodeGraph.tsx` | ~607 | Zone detail graph. **Biggest component.** Progressive disclosure: roots + 1 level visible initially. Expand/collapse via `+`/`-` buttons. Layout: BFS topological sort by depth, xSpacing=320 ySpacing=200. Persists visible nodes + viewport to localStorage. Zoom controls bottom-right. Wrapped in `ReactFlowProvider`. |
| `NodeCard.tsx` | ~111 | Custom React Flow node. Shows: category icon, title, difficulty dot (green/yellow/red), completion status. Bottom buttons: expand (+, blue) if hasHiddenChildren, collapse (-, gray) if canCollapse && !hasHiddenChildren. |
| `ContentPanel.tsx` | ~256 | Modal overlay. Sections: header (title, difficulty, category, tags), summary (markdown), expandable deep dive, milestones (checkboxes), resources (markdown), "where to go next" (edge navigation), footer (mark complete button). |
| `EntryPointSelector.tsx` | ~96 | "Where do I start?" modal. 5 entry points mapping audience → zone + startNode. Calls `onSelect(zone, nodeId)`. |
| `QuestionEdge.tsx` | exists | Custom edge component for question labels on graph edges. |

## Tests (`src/lib/__tests__/`)

| File | Tests |
|------|-------|
| `content.test.ts` | getZonesConfig (3), getZone (2), getNodesByZone (3), getNode (2), content parsing (2), edge integrity (2) = 14 tests |
| `progress.test.ts` | getProgress (1), setNodeStatus (2), toggleMilestone (2), getCompletedCount (2), resetProgress (1) = 8 tests |

## Config files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest config: jsdom env, `@` → `./src` alias |
| `tsconfig.json` | TS strict, bundler resolution, `@/*` path alias, jsx: react-jsx |
| `next.config.ts` | Next.js config (likely minimal) |
| `package.json` | Scripts: dev, build, start, lint, test, test:watch |
