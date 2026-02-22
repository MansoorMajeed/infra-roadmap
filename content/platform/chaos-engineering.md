---
id: "chaos-engineering"
title: "Chaos Engineering"
zone: "platform"
edges:
  from:
    - id: "post-mortems"
      question: "We learn from failures reactively. Can we find weaknesses before they cause incidents?"
      detail: "Post-mortems mean something already broke. Chaos engineering inverts this: you deliberately inject failures in a controlled way to discover how your system behaves under stress before a real incident does. Kill a node, saturate a network link, delay a database response — and see what actually happens."
  to:
    - id: "capacity-planning"
      question: "Chaos tests our resilience. How do I make sure we have enough headroom to absorb real-world load spikes?"
      detail: "Chaos engineering tests whether you recover from failure. Capacity planning asks a different question: do you have enough resources to handle the load before failure happens? Load testing, resource forecasting, and proactive scaling decisions are how you stay ahead of traffic growth."
difficulty: 3
tags: ["chaos-engineering", "resilience", "game-days", "fault-injection", "reliability", "netflix", "chaos-monkey"]
category: "practice"
milestones:
  - "Run a game day: define a failure scenario, inject it, observe and recover"
  - "Verify your auto-scaling and self-healing actually work by terminating instances"
  - "Test your failover path: does Multi-AZ failover work in practice, not just in theory?"
  - "Understand the difference between chaos experiments and breaking production carelessly"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
