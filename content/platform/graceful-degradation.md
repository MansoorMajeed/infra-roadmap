---
id: graceful-degradation
title: Graceful Degradation
zone: platform
edges:
  to:
    - id: capacity-planning
      question: >-
        My services now degrade gracefully instead of falling over completely.
        How do I make sure we can actually handle real growth too?
      detail: >-
        Graceful degradation means we survive individual failures — a dependency
        goes down and we serve partial results instead of hard errors. But I'm
        now thinking about a different kind of stress: not a dependency failing,
        but traffic that just keeps growing. I need to know we can absorb that
        before it becomes an incident.
difficulty: 3
tags:
  - graceful-degradation
  - resilience
  - reliability
  - sre
  - circuit-breakers
  - fallbacks
  - partial-failure
category: practice
milestones:
  - Identify which of your service's features can be disabled without breaking core functionality
  - Implement circuit breakers for at least one external dependency
  - Test that your service serves degraded responses when a dependency is unavailable
  - Understand the difference between failing fast and gracefully degrading
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
