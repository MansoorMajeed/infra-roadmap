---
id: measuring-reliability
title: Measuring Reliability
zone: platform
edges:
  to:
    - id: service-level-agreements
      question: >-
        I keep seeing 'SLA' in contracts and dashboards — what does it actually
        commit us to, and who holds us to it?
      detail: >-
        Our enterprise customers keep asking about our SLA. Legal drafted some
        numbers but I'm not sure we can actually meet them, and I don't know how
        they relate to what I measure internally. And when internal teams promise
        each other things — is that also an SLA?
    - id: service-level-indicators
      question: >-
        How do I decide what to actually measure? My dashboards have a hundred
        graphs but none of them clearly answer 'is the service OK?'
      detail: >-
        I have CPU, memory, request count, error rate, database connections — but
        when someone asks 'is the service healthy?' I'm still guessing. I want to
        find the handful of measurements that actually reflect whether users are
        having a good experience, not just whether the machines are running.
    - id: critical-user-journeys
      question: >-
        I want to measure reliability from my users' perspective, not just
        whether my servers are up.
      detail: >-
        My pods are all green but users are complaining. I think I'm measuring
        the wrong things — infrastructure health instead of whether users can
        actually complete what they came to do. How do I define and measure
        reliability from their point of view?
difficulty: 1
tags:
  - reliability
  - sre
  - sli
  - slo
  - observability
  - measurement
category: concept
milestones:
  - Explain why raw infrastructure metrics are poor proxies for user experience
  - Understand what SLAs, SLIs, and SLOs are and how they relate to each other
  - Know the difference between availability, reliability, and durability
  - Calculate allowed downtime for common SLO targets (99%, 99.9%, 99.99%)
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
