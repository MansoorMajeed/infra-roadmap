---
id: kube-proxy-basics
title: kube-proxy and How Services Route Traffic
zone: kubernetes
edges:
  to:
    - id: iptables-vs-ipvs
      question: >-
        We keep adding Services and networking latency keeps creeping up — are
        all those iptables rules the problem?
      detail: >-
        With a handful of Services everything was snappy. But we've scaled to
        hundreds and I'm seeing latency I can't explain. Every Service adds a
        bunch of iptables rules and the kernel scans them one by one. That
        can't scale forever. Is there a better way to do this?
difficulty: 2
tags:
  - kubernetes
  - kube-proxy
  - iptables
  - services
  - routing
  - k8s
category: concept
milestones:
  - >-
    Know that kube-proxy runs on every node and watches the API server for
    Service and Endpoint changes
  - >-
    Understand iptables mode: kube-proxy creates DNAT rules that intercept
    traffic to ClusterIPs and redirect to a randomly chosen backend pod
  - >-
    Be able to inspect the rules kube-proxy creates with iptables -t nat -L
  - >-
    Understand what happens when a pod dies: the endpoint is removed, but
    in-flight connections may still break during the transition
  - >-
    Know what session affinity does (sessionAffinity: ClientIP) and its
    limitations
---

When you create a Kubernetes Service, it gets a ClusterIP — a virtual IP that doesn't exist on any network interface. Yet you can curl it from any pod in the cluster and traffic reaches the right place. The component responsible is kube-proxy: it runs on every node, watches for Service changes, and programs iptables rules that intercept traffic to ClusterIPs and redirect it to real pod IPs.

<!-- DEEP_DIVE -->

## What kube-proxy does

kube-proxy runs as a DaemonSet on every node in the cluster. It watches the Kubernetes API server for two things:

1. **Services** — their ClusterIPs and ports
2. **EndpointSlices** — which pods are currently backing each Service

When a Service is created or updated, kube-proxy translates that information into networking rules on the node. In its default mode, those rules are iptables entries.

## How iptables mode works

When you create a Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
```

kube-proxy creates iptables rules on every node that say:

1. If traffic is destined for `10.96.0.15:80` (the ClusterIP), intercept it
2. Pick one of the backend pods randomly
3. DNAT (Destination NAT) the packet — rewrite the destination from `10.96.0.15:80` to `10.244.1.5:8080` (a real pod IP)
4. The packet now flows through normal pod-to-pod routing to reach the selected pod

The ClusterIP itself is never assigned to any interface. It's a "virtual" IP that only exists as an iptables rule target. The kernel intercepts packets heading for it before they ever hit the network.

## Seeing the rules

You can inspect the iptables rules kube-proxy creates:

```bash
# SSH to a node or use kubectl debug
iptables -t nat -L -n | grep my-app
```

For a Service with three backends, you'll see rules that look roughly like this (simplified):

```
KUBE-SVC-XXXXX  ->  statistic mode random probability 0.333 -> KUBE-SEP-AAAA (pod 1)
KUBE-SVC-XXXXX  ->  statistic mode random probability 0.500 -> KUBE-SEP-BBBB (pod 2)
KUBE-SVC-XXXXX  ->  remaining                               -> KUBE-SEP-CCCC (pod 3)
```

kube-proxy uses probability-based random selection. With 3 pods: the first rule matches 33% of traffic, the second matches 50% of the remaining (= 33% total), and the third catches everything else (= 33% total). Equal distribution, but using sequential probability rather than actual load balancing.

## What happens when a pod dies

When a pod is deleted:

1. The API server removes the pod from the EndpointSlice
2. kube-proxy detects the change and removes the iptables rules for that pod
3. New connections stop going to the dead pod

But there's a race condition: between the pod starting to shut down and kube-proxy updating the rules, some traffic may still be routed to the dying pod. This is why graceful shutdown and proper readiness probes matter — the pod should stop accepting new connections before it starts tearing down.

Existing TCP connections to the dying pod may also break if the pod exits before the connections drain. Kubernetes doesn't automatically wait for in-flight requests to complete — that's the application's responsibility via `preStop` hooks and graceful shutdown handling.

## Session affinity

By default, kube-proxy's random selection means each request from the same client could hit a different pod. If your application needs sticky sessions:

```yaml
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800   # 3 hours
```

This makes kube-proxy route all traffic from the same client IP to the same pod. It's useful for applications that store session state in memory, but it undermines load balancing — one very active client sends all its traffic to a single pod.

Better approach: store session state externally (Redis, a database) and let traffic distribute evenly.

## The kube-proxy modes

kube-proxy supports different backends for implementing service routing:

- **iptables** (default) — the approach described above. Simple, works everywhere, but scales poorly with thousands of Services.
- **IPVS** — uses the kernel's built-in L4 load balancer instead of iptables rules. Better performance at scale.
- **nftables** — newer iptables replacement, available in recent Kubernetes versions.
- **None** — don't run kube-proxy at all. Used when the CNI (like Cilium) handles service routing via eBPF.

For most clusters with a reasonable number of Services (up to a few hundred), iptables mode works fine. The performance difference only becomes visible at scale.

<!-- RESOURCES -->

- [Kubernetes Docs - Virtual IPs and Service Proxies](https://kubernetes.io/docs/reference/networking/virtual-ips/) -- type: docs, time: 20m
- [Kubernetes Docs - kube-proxy](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/) -- type: docs, time: 10m
- [A Deep Dive into Kubernetes Service Routing](https://www.tkng.io/services/) -- type: guide, time: 25m
