---
id: "node-autoscaling"
title: "Node Autoscaling"
zone: "kubernetes-production"
edges:
  from:
    - id: "node-pools"
      question: "I have my node pools set up — but do I really need to manually decide how many nodes to run?"
  to: []
difficulty: 3
tags: ["kubernetes", "autoscaling", "karpenter", "cluster-autoscaler", "nodes", "k8s", "production"]
category: "concept"
milestones:
  - "Understand what triggers a scale-up: pending pods that can't be scheduled"
  - "Know what prevents scale-down: PDBs, do-not-evict annotations, non-evictable pods"
  - "Understand the difference between Cluster Autoscaler and Karpenter"
  - "Know why resource requests (not limits) are what the scheduler actually uses"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
