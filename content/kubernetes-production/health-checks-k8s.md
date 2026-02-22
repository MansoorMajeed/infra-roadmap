---
id: "health-checks-k8s"
title: "Health Checks: Liveness, Readiness, Startup"
zone: "kubernetes-production"
edges:
  from:
    - id: "resource-requests-limits"
      question: "Resources are set. But how does Kubernetes actually know if my app is healthy and ready to serve traffic?"
  to:
    - id: "graceful-shutdown"
      question: "Kubernetes knows when my app is sick. But what happens when it decides to restart or move a pod — does traffic just get dropped?"
difficulty: 2
tags: ["kubernetes", "liveness", "readiness", "startup", "probes", "health", "k8s", "production"]
category: "practice"
milestones:
  - "Understand the three probe types and when each fires"
  - "Know the critical mistake: an aggressive liveness probe that causes restart loops"
  - "Know the readiness probe problem: no probe means traffic hits pods that aren't ready"
  - "Understand when startup probes save JVM and heavy-framework apps from being killed during boot"
  - "Write HTTP, TCP, and exec probe configurations"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
