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

eBPF (extended Berkeley Packet Filter) lets you run small programs directly inside the Linux kernel, attached to events like network packets arriving or leaving. Cilium uses eBPF to handle Kubernetes networking at the kernel level — bypassing iptables entirely. This isn't just a different CNI; it's a fundamentally different approach to how the cluster processes network traffic, and it unlocks things that iptables-based networking can't do.

<!-- DEEP_DIVE -->

## What is eBPF?

Traditionally, if you wanted to change how the Linux kernel handles network packets, you had two options: modify the kernel source code (impractical) or use iptables rules (limited). eBPF introduces a third option: load small, verified programs into the kernel that run when specific events happen.

An eBPF program can:
- Inspect every packet entering or leaving a network interface
- Make routing decisions (forward, drop, redirect)
- Collect metrics about traffic patterns
- Modify packet headers

The kernel verifies every eBPF program before loading it — it checks that the program terminates, doesn't access invalid memory, and can't crash the kernel. This safety guarantee is what makes it practical for production use.

## Why iptables is the bottleneck

Traditional Kubernetes networking relies heavily on iptables. kube-proxy programs iptables rules for every Service, and CNIs like Calico use iptables for network policy enforcement. The problem:

- **Linear scanning** — iptables evaluates rules one by one. With thousands of Services, every packet traverses thousands of rules.
- **Full table replacement** — updating a single Service requires rewriting all iptables rules atomically. With 10,000 Services, this gets slow.
- **No awareness** — iptables operates at L3/L4 (IPs and ports). It can't make decisions based on HTTP headers, gRPC methods, or DNS names.

eBPF replaces this with hash-table lookups. Instead of scanning a chain of rules, the eBPF program does an O(1) lookup in a map: "traffic to ClusterIP X → redirect to Pod Y." This is dramatically faster at scale.

## How Cilium uses eBPF

Cilium attaches eBPF programs to the network interfaces of every pod and node. These programs handle:

### Pod networking
When a pod sends a packet, an eBPF program on the pod's virtual interface decides where to route it — directly to another pod on the same node (shortcutting the bridge entirely), to another node, or to a Service.

### Service routing (replacing kube-proxy)
Instead of iptables DNAT rules, Cilium's eBPF programs intercept traffic to ClusterIPs and redirect it to backend pods. This is faster and uses hash maps instead of chain scanning. When you install Cilium with `kubeProxyReplacement=true`, kube-proxy is no longer needed.

### Network policies
Cilium enforces network policies in eBPF. But unlike Calico's iptables-based enforcement, Cilium's policies can operate at L7 — you can allow HTTP GET but block HTTP DELETE, or restrict which Kafka topics a pod can consume from. Standard Kubernetes NetworkPolicy resources work unchanged, but Cilium also supports its own `CiliumNetworkPolicy` CRD for L7 rules.

### Transparent encryption
Cilium can encrypt all pod-to-pod traffic using WireGuard or IPsec, configured at the CNI level. No changes to your applications — the eBPF programs handle encryption and decryption transparently.

## Hubble: seeing the network

Hubble is Cilium's observability layer. Because eBPF programs see every packet, Cilium can expose rich visibility without any additional instrumentation:

```bash
# Watch all network flows in real time
hubble observe

# See flows for a specific pod
hubble observe --pod my-namespace/my-app

# Filter by verdict (dropped traffic = policy violations)
hubble observe --verdict DROPPED

# See HTTP-level detail
hubble observe --protocol http
```

Hubble shows you:
- Which pods are talking to which (source → destination)
- Whether traffic was forwarded or dropped (and by which policy)
- HTTP request/response details (method, path, status code)
- DNS queries and responses

This is enormously useful for debugging. Instead of guessing why a pod can't reach another pod, you can see exactly what's happening — "traffic from pod A to pod B was dropped by CiliumNetworkPolicy `deny-cross-namespace`."

Hubble also has a UI dashboard and can export metrics to Prometheus and Grafana.

## When Cilium is overkill

Cilium has a learning curve. For a small dev cluster with 10 pods, the setup complexity isn't worth the observability and performance gains. Flannel or basic Calico will work fine.

Cilium starts making a real difference when:
- You have hundreds of Services (eBPF routing is measurably faster)
- You need visibility into traffic flows without deploying separate monitoring
- You want to enforce L7 network policies (allow specific HTTP paths)
- You're running in a security-sensitive environment that needs encrypted pod-to-pod traffic
- You want to consolidate — one tool for CNI, service routing, network policies, and observability

## Installing Cilium

Cilium is typically installed via Helm:

```bash
helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium \
  --namespace kube-system \
  --set kubeProxyReplacement=true \
  --set hubble.enabled=true \
  --set hubble.relay.enabled=true
```

On managed clusters (EKS, AKS), Cilium can replace the default CNI. GKE Autopilot uses Cilium's eBPF data plane under the hood (called "Dataplane V2"), though it's a slimmed-down integration — not a full Cilium install with Hubble and CiliumNetworkPolicy CRDs. On GKE Standard clusters, you opt into it explicitly.

<!-- RESOURCES -->

- [What is eBPF?](https://ebpf.io/what-is-ebpf/) -- type: guide, time: 15m
- [Cilium Documentation](https://docs.cilium.io/) -- type: docs, time: 20m
- [Hubble Documentation](https://docs.cilium.io/en/stable/observability/hubble/) -- type: docs, time: 15m
- [eBPF and Kubernetes — Liz Rice talk](https://www.youtube.com/watch?v=99jUcLt3rSk) -- type: video, time: 30m
