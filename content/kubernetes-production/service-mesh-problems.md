---
id: service-mesh-problems
title: Problems a Service Mesh Solves
zone: kubernetes-production
edges:
  to:
    - id: service-mesh-intro
      question: Those problems sound familiar. What actually solves them?
      detail: >-
        I'm seeing all of these problems — unencrypted inter-service traffic, no
        request-level metrics, no automatic retries. I'm adding logic to each
        service individually to deal with it. There has to be a way to handle
        this at the infrastructure level instead.
difficulty: 2
tags:
  - kubernetes
  - service-mesh
  - mtls
  - observability
  - traffic
  - security
  - k8s
  - production
category: concept
milestones:
  - >-
    Know what happens when two services talk over plain HTTP inside a cluster —
    and why that's a problem
  - Understand what mTLS is and why implementing it in every app is impractical
  - >-
    Know why request-level visibility (latency, error rate per route) is hard to
    get without instrumentation
  - >-
    Understand what a service mesh offloads so your application code doesn't
    have to
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
