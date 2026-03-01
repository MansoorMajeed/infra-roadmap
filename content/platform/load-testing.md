---
id: load-testing
title: Load Testing
zone: platform
edges:
  to:
    - id: platform-engineering
      question: >-
        Load tests are passing. How do I make sure every new service our teams
        build starts with this level of rigour?
      detail: >-
        I've validated our capacity assumptions — I know where we break and
        I've fixed the bottlenecks. But there are fifteen other services that
        have never been load tested. I can't do this for every team manually.
        How do I make it a default rather than something I have to chase people
        to do?
difficulty: 2
tags:
  - load-testing
  - performance
  - capacity
  - sre
  - reliability
  - k6
  - locust
category: practice
milestones:
  - Write a load test that simulates realistic traffic patterns for a service you own
  - Identify the bottleneck — which resource hits its limit first under load
  - Run a soak test to find memory leaks or resource exhaustion over time
  - Know the difference between load testing, stress testing, and spike testing
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
