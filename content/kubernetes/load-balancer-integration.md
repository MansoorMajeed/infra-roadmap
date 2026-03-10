---
id: load-balancer-integration
title: Load Balancers and Kubernetes
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - load-balancer
  - metallb
  - cloud
  - external-dns
  - k8s
category: concept
milestones:
  - >-
    Understand what type: LoadBalancer actually does — it talks to the cloud
    provider to provision a real load balancer
  - >-
    Know what the cloud controller manager is: the component that bridges
    Kubernetes and cloud provider APIs
  - >-
    Understand the cost reality: every LoadBalancer Service creates a separate
    cloud LB, which adds up fast
  - >-
    Know why Ingress exists as a pattern: one LoadBalancer fronting one Ingress
    controller that routes to many Services
  - >-
    Understand MetalLB: LoadBalancer support for bare metal and on-prem clusters
    using ARP or BGP mode
  - >-
    Know what ExternalDNS does: automatically creates DNS records for
    LoadBalancer Services
---

TODO
