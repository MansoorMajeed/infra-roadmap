---
id: on-call-health
title: Sustainable On-Call
zone: platform
edges:
  to:
    - id: error-budgets-in-practice
      question: >-
        On-call is healthier. How do I use error budgets to govern when we
        prioritise reliability vs features?
      detail: >-
        Sustainable on-call reduces the toil. Error budgets provide the policy:
        they give the team a principled, quantitative way to decide when to stop
        shipping and focus on reliability. The error budget is the bridge
        between SLOs and engineering decisions.
difficulty: 2
tags:
  - on-call
  - sre
  - burnout
  - alert-fatigue
  - toil
  - rotation
  - sustainability
category: practice
milestones:
  - >-
    Track on-call metrics: alert volume per shift, time-to-resolve, pages
    outside business hours
  - Require every actionable alert to have an associated runbook
  - >-
    Establish a policy: any alert that fires without action for N weeks gets
    deleted or silenced
  - >-
    Design an on-call rotation with reasonable primary/secondary coverage and
    handoff
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
