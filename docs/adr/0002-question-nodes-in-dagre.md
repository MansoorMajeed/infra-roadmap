# ADR-0002: Question nodes as dagre nodes (not edge labels)

**Date:** 2026-02-22
**Status:** Accepted

## Context

Each content edge `A → B` carries a `question:` and optional `detail:` field. These must be visible in the graph so users understand what problem each next step solves. The original implementation rendered them as `EdgeLabelRenderer` overlay divs positioned near the source node using bezier midpoint math.

This approach had a fundamental flaw: `EdgeLabelRenderer` has no collision detection. Labels from multiple outgoing edges of the same source node all computed similar positions, causing overlap. Skip edges (A → C spanning 2+ dagre ranks) had their midpoint land on intermediate content nodes.

Attempts to fix this by adjusting the label position formula (e.g. `yOffset = max(40, min(120, dy * 0.1))`) were heuristics that worked for specific topologies but broke for others. The problem cannot be solved universally with label positioning because the labels are invisible to each other.

## Decision

Convert each edge's question into a **synthetic React Flow node** (`QuestionNode`) that participates in the dagre layout.

```
Before:  A ──[question label]──→ B
After:   A → [QuestionNode] → B
```

Each intra-zone edge `A → B` becomes two dagre edges (`A → q-A-B`, `q-A-B → B`) with a `QuestionNode` at the intermediate rank. Portal (cross-zone) edges are unaffected.

`ranksep` is halved from 240 → 120px so that the total vertical distance between two content nodes remains 240px (`content → Q → content = 120 + 120`).

## Why this works

- Dagre **guarantees no overlap** — nodes cannot occupy the same space
- Multiple outgoing edges from the same source produce multiple `QuestionNode`s at the same dagre rank, and dagre spreads them horizontally automatically
- Skip edges no longer need special treatment: `q-A-C` gets its own rank slot and its own x-position, separate from the branch nodes
- The fork-join post-layout correction (ADR-0001) became dead code and was removed — dagre handles the spreading naturally once intermediate nodes exist

## QuestionNode UX

- Small pill card (~180×40px), italic question text, same visual style as the old edge labels
- Click toggles an inline popover showing full question + detail text
- Close button on popover; also closes on outside click
- No navigation from the popover — the user navigates by clicking the target content node directly
- `handleNodeClick` in `NodeGraph` returns early for `q-` prefixed node IDs; the component manages its own open/closed state

## Consequences

- Node count roughly doubles (N content nodes + M edges = N+M React Flow nodes)
- `QuestionEdge.tsx` deleted; `edgeTypes` removed from `NodeGraph`
- "Show Questions" toggle removed — questions are always visible as nodes
- `layoutNodes` and `buildEdges` are now in `src/lib/layout.ts` (pure functions, independently testable)
- Cross-zone portal edges: no `QuestionNode` injected — direct content → portal edge as before
