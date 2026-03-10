---
id: ebpf-and-cilium
title: eBPF and Why It Changes Kubernetes Networking
zone: kubernetes
edges:
  to:
    - id: network-policies
      zone: kubernetes-production
      question: >-
        I understand how the network works now — I want to actually lock down
        which pods can talk to which.
      detail: >-
        My cluster has a flat network where any pod can reach any other pod. Now
        that I understand CNI, eBPF, and how traffic flows, I want to put up
        walls. A compromised pod in one namespace shouldn't be able to reach the
        database in another.
difficulty: 3
tags:
  - kubernetes
  - ebpf
  - cilium
  - hubble
  - networking
  - k8s
category: concept
milestones:
  - >-
    Understand what eBPF is: small programs that run inside the Linux kernel,
    attached to hooks like network events
  - >-
    Know why eBPF matters for networking: make routing decisions at the kernel
    level, skip iptables entirely
  - >-
    Understand Cilium's model: eBPF programs handle pod networking, service
    routing, network policies, and observability in a single layer
  - >-
    Know what Hubble is: Cilium's observability layer that shows every network
    flow without needing tcpdump
  - >-
    Understand how Cilium replaces kube-proxy: eBPF handles ClusterIP routing
    instead of iptables rules
  - >-
    Know when eBPF is overkill (small clusters, simple needs) vs when it's
    essential (scale, visibility, performance)
---

TODO
