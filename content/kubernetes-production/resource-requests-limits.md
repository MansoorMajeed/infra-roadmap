---
id: "resource-requests-limits"
title: "Resource Requests and Limits"
zone: "kubernetes-production"
edges:
  from:
    - id: "multi-env-k8s"
      question: "My app is deployed across environments — but how do I make sure it doesn't starve or take down other pods?"
  to:
    - id: "hpa-vpa"
      question: "Setting static requests worked. But what if my traffic spikes — can the cluster adjust automatically?"
    - id: "health-checks-k8s"
      question: "Resources are set. But how does Kubernetes actually know if my app is healthy and ready to serve traffic?"
difficulty: 3
tags: ["kubernetes", "resources", "requests", "limits", "qos", "oom", "cpu-throttling", "k8s", "production"]
category: "concept"
milestones:
  - "Understand the difference: requests are for scheduling, limits are for runtime enforcement"
  - "Know why CPU throttling and memory OOM kill are different failure modes"
  - "Understand QoS classes: Guaranteed, Burstable, BestEffort — and which gets evicted first"
  - "Know why 'no limits' is dangerous and why limits set too tight are also dangerous"
  - "Understand how resource requests feed directly into node autoscaling decisions"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
