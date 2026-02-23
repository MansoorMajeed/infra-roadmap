---
id: cluster-topology
title: One Cluster or Many?
zone: kubernetes-production
edges:
  to:
    - id: node-pools
      question: >-
        I've decided on my cluster structure. Now how do I actually carve up the
        machines inside it?
      detail: >-
        I know whether I want one cluster or many. But now I need to figure out
        what the actual machines look like — different sizes, different roles.
        My GPU workloads and my web servers probably shouldn't run on the same
        nodes.
difficulty: 2
tags:
  - kubernetes
  - cluster
  - multi-cluster
  - namespaces
  - isolation
  - blast-radius
  - k8s
  - production
category: concept
milestones:
  - >-
    Understand the tradeoffs between per-environment clusters vs namespaces in
    one cluster
  - Know what 'blast radius' means and why isolation matters
  - Understand the operational cost of running multiple clusters
  - Know when a single cluster with namespaces is good enough
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
