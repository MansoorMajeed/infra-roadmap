# Plan: Fix Edge Question Overlap — Question Nodes in Dagre (Option B)

## The Problem

Edge question labels (rendered via `EdgeLabelRenderer` in `QuestionEdge.tsx`) overlap with nodes and each other because:
1. Labels are positioned at the bezier midpoint — for skip edges spanning 2+ ranks, the midpoint lands on an intermediate node
2. Multiple edges from the same source node all compete for the same area
3. React Flow's `EdgeLabelRenderer` has no collision detection

No amount of bezier path manipulation fixes this universally. The midpoint of a long edge will always be somewhere in the middle of the graph where other things live.

---

## Approach: Question Nodes in the Dagre Layout

Convert each edge's question into a **synthetic React Flow node** that participates in the dagre layout. The graph structure changes:

```
Before:  A ──[question label]──→ B
After:   A → [Question Node] → B
```

Question nodes are small pill-shaped cards (~180×40px) with italic question text. Clicking one toggles a simple modal overlay (click again or close button to dismiss) showing the full question + detail. The node should be visually distinct from content nodes — keep the aesthetic close to the current edge label style (small, italic, subtle).

**Key insight:** With `ranksep` halved from 240→120px, each content→question→content pair still spans 240px total — same graph height as before.

```
Content A (rank 0, y=0, height=90)
  ↓ 55px gap
[Question] (rank 1, y=120, height=40)
  ↓ 55px gap
Content B (rank 2, y=240, height=90)
```

**Benefits:**
- Dagre **guarantees no overlap** — nodes can't occupy the same space
- Multiple edges from same source → multiple question nodes spread horizontally by dagre
- Fork-join / skip-edge layout handled by dagre's algorithm
- No bezier hacking, no `EdgeLabelRenderer` positioning math
- Scales to any topology

---

## Implementation Plan

### 1. New `QuestionNode.tsx` component

- Small pill card (~180px wide, ~40px tall)
- Italic question text (truncated with `line-clamp`)
- Visually distinct from content nodes: lighter background, subtle border, no icon/difficulty/status — close to the current edge label style
- Top + bottom `<Handle>` for edges
- `onClick` toggles a simple modal/popover showing:
  - Full question text in italic
  - Detail text (if present)
- Modal closes on second click or via a close button — no navigation button inside

### 2. Modified `layoutNodes` in `NodeGraph.tsx`

- `ranksep`: 240 → 120
- For each visible edge (source ∈ visibleIds, target ∈ visibleIds), inject a question node `q-${source}-${target}` into dagre with width=180, height=40
- Add dagre edges: source → Q_node → target (replace direct source→target edge)
- Fork-join fix still applies (now detects Q-nodes as the "branch" intermediates — the `RANKSEP * 1.5` threshold check needs updating to account for new ranksep=120)
- Q nodes included in `flowNodes` with offset/anchor treatment

### 3. Modified `buildEdges` in `NodeGraph.tsx`

- Remove `type: "question"` edges
- Add plain edges: source → Q_node and Q_node → target
- No label data needed on edges — just arrows

### 4. `QuestionEdge.tsx` — retired

- `QuestionEdge` component removed
- Plain edges use React Flow's default edge or a simple styled bezier (no label)

### 5. Progressive disclosure

- Q nodes are added to React Flow nodes when their target enters `visibleIds`
- Q nodes are removed when their target leaves `visibleIds`
- The expand `+` button on a content node still adds target content nodes (Q nodes appear automatically via `layoutNodes`)

### 6. "Show Questions" toggle — removed

- Questions are always visible as nodes
- Remove the `allEdgesExpanded` state and the "Show Questions" / "Hide Questions" button
- Remove from mobile menu too

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/NodeGraph.tsx` | `layoutNodes` (inject Q nodes, ranksep=120), `buildEdges` (plain edges), `nodeTypes`/`edgeTypes`, remove `allEdgesExpanded` state + toggle button |
| `src/components/QuestionEdge.tsx` | Deleted |
| `src/components/NodeCard.tsx` | No change |
| `src/components/QuestionNode.tsx` | **New file** |

---

## Verification Checklist

1. `npm run dev` → self-hosting zone (fork-join case) — Q nodes in separate column from branch nodes
2. k8s-production zone — no overlaps, Q nodes spread horizontally for multi-child nodes
3. Foundations zone (mostly linear) — Q nodes sit cleanly between content nodes
4. Expand/collapse: Q nodes appear/disappear alongside their targets
5. Click Q node → modal toggles open/closed, shows question + detail correctly
6. Cross-zone edges (zone portal nodes) — still render correctly, no Q node injected for portal edges
