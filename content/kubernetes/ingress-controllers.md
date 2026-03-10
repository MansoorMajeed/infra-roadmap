---
id: ingress-controllers
title: "Ingress Controllers: What Actually Handles Your Traffic"
zone: kubernetes
edges:
  to:
    - id: load-balancer-integration
      question: >-
        I installed my ingress controller and it created a LoadBalancer Service
        — where did that external IP come from?
      detail: >-
        I set up nginx-ingress and suddenly there's an external IP I never
        created. On my cloud cluster it appeared in seconds. On my local cluster
        it just says 'pending' forever. Something is provisioning real load
        balancers from cloud providers, and I have no idea what that mechanism
        is or how to make it work outside the cloud.
difficulty: 2
tags:
  - kubernetes
  - ingress
  - nginx
  - traefik
  - envoy
  - gateway-api
  - k8s
category: concept
milestones:
  - >-
    Understand that an Ingress resource is just a config object — something
    needs to read it and act on it
  - >-
    Know how controllers work: watch the API server for Ingress resources,
    generate reverse proxy config, reload
  - >-
    Know the main options: nginx-ingress (most common, annotation-driven),
    Traefik (auto-discovery, dashboard), Envoy-based (Contour, Emissary —
    advanced L7 features)
  - >-
    Understand the Gateway API: Kubernetes' successor to Ingress — more
    expressive, role-oriented, not limited to HTTP
  - >-
    Know what IngressClass is and how it lets you run multiple controllers in
    the same cluster
---

TODO
