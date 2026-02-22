---
id: "horizontal-vs-vertical-scaling"
title: "Vertical vs Horizontal Scaling"
zone: "scaling"
edges:
  from:
    - id: "one-server-is-not-enough"
      question: "My server can't keep up. What are my options?"
      detail: "When a single server hits its limits, you have two choices: make it bigger, or add more of them. These strategies have very different ceilings, costs, and complexity — and the right answer depends on what you're actually scaling."
  to:
    - id: "load-balancers"
      question: "Horizontal scaling sounds right. What do I need before I can add more servers?"
      detail: "You can't just add servers and hope traffic splits evenly. You need a load balancer: a component that sits in front of your servers and distributes incoming requests across all of them. It's also the thing that notices when a server dies and stops sending it traffic."
difficulty: 1
tags: ["scaling", "vertical-scaling", "horizontal-scaling", "capacity-planning", "architecture"]
category: "concept"
milestones:
  - "Explain the ceiling problem with vertical scaling"
  - "Describe why horizontal scaling requires stateless application design"
  - "Give an example of a workload better suited to vertical vs horizontal scaling"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
