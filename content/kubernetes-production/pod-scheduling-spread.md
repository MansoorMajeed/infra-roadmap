---
id: pod-scheduling-spread
title: 'Pod Affinity, Anti-Affinity, and Spread'
zone: kubernetes-production
edges:
  to:
    - id: pod-disruption-budgets
      question: >-
        My pods are spread across nodes. But can Kubernetes still drain all of
        them at once during an upgrade and cause an outage anyway?
      detail: >-
        I've set up topology spread so replicas land on different nodes. But if
        Kubernetes decides to drain three nodes simultaneously for a version
        upgrade, I'd still lose everything. Is there a way to tell it how many
        pods it's allowed to take down at a time?
difficulty: 3
tags:
  - kubernetes
  - affinity
  - anti-affinity
  - topology
  - spread
  - scheduling
  - k8s
  - production
category: practice
milestones:
  - >-
    Understand why two replicas on the same node gives you false confidence in
    availability
  - >-
    Know how anti-affinity rules prevent replicas from co-locating on the same
    node or zone
  - >-
    Use topologySpreadConstraints as the modern, flexible approach to spreading
    pods
  - >-
    Use node affinity to pin workloads to specific pools (e.g. GPU jobs to GPU
    nodes)
  - >-
    Know the difference between required (hard) and preferred (best-effort)
    constraints
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
