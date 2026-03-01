---
id: service-level-objectives
title: Service Level Objectives
zone: platform
edges:
  to:
    - id: dependency-slos
      question: >-
        My service depends on five others. If any of them are slow, my SLO
        fails. How do I account for that?
      detail: >-
        I'm setting an SLO for my checkout service, but it calls auth, payments,
        inventory, and notifications. If any of those are failing, I fail. Should
        my SLO be based on the sum of all their failure rates? I feel like I'm
        missing something fundamental here.
    - id: error-budgets
      question: >-
        I've got an SLO set. What does that actually give me beyond a number
        on a dashboard?
      detail: >-
        I have a target on paper. But I'm not sure what to do with it. Is it
        just something I monitor and feel bad about when I miss? How does having
        an SLO actually change how my team works or what we prioritise?
difficulty: 2
tags:
  - slo
  - sre
  - reliability
  - targets
  - objectives
category: practice
milestones:
  - Write an SLO for a service you own, including the SLI and target percentage
  - Explain why SLOs should be set below 100% and what that communicates
  - Understand the difference between a customer-facing SLO and an internal SLO
  - Know what it means to negotiate an SLO with a product stakeholder
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
