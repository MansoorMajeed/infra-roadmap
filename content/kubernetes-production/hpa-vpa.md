---
id: hpa-vpa
title: Horizontal and Vertical Pod Autoscaling
zone: kubernetes-production
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - hpa
  - vpa
  - autoscaling
  - pods
  - k8s
  - production
  - scaling
category: concept
milestones:
  - >-
    Know why CPU% is a poor scaling signal for most apps — and what custom
    metrics (request rate, queue depth) look like instead
  - >-
    Understand KEDA: event-driven autoscaling triggered by external sources like
    SQS queues, Kafka lag, or Prometheus metrics
  - >-
    Know scaling behavior tuning: stabilizationWindow, scaleDown policies, and
    why fast scale-up + slow scale-down is usually the right default
  - >-
    Understand VPA modes — Off, Initial, Recreate — and why Recreate evicts
    running pods (and when that's acceptable)
  - >-
    Know the HPA + VPA conflict: both touching resource requests simultaneously
    causes thrashing; use VPA in Off mode for recommendations only
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
