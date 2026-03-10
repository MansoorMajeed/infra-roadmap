---
id: pod-to-pod-networking
title: How Pods Talk Across Nodes
zone: kubernetes
edges:
  to:
    - id: what-is-cni
      question: >-
        All this networking gets set up automatically every time a pod starts —
        what's doing it?
      detail: >-
        Every time a pod launches, it gets an IP, gets wired into the network,
        and can immediately talk to other pods. That's a lot of setup happening
        behind the scenes. Kubernetes doesn't do it directly — so what does? And
        why are there so many different options for it?
    - id: network-debugging-k8s
      question: >-
        I understand how packets are supposed to flow — but right now something
        is broken and traffic between my pods is just dropping.
      detail: >-
        My pod can't reach a pod on another node. I know the path should be: pod
        → veth → bridge → node routing → other node → bridge → veth → pod. But
        something in that chain is failing and I don't know how to figure out
        where.
difficulty: 3
tags:
  - kubernetes
  - networking
  - veth
  - bridge
  - routing
  - packets
  - k8s
category: concept
milestones:
  - >-
    Understand veth pairs: every pod gets a virtual ethernet interface paired to
    the node's network namespace
  - >-
    Know how a node's network bridge connects all local pod veth interfaces so
    pods on the same node can talk directly
  - >-
    Trace the path of a packet from a pod on Node A to a pod on Node B — through
    the veth, bridge, node routing table, and into the destination node
  - >-
    Understand that cross-node routing is where CNI plugins differ — some
    encapsulate (overlay), some use real routes (BGP)
---

TODO
