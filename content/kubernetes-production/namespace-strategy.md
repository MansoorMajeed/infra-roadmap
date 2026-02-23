---
id: namespace-strategy
title: Namespace Strategy for Production
zone: kubernetes-production
edges:
  to:
    - id: rbac-k8s
      question: >-
        Now that I have namespaces organized, how do I control who can deploy
        to each one?
      detail: >-
        I've got my namespace structure figured out. But I need to make sure
        developers can only touch the namespaces they own — not accidentally
        deploy to production or read secrets from another team's namespace.
difficulty: 3
tags:
  - kubernetes
  - namespaces
  - multi-tenancy
  - environments
  - isolation
  - k8s
  - production
  - organization
category: concept
milestones:
  - >-
    Understand what namespaces actually isolate — and what they don't: network
    traffic, node scheduling, and cluster-scoped resources are not namespace-isolated
  - >-
    Know the two main models: namespace-per-environment (dev/staging/prod in
    one cluster) vs cluster-per-environment, and the trade-offs of each
  - >-
    Understand namespace-per-team as a multi-tenancy pattern: each team owns
    their namespace(s) with scoped RBAC and ResourceQuotas
  - >-
    Know how ResourceQuotas and LimitRanges enforce resource boundaries at the
    namespace level — preventing one team from starving another
  - >-
    Understand when shared-cluster multi-tenancy breaks down and separate
    clusters become the right answer (hard compliance, noisy-neighbor problems)
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
