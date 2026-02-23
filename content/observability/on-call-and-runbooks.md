---
id: on-call-and-runbooks
title: On-Call and Runbooks
zone: observability
edges:
  to:
    - id: distributed-tracing
      question: >-
        I'm on-call, I get paged, I check the runbook — it says 'check the
        traces'. What does that mean?
      detail: >-
        Runbooks often point to traces as the first debugging tool: 'look at the
        trace for a slow request and find the bottleneck'. Distributed tracing
        is the observability pillar that makes this possible — a timeline of
        exactly where a request spent its time across every service it touched.
difficulty: 2
tags:
  - on-call
  - runbooks
  - incident-response
  - pagerduty
  - escalation
  - sre
category: practice
milestones:
  - Write a runbook for your most common alert
  - Set up a basic on-call rotation with escalation policies
  - Understand what a post-mortem is and why blameless post-mortems matter
  - >-
    Define what 'incident severity levels' mean and how they change your
    response
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
