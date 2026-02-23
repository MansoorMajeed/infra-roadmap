---
id: network-policies
title: Network Policies and Pod Isolation
zone: kubernetes-production
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - network-policy
  - isolation
  - namespaces
  - egress
  - ingress
  - k8s
  - production
  - security
category: concept
milestones:
  - >-
    Understand that Kubernetes has no network isolation by default — any pod
    can reach any other pod in the cluster by IP
  - >-
    Know what a NetworkPolicy does: it selects pods by label and specifies
    which ingress and egress connections are allowed
  - >-
    Understand the default-deny pattern: apply a deny-all policy first, then
    add explicit allow rules only for what's needed
  - >-
    Know that NetworkPolicy requires a CNI plugin that enforces it (Calico,
    Cilium, Weave) — not all CNIs do
  - >-
    Apply namespace isolation: allow a pod to talk only to pods in its own
    namespace plus specific external dependencies
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
