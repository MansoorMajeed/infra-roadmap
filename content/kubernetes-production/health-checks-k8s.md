---
id: health-checks-k8s
title: 'Health Checks: Liveness, Readiness, Startup'
zone: kubernetes-production
edges:
  to:
    - id: graceful-shutdown
      question: >-
        Kubernetes knows when my app is sick. But what happens when it decides
        to restart or move a pod — does traffic just get dropped?
      detail: >-
        My liveness probe works and unhealthy pods get restarted. But what
        happens to requests that are in-flight when the pod gets killed? Do they
        just fail, or is there something that drains them first?
difficulty: 2
tags:
  - kubernetes
  - liveness
  - readiness
  - startup
  - probes
  - health
  - k8s
  - production
category: practice
milestones:
  - Understand the three probe types and when each fires
  - >-
    Know the critical mistake: an aggressive liveness probe that causes restart
    loops
  - >-
    Know the readiness probe problem: no probe means traffic hits pods that
    aren't ready
  - >-
    Understand when startup probes save JVM and heavy-framework apps from being
    killed during boot
  - 'Write HTTP, TCP, and exec probe configurations'
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
