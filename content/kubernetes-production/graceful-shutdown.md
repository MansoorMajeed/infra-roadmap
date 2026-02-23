---
id: graceful-shutdown
title: Graceful Pod Shutdown
zone: kubernetes-production
edges:
  to:
    - id: pod-scheduling-spread
      question: >-
        My app shuts down cleanly, but I just realized all my replicas might be
        running on the same node.
      detail: >-
        I handle SIGTERM properly so my app drains. But if all my replicas land
        on the same node and that node goes away — hardware failure, maintenance
        drain, whatever — there's nothing left to serve traffic. How do I
        actually guarantee they end up on different nodes?
difficulty: 3
tags:
  - kubernetes
  - sigterm
  - sigkill
  - graceful
  - shutdown
  - prestop
  - k8s
  - production
category: practice
milestones:
  - >-
    Understand the shutdown sequence: SIGTERM → terminationGracePeriodSeconds →
    SIGKILL
  - >-
    Know why endpoints are removed asynchronously and what that means for
    in-flight requests
  - Understand the preStop hook sleep trick and why it exists
  - >-
    Know what your application needs to do: handle SIGTERM, drain connections,
    close DB pools
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
