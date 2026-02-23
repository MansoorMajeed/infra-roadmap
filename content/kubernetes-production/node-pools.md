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
      detail: "Right now I have a fixed number of nodes and I'm constantly either over-provisioned and wasting money, or under-provisioned and pods are pending. Surely the cluster can figure out how many nodes it needs on its own?"
    - id: "managing-k8s-manifests"
      question: "I understand my cluster hardware setup. Now how do I manage the workloads that run on it?"
      detail: "I've got my node pools sorted out. Now I need to actually define and manage all the Kubernetes resources for my apps. I'm not sure how to keep deployments, services, and configmaps organized as things get more complex."
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
