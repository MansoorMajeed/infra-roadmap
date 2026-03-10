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

When pods on different nodes need to talk, the traffic has to cross the physical network. CNI plugins handle this in two fundamentally different ways: overlay networking wraps pod traffic inside regular node-to-node packets, while native routing makes the physical network aware of pod IPs directly. Each has real trade-offs in simplicity, performance, and where you can run it.

<!-- DEEP_DIVE -->

## Overlay networking

An overlay network works by encapsulating pod packets inside regular node-to-node packets. The most common protocol is VXLAN (Virtual Extensible LAN).

Here's what happens when Pod A on Node 1 sends a packet to Pod B on Node 2:

1. Pod A sends a packet addressed to Pod B's IP (`10.244.2.3`)
2. Node 1's CNI intercepts the packet before it hits the physical network
3. The CNI wraps the entire original packet inside a new UDP packet, addressed from Node 1's IP to Node 2's IP
4. The outer packet travels across the physical network like any other traffic between machines
5. Node 2 receives the UDP packet, strips the outer headers, and delivers the inner packet to Pod B

```
Original:  [Pod A IP → Pod B IP] [payload]
On wire:   [Node 1 IP → Node 2 IP] [UDP] [Pod A IP → Pod B IP] [payload]
```

The physical network only sees traffic between node IPs. It has no idea that pod IPs exist. This is the key advantage of overlays: **they work on any network**, because the underlying infrastructure doesn't need to know anything about Kubernetes.

### The cost

Encapsulation isn't free:
- **Overhead per packet** — each packet gets an extra header (~50 bytes), reducing the effective MTU
- **CPU cost** — wrapping and unwrapping packets takes CPU cycles on every node
- **Troubleshooting** — when you capture packets on the physical network, you see VXLAN-encapsulated traffic, not the actual pod-to-pod communication

For most workloads, the overhead is negligible. For high-throughput, latency-sensitive applications (think: databases doing thousands of queries per second between pods), it can matter.

## Native routing

Native routing means pod CIDRs are real routes on the network. No wrapping — the physical network knows how to reach pod IPs directly.

The most common way to do this is BGP (Border Gateway Protocol). Each node runs a BGP agent that announces its pod CIDR to the network's routers: "I own `10.244.1.0/24`, send traffic for those IPs to me."

The routers add these as entries in their routing tables, and traffic flows directly:

1. Pod A sends a packet to Pod B's IP (`10.244.2.3`)
2. The packet hits the network router
3. The router has a route: `10.244.2.0/24 → Node 2`
4. The packet goes straight to Node 2, which delivers it to Pod B

No encapsulation, no overhead, no extra headers. The packet on the wire is exactly what the pod sent.

### The requirement

Native routing only works if your network infrastructure cooperates. The routers need to:
- Accept BGP peering from your nodes (or support some other route advertisement mechanism)
- Have the capacity in their routing tables for pod CIDRs

In a data center you control, this is often straightforward. In a cloud VPC or a managed corporate network where you don't control the routers, it might not be an option.

## Cloud-native networking: the third approach

Cloud providers offer a third model that doesn't fit neatly into overlay vs native. The AWS VPC CNI is the clearest example:

- Pods get IP addresses from the VPC's own IP space — the same address range as EC2 instances
- No overlay, no BGP — the VPC network treats pod IPs as first-class citizens
- Traffic between pods on different nodes travels through the VPC fabric like normal EC2-to-EC2 traffic

The trade-off: IP address consumption. Each EC2 instance can only hold a limited number of secondary IPs (based on instance type). A small instance might support 10-15 pod IPs. Run more pods than that and you're out of IPs. Larger instance types support more, but you're always constrained by VPC CIDR sizing and ENI limits.

Azure CNI and GKE's native networking work similarly — they integrate pod networking with the cloud network layer, trading IP flexibility for seamless cloud integration.

## When to pick which

| Approach | Use when | Avoid when |
|----------|----------|------------|
| **Overlay (VXLAN)** | Cloud, on-prem, any network you don't control. Simplest setup. | Ultra-low-latency workloads, very high network throughput |
| **Native (BGP)** | You control the network, need best performance, on-prem data center | Cloud VPCs (routers often don't support BGP peering) |
| **Cloud-native** | Running on AWS/Azure/GKE and want tight integration | Multi-cloud, on-prem, or if you're burning through IP addresses |

Most clusters start with overlay because it works everywhere. Switch to native routing if you hit performance limits and your network supports it. Use cloud-native CNI if you're all-in on one cloud provider and want the simplest integration.

<!-- RESOURCES -->

- [Calico Networking Options](https://docs.tigera.io/calico/latest/networking/) -- type: docs, time: 20m
- [VXLAN Explained](https://www.tkng.io/cni/vxlan/) -- type: guide, time: 15m
- [AWS VPC CNI - How It Works](https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html) -- type: docs, time: 15m
