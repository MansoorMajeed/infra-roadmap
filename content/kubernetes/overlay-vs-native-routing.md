---
id: overlay-vs-native-routing
title: Overlay Networks vs Native Routing
zone: kubernetes
edges:
  to:
    - id: choosing-a-cni
      question: >-
        I get how overlay and native routing differ. But there are a dozen CNI
        plugins — which one should I actually use?
      detail: >-
        Routing mode is just one piece of the puzzle. Some CNIs support network
        policies, some don't. Some have built-in observability. Some can replace
        other cluster components entirely. I need to pick one and I don't want
        to find out I chose wrong after I'm already in production.
difficulty: 3
tags:
  - kubernetes
  - overlay
  - vxlan
  - bgp
  - routing
  - networking
  - k8s
category: concept
milestones:
  - >-
    Understand overlay networking: pod packets are encapsulated inside
    node-to-node UDP packets (VXLAN) — works on any infrastructure
  - >-
    Understand native/BGP routing: pod CIDRs are advertised as real routes on
    the network — no encapsulation overhead, but requires network cooperation
  - >-
    Know the AWS VPC CNI model as a third approach: pods get real VPC IPs with
    no overlay, but IP address consumption is a real constraint
  - >-
    Know when to pick overlay (any environment, simple, just works) vs native
    (performance-sensitive, you control the underlying network)
---

TODO
