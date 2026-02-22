---
id: "graceful-shutdown"
title: "Graceful Pod Shutdown"
zone: "kubernetes-production"
edges:
  from:
    - id: "health-checks-k8s"
      question: "Kubernetes knows when my app is sick. But what happens when it decides to restart or move a pod — does traffic just get dropped?"
  to:
    - id: "pod-disruption-budgets"
      question: "My app shuts down cleanly. But during a cluster upgrade, can Kubernetes take all my pods offline at once?"
difficulty: 3
tags: ["kubernetes", "sigterm", "sigkill", "graceful", "shutdown", "prestop", "k8s", "production"]
category: "practice"
milestones:
  - "Understand the shutdown sequence: SIGTERM → terminationGracePeriodSeconds → SIGKILL"
  - "Know why endpoints are removed asynchronously and what that means for in-flight requests"
  - "Understand the preStop hook sleep trick and why it exists"
  - "Know what your application needs to do: handle SIGTERM, drain connections, close DB pools"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
