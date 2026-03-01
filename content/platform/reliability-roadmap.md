---
id: reliability-roadmap
title: Reliability Roadmap
zone: platform
edges:
  to:
    - id: dora-metrics
      question: >-
        I have a reliability plan. But how do I measure whether the whole
        engineering org is actually getting better over time?
      detail: >-
        I can track whether individual services improve against their SLOs. But
        I want to know if we're actually improving as an org — are we deploying
        more safely, recovering faster, breaking things less often? I've heard
        about DORA metrics doing this but I don't know how to apply them.
    - id: chaos-engineering
      question: >-
        I've fixed the known problems. But I keep getting surprised by failures
        I didn't predict. How do I find the unknown ones?
      detail: >-
        Every time we fix one thing, the next incident is something completely
        different that we never considered. I want to stop only discovering
        weaknesses when users hit them. Is there a way to find them on purpose
        before that happens?
difficulty: 2
tags:
  - reliability
  - roadmap
  - planning
  - sre
  - post-mortem
  - prioritization
category: practice
milestones:
  - Convert post-mortem action items into properly scoped engineering tasks
  - Prioritize reliability work using error budget consumption data
  - Communicate a reliability investment plan to product stakeholders
  - Build a quarterly reliability review process into your team's rhythm
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
