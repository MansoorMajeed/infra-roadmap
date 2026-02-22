---
id: "node-pools"
title: "Node Pools and Sizing"
zone: "kubernetes-production"
edges:
  from:
    - id: "cluster-topology"
      question: "I've decided on my cluster structure. Now how do I actually carve up the machines inside it?"
  to:
    - id: "node-autoscaling"
      question: "I have my node pools set up — but do I really need to manually decide how many nodes to run?"
    - id: "managing-k8s-manifests"
      question: "I understand my cluster hardware setup. Now how do I manage the workloads that run on it?"
difficulty: 2
tags: ["kubernetes", "node-pools", "spot", "on-demand", "sizing", "gpu", "k8s", "production"]
category: "concept"
milestones:
  - "Understand what a node pool is and why you'd have more than one"
  - "Know the tradeoff between spot and on-demand nodes"
  - "Understand what workloads belong on spot and which must not"
  - "Have a mental model for node sizing: many small vs few large"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
