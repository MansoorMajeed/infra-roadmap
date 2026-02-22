# ADR-0001: Fork-join layout correction for Dagre skip edges

**Date:** 2026-02-22
**Status:** Superseded — correction removed 2026-02-22 (see bottom)

## Context

The graph layout uses `@dagrejs/dagre` (Sugiyama algorithm, `rankdir: TB`). The roadmap's content design intentionally creates **fork-join patterns**: a main path A → B → C → D with a skip edge A → D, allowing experienced users to bypass the intermediate nodes.

Dagre assigns ranks by longest path, so D lands at rank 3 even though A→D is a direct edge. Dagre inserts virtual nodes at ranks 1 and 2 to represent the skip edge's path. When ranks 1 and 2 each contain only one real node (B and C), Dagre places B, C, and the virtual edge nodes in the same x-column — producing a single vertical line with a long curved skip edge running directly alongside (and visually through) the intermediate nodes.

**Dagre does not do edge obstacle avoidance.** The bezier curves in React Flow connect source/target handles with the shortest path. A skip edge between vertically aligned nodes produces a nearly-straight vertical line that overlaps the branch nodes. There is no Dagre setting that prevents this.

## Decision

Apply a post-layout correction: after `Dagre.layout(g)`, shift the fork node and its branch subtree left by one column width (`nodeWidth + nodesep`). The skip target stays at its dagre-assigned position. The skip edge then curves from the fork node (left column) diagonally right to the skip target, clearing the branch nodes.

**Key guard:** only shift nodes that are **strictly above** the skip target's y-rank. Nodes at the same rank as the skip target are dagre siblings with proper nodesep separation — shifting them would cause collisions.

```
Before correction (all in one column):    After correction (branch shifted left):

A                                          A
|  ↘ (skip edge)                          |  ↘ (skip edge curves right)
B    ↓                                    B       ↓
|    ↓                                    |       ↓
C    ↓                                    C       ↓
|    ↓                                    |       ↓
D ←──┘                                    D ──────┘
```

## Bug history

The original fix (commit `8d1e5b5`) did not include the `y < skipTargetY` guard and also did not shift the fork node itself. This caused two problems:

1. **Sibling collision (k8s-production zone):** `managing-k8s-manifests` is reachable both directly from the root (depth 1) and via a 4-hop chain (depth 4). Dagre assigns it rank 4. `node-autoscaling` is a sibling also at rank 4. The fix incorrectly shifted `node-autoscaling` left by one column — landing it on top of `managing-k8s-manifests`.

2. **Root misalignment:** Not shifting the fork node left with its branch left the root visually centered above the skip target rather than above the branch.

Fix: shift `[forkNode, ...branchNodes].filter(node => node.y < skipTargetY)`.

## Layout settings

Tuned alongside this fix:
- `ranksep`: 180 → 240 (more vertical space; room for edge labels between rows)
- `nodesep`: 80 → 100 (wider horizontal separation between siblings)
- `edgesep`: 40 → 60
- `nodeHeight` passed to Dagre: 70 → 90 (closer to actual rendered card height)
- `COLUMN_SHIFT`: `nodeWidth + nodesep` = 300px

## Consequences

- Fork-join zones (e.g. self-hosting/docker) get clean two-column layouts with the skip edge curving away from branch nodes.
- Diamond patterns (e.g. k8s-production) are handled correctly because sibling nodes at the join rank are not shifted.
- If a future zone produces unexpected overlaps, check whether the fork node appears in multiple fork-join iterations (it could be shifted more than once). Add a `shiftedNodes` set to guard against double-shifting if needed.

---

## Superseded: 2026-02-22

The post-layout correction was removed when edge questions were converted from `EdgeLabelRenderer` labels into proper dagre nodes (`QuestionNode`). Each content edge now passes through an intermediate `q-{source}-{target}` node in the dagre graph, giving dagre the structure it needs to spread fork-join branches horizontally on its own. The correction's threshold check (`y > RANKSEP * 1.5`) classified all content children as skip targets (they're now 2 dagre ranks away through Q nodes), so `localChildren` was always empty and the fix never fired. Dead code was removed.
