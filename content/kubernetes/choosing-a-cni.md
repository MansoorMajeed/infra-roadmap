---
id: choosing-a-cni
title: Choosing a CNI Plugin
zone: kubernetes
edges:
  to:
    - id: ebpf-and-cilium
      question: >-
        Cilium keeps coming up as the answer to everything — networking,
        security, observability. What makes it so different from the others?
      detail: >-
        Every comparison ends with 'or just use Cilium.' It apparently uses
        something called eBPF to handle networking directly in the kernel, can
        replace kube-proxy, enforces network policies, and gives you visibility
        into every network flow. That sounds too good to be true. What's the
        catch, and what even is eBPF?
difficulty: 2
tags:
  - kubernetes
  - cni
  - flannel
  - calico
  - cilium
  - networking
  - k8s
category: concept
milestones:
  - >-
    Know Flannel: simplest CNI, overlay-only, no network policy enforcement —
    fine for learning and dev clusters
  - >-
    Know Calico: supports BGP and overlay, enforces network policies, mature and
    widely deployed in production
  - >-
    Know Cilium: eBPF-based, network policies, can replace kube-proxy, built-in
    observability with Hubble
  - >-
    Understand cloud provider CNIs (AWS VPC CNI, Azure CNI, GKE native): tight
    integration with cloud networking, limited portability
  - >-
    Know what Canal is: Flannel's networking with Calico's network policy
    enforcement — a common combination
  - >-
    Be able to pick a CNI based on actual needs: do you need network policies?
    eBPF? Cloud-native IPs? Performance? Start there.
---

Your CNI plugin is one of the most consequential decisions in a Kubernetes cluster — it determines how traffic moves, whether network policies work, what observability you get, and how the cluster performs at scale. The bad news: there are a lot of options. The good news: for most clusters, the decision comes down to a few key questions about what features you actually need.

<!-- DEEP_DIVE -->

## Flannel

Flannel is the simplest CNI. It creates an overlay network using VXLAN and assigns each node a subnet from the cluster's pod CIDR. That's it — it does the minimum to make pod-to-pod networking work.

**Good for:** Learning, development clusters, simple environments where you don't need network policies.

**Limitations:** No network policy enforcement at all. If you apply a NetworkPolicy resource with Flannel, nothing happens — the policy exists in the API but nobody enforces it. Overlay-only (no BGP mode). Minimal features.

## Calico

Calico is the most widely deployed production CNI. It supports both overlay (VXLAN) and native routing (BGP), enforces network policies, and is mature and battle-tested.

**Good for:** Production clusters that need network policies. On-prem environments where you want BGP for performance. Any cluster where you want a proven, well-documented option.

**Key features:**
- Network policy enforcement (standard Kubernetes NetworkPolicy + Calico's own extended policies)
- BGP mode for native routing (no overlay overhead)
- VXLAN mode when BGP isn't possible
- Felix agent on each node handles policy enforcement and route programming
- Large community and extensive documentation

**Limitations:** Doesn't have Cilium's eBPF-based observability or kube-proxy replacement. Configuration can get complex in large environments.

## Cilium

Cilium uses eBPF to handle networking at the kernel level instead of relying on iptables. It's the newest of the major CNIs but has rapidly become the default choice for new production clusters — including being the default CNI for GKE.

**Good for:** Production clusters that want performance, observability, and advanced features. Teams that want to replace kube-proxy. Environments where network visibility matters.

**Key features:**
- eBPF-based data plane — no iptables for pod networking or service routing
- Can fully replace kube-proxy for service routing
- Hubble: built-in network observability (see every flow, protocol-aware)
- Network policy enforcement (Kubernetes policies + Cilium's L7-aware policies)
- Optional transparent encryption (WireGuard or IPsec)
- Can act as an ingress controller and even a service mesh

**Limitations:** Requires a relatively modern Linux kernel (5.4+). More complex to operate than Flannel or basic Calico. The breadth of features means more to learn.

## Canal

Canal is Flannel + Calico combined. It uses Flannel for the networking (VXLAN overlay) and Calico for network policy enforcement. It exists because people wanted Flannel's simplicity with network policies.

**Good for:** When you already use Flannel and want to add network policy support without a full migration.

**Honestly:** If you're starting fresh, just pick Calico or Cilium. Canal exists for historical reasons — it solves a problem that Calico already solves on its own.

## Cloud provider CNIs

Each major cloud has its own CNI that integrates pod networking with the cloud's virtual network:

- **AWS VPC CNI** — pods get real VPC IPs. No overlay. Tight integration with security groups and VPC networking. Limited by ENI IP capacity per instance type.
- **Azure CNI** — pods get IPs from the Azure VNet. Deep integration with Azure networking and Network Security Groups.
- **GKE** — GKE now defaults to Cilium (Dataplane V2). Previously used a custom CNI with native VPC routing.

Cloud CNIs give you the best integration with cloud networking (security groups apply to pods, native VPC routing), but they lock you into that cloud and have IP address constraints.

## How to decide

Start with these questions:

1. **Do you need network policies?** If yes, eliminate Flannel.
2. **Are you on a managed cloud service?** Consider the cloud's native CNI for simplest integration. GKE already defaults to Cilium.
3. **Do you want network observability out of the box?** Cilium with Hubble gives you visibility into every network flow without extra tooling.
4. **Is performance critical?** Cilium's eBPF path or Calico's BGP mode — both avoid overlay overhead.
5. **Do you want to simplify by replacing kube-proxy?** Only Cilium does this.
6. **Are you running on-prem with BGP routers?** Calico's BGP mode is the most mature option.

For a new production cluster today, Cilium is increasingly the default choice. For an established cluster that already runs Calico well, there's no urgent reason to switch.

<!-- RESOURCES -->

- [Calico Documentation](https://docs.tigera.io/calico/latest/about/) -- type: docs, time: 20m
- [Cilium Documentation](https://docs.cilium.io/) -- type: docs, time: 20m
- [Kubernetes CNI Benchmark](https://itnext.io/benchmark-results-of-kubernetes-network-plugins-cni-over-40gbit-s-network-2024-156f085a5e4e) -- type: article, time: 15m
