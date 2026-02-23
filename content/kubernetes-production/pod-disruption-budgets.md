---
id: "pod-disruption-budgets"
title: "Pod Disruption Budgets"
zone: "kubernetes-production"
edges:
  from:
    - id: "graceful-shutdown"
      question: "My app shuts down cleanly. But during a cluster upgrade, can Kubernetes take all my pods offline at once?"
  to:
    - id: "pod-scheduling-spread"
      question: "PDBs limit how many pods go down at once. But what if they all land on the same node or zone and go down together anyway?"
      detail: "I've set a PDB so Kubernetes can't evict more than one pod at a time. But all my replicas might be running on the same node — so a node failure or maintenance takes them all out simultaneously. How do I make sure they're actually spread across nodes and zones?"
difficulty: 3
tags: ["kubernetes", "pdb", "disruption", "availability", "draining", "autoscaler", "k8s", "production"]
category: "concept"
milestones:
  - "Understand voluntary vs involuntary disruptions"
  - "Know what a PDB tells the cluster and why it matters during node drains"
  - "Understand the danger: Cluster Autoscaler + no PDB = all pods evicted simultaneously"
  - "Know the difference between minAvailable and maxUnavailable"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
