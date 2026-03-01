---
id: chaos-engineering
title: Chaos Engineering
zone: platform
edges:
  to:
    - id: graceful-degradation
      question: >-
        Chaos tests keep revealing that my services fall over completely instead
        of degrading gracefully.
      detail: >-
        Every fault injection test ends the same way — the whole service goes
        down instead of shedding load or serving partial results. Users get a
        hard error instead of something degraded but functional. I want to
        design for partial failure, not just crash-and-recover.
    - id: game-days
      question: >-
        We're finding failures with chaos tests. But I'm not sure the team
        actually knows how to respond when they happen.
      detail: >-
        The last drill revealed that people didn't know what to do, who to
        call, or how to use the runbooks under pressure. The technical systems
        are getting more resilient but the human response is still unreliable.
        I want to practice the response, not just find the failure.
    - id: capacity-planning
      question: >-
        I've stress-tested the failure modes. Now I'm worried about what
        happens when traffic just keeps growing.
      detail: >-
        Chaos tests have found a bunch of weaknesses that I've fixed. But
        they're all about fault tolerance — not about growth. I don't know if
        the system can handle 3x current traffic, and I'd rather find out
        before users do.
difficulty: 3
tags:
  - chaos-engineering
  - resilience
  - game-days
  - fault-injection
  - reliability
  - netflix
  - chaos-monkey
category: practice
milestones:
  - 'Run a game day: define a failure scenario, inject it, observe and recover'
  - >-
    Verify your auto-scaling and self-healing actually work by terminating
    instances
  - >-
    Test your failover path: does Multi-AZ failover work in practice, not just
    in theory?
  - >-
    Understand the difference between chaos experiments and breaking production
    carelessly
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
