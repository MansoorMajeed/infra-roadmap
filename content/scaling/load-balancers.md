---
id: "load-balancers"
title: "Load Balancers"
zone: "scaling"
edges:
  from:
    - id: "horizontal-vs-vertical-scaling"
      question: "I want to run multiple servers. What distributes traffic between them?"
      detail: "A load balancer is the entry point for all traffic. It distributes requests across your servers, runs health checks to detect failures, and automatically removes dead servers from rotation. Without one, you can't scale horizontally."
  to:
    - id: "session-problem"
      question: "Load balancer is in place. But now users keep getting randomly logged out. What's going on?"
      detail: "This is the first problem everyone hits when they scale horizontally. If your app stores sessions on a specific server, users whose requests land on a different server will find themselves logged out. This has a well-understood solution."
difficulty: 1
tags: ["load-balancer", "alb", "aws", "high-availability", "health-checks", "target-groups"]
category: "concept"
milestones:
  - "Create an AWS Application Load Balancer with a target group"
  - "Register two EC2 instances behind the load balancer"
  - "Configure health checks and watch the ALB remove an unhealthy instance"
  - "Understand the difference between a Layer 4 and Layer 7 load balancer"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
