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
    Understand the iptables scaling problem: every Service adds 8–15 rules
    across multiple chains, thousands of Services means tens of thousands of
    rules with O(n) chain scanning
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

kube-proxy's default iptables mode works fine for small clusters. But iptables was never designed for thousands of dynamically changing rules. At scale — hundreds or thousands of Services — every packet traverses a long chain of rules, updates require rewriting the entire table, and latency starts creeping up. IPVS and eBPF are the two alternatives that solve this differently.

<!-- DEEP_DIVE -->

## The iptables scaling problem

Every Kubernetes Service creates roughly 8–15 iptables rules (entries across KUBE-SERVICES, KUBE-SVC, and KUBE-SEP chains — more with additional endpoints and ports). With 1,000 Services, that's easily 10,000+ rules. With 5,000 Services, you're looking at 50,000–100,000+ rules.

The problem is how iptables processes packets:

- **Linear chain scanning** — when a packet arrives, the kernel evaluates rules one by one until it finds a match. With 5,000 Service rules, the worst case is scanning all 5,000 for every packet.
- **Full table replacement** — when kube-proxy needs to update a single Service (a pod was added or removed), it can't surgically update one rule. It rewrites the entire iptables table atomically. With tens of thousands of rules, this operation takes seconds and briefly blocks all rule evaluation.
- **Connection tracking pressure** — iptables uses conntrack to track connections. Under heavy load with many Services, the conntrack table fills up and starts dropping packets.

For a cluster with 50 Services, none of this matters. At 500+ Services with high traffic, you'll start seeing measurable latency from rule processing.

## IPVS mode

IPVS (IP Virtual Server) is a load balancer built into the Linux kernel. It was designed specifically for this — routing traffic to backend servers at high scale.

Instead of a chain of iptables rules, IPVS uses hash tables. When a packet arrives for a ClusterIP, IPVS does an O(1) hash table lookup to find the backend — no scanning, no matter how many Services exist.

### Switching to IPVS

To use IPVS mode, configure kube-proxy:

```yaml
# kube-proxy ConfigMap
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: "ipvs"
ipvs:
  scheduler: "rr"    # round-robin (default)
```

On managed clusters, this is often a cluster setting or flag when creating the cluster.

### Load balancing algorithms

This is one of IPVS's biggest advantages over iptables. Instead of random probability, IPVS supports real load balancing algorithms:

- **rr** (round-robin) — requests go to backends in order. Simple, predictable.
- **lc** (least connections) — send to the backend with the fewest active connections. Better for uneven request durations.
- **wrr** (weighted round-robin) — backends with higher weights get more traffic. Useful for heterogeneous pod sizes.
- **sh** (source hashing) — consistent mapping from client IP to backend. Similar to sessionAffinity but at the IPVS level.

iptables can't do any of this — it only supports random probability-based distribution.

### IPVS performance

At scale, the difference is significant:

| Metric | iptables | IPVS |
|--------|----------|------|
| Rule lookup | O(n) linear scan | O(1) hash lookup |
| Updating one Service | Rewrite all rules | Update one entry |
| 10,000 Services | Noticeable latency | No measurable impact |
| Load balancing | Random probability | rr, lc, wrr, sh |

IPVS still uses iptables for some things (NodePort handling, masquerading), but the hot path — routing packets to the right pod — uses the much faster IPVS data path.

## eBPF: skipping kube-proxy entirely

Both iptables and IPVS rely on kube-proxy to program the rules. Cilium takes a different approach: it replaces kube-proxy entirely and handles service routing with eBPF programs attached directly to network interfaces.

The eBPF approach bypasses iptables/IPVS completely. When a pod sends a packet to a ClusterIP, a Cilium eBPF program on the pod's virtual interface rewrites the destination immediately — before the packet even reaches the kernel's networking stack. No rule chains, no hash tables in a separate subsystem — just an inline eBPF map lookup.

This is the fastest option at any scale, but it requires running Cilium as your CNI. You can't mix kube-proxy IPVS with Cilium eBPF service routing — it's one or the other.

## When to switch

**Stick with iptables if:** You have fewer than a few hundred Services and aren't seeing latency issues. It's the simplest and most battle-tested option.

**Switch to IPVS if:** You have hundreds of Services, want real load balancing algorithms, or are seeing iptables-related latency. IPVS is a drop-in replacement — just change the kube-proxy mode.

**Use Cilium eBPF if:** You're already running Cilium (or evaluating it as your CNI) and want to simplify the stack by removing kube-proxy entirely. This is the most performant option but comes with the commitment to Cilium as your CNI.

<!-- RESOURCES -->

- [Kubernetes Docs - IPVS Mode](https://kubernetes.io/docs/reference/networking/virtual-ips/#proxy-mode-ipvs) -- type: docs, time: 15m
- [IPVS-Based In-Cluster Load Balancing Deep Dive](https://kubernetes.io/blog/2018/07/09/ipvs-based-in-cluster-load-balancing-deep-dive/) -- type: article, time: 20m
- [Cilium kube-proxy Replacement](https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free/) -- type: docs, time: 15m
