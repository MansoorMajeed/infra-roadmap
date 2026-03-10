---
id: iptables-vs-ipvs
title: "Service Routing at Scale: iptables vs IPVS"
zone: kubernetes
edges:
  to:
    - id: service-mesh-problems
      zone: kubernetes-production
      question: >-
        Traffic routing works, but everything between my services is unencrypted
        and I have zero visibility into what's calling what.
      detail: >-
        I can see that traffic reaches the right pods, but that's it. I don't
        know which service is calling which, I can't tell when requests between
        services fail, and none of it is encrypted — every pod talks plain HTTP
        to every other pod. I need observability and security between services,
        not just basic routing.
difficulty: 3
tags:
  - kubernetes
  - iptables
  - ipvs
  - kube-proxy
  - scaling
  - k8s
category: concept
milestones:
  - >-
    Understand the iptables scaling problem: every Service adds ~5 rules, 10k
    Services means 50k+ rules with O(n) chain scanning
  - >-
    Know what IPVS mode is: a real L4 load balancer in the kernel with
    hash-based O(1) lookup instead of linear chain scanning
  - >-
    Understand the load balancing algorithms IPVS supports: round-robin, least
    connections, weighted — compared to iptables random probability
  - >-
    Know the connection tracking differences between iptables and IPVS
  - >-
    Understand that eBPF (via Cilium) is the next evolution: skip kube-proxy
    entirely and handle service routing in eBPF programs
  - >-
    Know when to switch: hundreds of Services, need smarter load balancing, or
    want to eliminate kube-proxy
---

TODO
