---
id: dependency-slos
title: Dependency SLOs
zone: platform
edges:
  to:
    - id: error-budgets
      question: >-
        My SLO now accounts for my dependencies. How does this translate into
        a budget for reliability work?
      detail: >-
        I've set a composite SLO that factors in what my dependencies can
        deliver. Now I have a target that's actually achievable. But I'm still
        not sure how this target guides day-to-day engineering decisions — how
        does it change what I work on next?
difficulty: 2
tags:
  - slo
  - dependency-slos
  - composite-slo
  - sre
  - reliability
  - service-dependencies
category: concept
milestones:
  - Explain why your service SLO cannot exceed the weakest SLO in your dependency chain
  - Calculate a composite availability given three services each at 99.9%
  - Identify all direct dependencies for a service and find their published SLOs
  - Understand what to do when a dependency's SLO is worse than yours needs to be
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
