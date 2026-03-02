---
id: load-balancers
title: Load Balancers
zone: scaling
edges:
  to:
    - id: session-problem
      question: >-
        Load balancer is in place. But now users keep getting randomly logged
        out. What's going on?
      detail: >-
        Everything looked fine after I added the load balancer, but now users
        keep complaining they're getting signed out mid-session. I didn't change
        any auth code — why is this suddenly happening?
    - id: rate-limiting
      question: The load balancer is distributing traffic. But bots and badly-written clients are hammering my API with hundreds of requests a second. How do I protect against that?
      detail: >-
        The LB handles normal traffic fine. But scrapers, abusive clients, and
        traffic spikes from retrying clients can still overwhelm my servers. A
        few bad actors shouldn't be able to take down the whole service. How do
        I throttle individual clients without affecting everyone else?
difficulty: 1
tags:
  - load-balancer
  - alb
  - aws
  - high-availability
  - health-checks
  - target-groups
category: concept
milestones:
  - Create an AWS Application Load Balancer with a target group
  - Register two EC2 instances behind the load balancer
  - Configure health checks and watch the ALB remove an unhealthy instance
  - Understand the difference between a Layer 4 and Layer 7 load balancer
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
