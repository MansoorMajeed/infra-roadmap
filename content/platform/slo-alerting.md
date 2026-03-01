---
id: slo-alerting
title: SLO-Based Alerting
zone: platform
edges:
  to:
    - id: incident-roles
      question: >-
        The alert fired and it's real — the SLO is burning fast. Now what? I've
        got six people in a chat thread and nobody knows who's in charge.
      detail: >-
        I've been in incidents where everyone's talking at once, multiple people
        are making changes simultaneously, and nobody knows the current status.
        It's chaos on top of chaos. There has to be a better way to organise
        the response when things go wrong.
difficulty: 3
tags:
  - slo
  - alerting
  - burn-rate
  - sre
  - multi-window
  - prometheus
category: practice
milestones:
  - Explain why threshold alerts on raw metrics cause alert fatigue
  - Define what a burn rate is and how it differs from a raw error rate
  - Implement a multi-window burn rate alert for a service
  - Understand the tradeoff between fast burn (precision) and slow burn (coverage) alerts
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
