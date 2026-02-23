---
id: resource-requests-limits
title: Resource Requests and Limits
zone: kubernetes-production
edges:
  to:
    - id: hpa-vpa
      question: >-
        Setting static requests worked. But what if my traffic spikes — can the
        cluster adjust automatically?
      detail: >-
        My requests and limits are set and scheduling is working. But my traffic
        is unpredictable — sometimes I need 2 replicas, sometimes 20. I don't
        want to pre-provision for peak if I'm paying for idle capacity most of
        the time.
    - id: health-checks-k8s
      question: >-
        Resources are set. But how does Kubernetes actually know if my app is
        healthy and ready to serve traffic?
      detail: >-
        I've set my resource requests so the scheduler can place pods. But a pod
        could be Running while my app is still initializing or silently broken.
        How does Kubernetes know the difference between a pod that's started and
        one that's actually ready?
difficulty: 3
tags:
  - kubernetes
  - resources
  - requests
  - limits
  - qos
  - oom
  - cpu-throttling
  - k8s
  - production
category: concept
milestones:
  - >-
    Understand the difference: requests are for scheduling, limits are for
    runtime enforcement
  - Know why CPU throttling and memory OOM kill are different failure modes
  - >-
    Understand QoS classes: Guaranteed, Burstable, BestEffort — and which gets
    evicted first
  - >-
    Know why 'no limits' is dangerous and why limits set too tight are also
    dangerous
  - >-
    Understand how resource requests feed directly into node autoscaling
    decisions
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
