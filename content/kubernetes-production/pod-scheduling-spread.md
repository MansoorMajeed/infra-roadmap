---
id: "pod-scheduling-spread"
title: "Pod Affinity, Anti-Affinity, and Spread"
zone: "kubernetes-production"
edges:
  from:
    - id: "pod-disruption-budgets"
      question: "PDBs limit how many pods go down at once. But what if they all land on the same node or zone and go down together anyway?"
  to: []
difficulty: 3
tags: ["kubernetes", "affinity", "anti-affinity", "topology", "spread", "scheduling", "k8s", "production"]
category: "practice"
milestones:
  - "Understand why two replicas on the same node gives you false confidence in availability"
  - "Know how anti-affinity rules prevent replicas from co-locating on the same node or zone"
  - "Use topologySpreadConstraints as the modern, flexible approach to spreading pods"
  - "Use node affinity to pin workloads to specific pools (e.g. GPU jobs to GPU nodes)"
  - "Know the difference between required (hard) and preferred (best-effort) constraints"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
