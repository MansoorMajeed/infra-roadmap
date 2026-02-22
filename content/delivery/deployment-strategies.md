---
id: "deployment-strategies"
title: "Deploying Without Downtime"
zone: "delivery"
edges:
  from:
    - id: "container-registry"
      question: "I have a versioned image. How do I get it running in production without taking the site down?"
      detail: "Deploying a new version means stopping the old one and starting the new one. Naive deployments have a gap between those two events — users get errors. Deployment strategies eliminate that gap."
  to:
    - id: "iac-intro"
      question: "My deployments are solid. But the servers I deploy to were set up by hand. Can I automate that too?"
      detail: "You can script your deployments perfectly and still have a fragile, hand-crafted server underneath. Infrastructure as Code brings the same automation discipline to the servers themselves."
difficulty: 2
tags: ["deployment", "rolling-deploy", "blue-green", "canary", "zero-downtime", "load-balancing"]
category: "concept"
milestones:
  - "Explain the gap problem in naive deployments"
  - "Implement a rolling deployment strategy"
  - "Understand what blue-green deployment is and when to use it"
  - "Know what a canary release is"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
