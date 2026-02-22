---
id: "one-server-is-not-enough"
title: "One Server Is Not Enough"
zone: "scaling"
edges:
  from:
    - id: "localmart-the-stack"
      question: "LocalMart gets featured in a news article. Thousands of users show up at once. What breaks?"
      detail: "You have a working Python app and MySQL database on a single VM. At 500 daily users, it's fine. But traffic isn't always predictable. A single server has hard limits on CPU, memory, and network — and if it crashes at 3 AM, the entire store goes down."
  to:
    - id: "horizontal-vs-vertical-scaling"
      question: "What are my options for handling more traffic?"
      detail: "There are fundamentally two ways to scale: make the server bigger, or add more servers. These have very different costs, limits, and complexity trade-offs. Understanding both is the foundation of everything else in this zone."
difficulty: 1
tags: ["scaling", "reliability", "single-point-of-failure", "availability", "capacity"]
category: "concept"
milestones:
  - "Identify the failure modes of a single-server deployment"
  - "Explain what a single point of failure is"
  - "Understand the difference between performance headroom and high availability"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
