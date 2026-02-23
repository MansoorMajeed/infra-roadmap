---
id: cluster-upgrades
title: Upgrading Kubernetes in Production
zone: kubernetes-production
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - upgrades
  - version
  - nodes
  - control-plane
  - drain
  - k8s
  - production
  - operations
category: practice
milestones:
  - >-
    Understand the Kubernetes release cadence: minor versions every ~4 months,
    each supported for ~14 months — falling behind is easy
  - >-
    Know the upgrade order: control plane first, then node groups — and why
    you cannot skip minor versions
  - >-
    Understand how managed clusters (EKS, GKE, AKS) handle control plane
    upgrades vs how you handle node group upgrades
  - >-
    Know the node upgrade strategies: rolling drain-and-replace vs blue-green
    node groups, and what PDBs do during the drain
  - >-
    Test upgrades in staging first — API deprecations between versions break
    things silently (check with kubectl deprecations or pluto)
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
