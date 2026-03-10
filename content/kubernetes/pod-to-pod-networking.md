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

When a pod on one node sends traffic to a pod on another node, something has to carry that traffic across the physical network. Kubernetes doesn't handle this itself — it relies on a combination of virtual network interfaces, bridges, and routing that gets set up for each pod. Understanding this path is what lets you debug networking problems instead of guessing.

<!-- DEEP_DIVE -->

## Inside a single node

Every pod gets its own network namespace — an isolated copy of the network stack with its own interfaces, routing table, and IP address. The pod doesn't share the node's network directly.

To connect the pod's isolated network to the node, Kubernetes (via the CNI plugin) creates a **veth pair** — a virtual ethernet cable with two ends. One end goes inside the pod's network namespace and becomes the pod's `eth0`. The other end stays in the node's root network namespace.

```
┌─────────────────────────────┐
│          Node               │
│                             │
│  ┌─────────┐  ┌─────────┐  │
│  │  Pod A  │  │  Pod B  │  │
│  │  eth0   │  │  eth0   │  │
│  └──┬──────┘  └──┬──────┘  │
│     │veth        │veth     │
│  ┌──┴────────────┴──────┐  │
│  │    bridge (cbr0)     │  │
│  └──────────┬───────────┘  │
│             │              │
│         eth0 (node)        │
└─────────────┴──────────────┘
```

The node-side ends of the veth pairs are typically connected to a **bridge** (like `cbr0` or `cni0`). A bridge is a virtual network switch — it lets all pods on the same node talk to each other directly. Pod A sends a packet, it arrives at the bridge via the veth pair, and the bridge forwards it to Pod B's veth pair.

This is fast — same-node pod-to-pod traffic never leaves the machine.

## Across nodes

When Pod A on Node 1 needs to reach Pod C on Node 2, the packet has to leave Node 1 and arrive at Node 2. This is where things get interesting and where different CNI plugins take different approaches.

The basic path:

1. Pod A sends a packet to Pod C's IP (e.g., `10.244.2.3`)
2. The packet reaches the bridge on Node 1
3. The bridge doesn't know that IP locally, so the packet goes to the node's routing table
4. The routing table has an entry saying "10.244.2.0/24 is reachable via Node 2"
5. The packet travels over the physical network to Node 2
6. Node 2's routing table delivers it to the local bridge
7. The bridge forwards it to Pod C's veth pair

Step 4 is where the CNI plugin's approach matters. There are two fundamental strategies:

### Overlay approach

The packet gets wrapped inside another packet. Node 1 takes Pod A's original packet and puts it inside a UDP packet addressed to Node 2's real IP. Node 2 unwraps it and delivers the inner packet to Pod C. The physical network only sees normal traffic between node IPs — it doesn't need to know about pod IPs at all.

### Native routing approach

The nodes' routing tables (or the physical network's routers) know about pod subnets directly. Node 1 says "10.244.2.0/24 → Node 2's IP" as a real route. No wrapping, no overhead — but the network infrastructure needs to cooperate.

## What the node's routing table looks like

On a node in a typical cluster, you'd see something like:

```
10.244.0.0/24  via node-0  # pods on node-0
10.244.1.0/24  dev cni0    # local pods (this node)
10.244.2.0/24  via node-2  # pods on node-2
```

Each node gets a slice of the pod IP range (a /24 by default), and the routing table maps each slice to the node that owns it. How these routes get installed — whether by VXLAN tunnels, BGP advertisements, or cloud-specific APIs — depends entirely on the CNI plugin.

## Why this matters for debugging

When pod-to-pod traffic breaks, it's almost always a problem in this chain: the veth pair, the bridge, the routing table, or the cross-node transport. Knowing the path lets you ask the right questions:

- Can the pod reach its own gateway? (veth pair issue)
- Can pods on the same node talk to each other? (bridge issue)
- Can pods on different nodes talk? (routing or overlay issue)
- Can the nodes themselves ping each other? (physical network issue)

<!-- RESOURCES -->

- [Kubernetes Networking Demystified - Pod Networking](https://www.tkng.io/cni/) -- type: guide, time: 25m
- [Kubernetes Docs - Cluster Networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/) -- type: docs, time: 15m
- [Container Networking From Scratch](https://www.youtube.com/watch?v=6v_BDHIgOY8) -- type: video, time: 35m
