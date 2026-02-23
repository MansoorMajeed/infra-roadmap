---
id: healthchecks-and-monitoring
title: Healthchecks and Monitoring Containers
zone: containers
edges:
  to:
    - id: why-kubernetes
      zone: kubernetes
      question: Single-server Docker is getting limiting. How do I run this at scale?
      detail: >-
        I've got one server working well but I need more resilience — if the
        server goes down, everything goes down. I also can't scale horizontally
        without a lot of manual work. Is there something better?
difficulty: 2
tags:
  - docker
  - monitoring
  - healthchecks
  - production
  - observability
category: practice
milestones:
  - Add a HEALTHCHECK instruction to a Dockerfile
  - Understand the three container health states (starting, healthy, unhealthy)
  - Use docker inspect to read a container's health status and history
  - Configure depends_on health conditions so services wait for dependencies to be ready
  - Use docker stats for basic resource monitoring
  - Know the limits of docker stats and when to reach for a proper monitoring stack
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
