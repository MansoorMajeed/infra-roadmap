---
id: dns-debugging-k8s
title: Debugging Kubernetes DNS
zone: kubernetes
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - dns
  - debugging
  - ndots
  - coredns
  - k8s
category: practice
milestones:
  - >-
    Understand the ndots:5 problem: why a lookup for `api.stripe.com` generates
    multiple failed queries across search domains before the real one succeeds
  - >-
    Know how search domains in /etc/resolv.conf work and how Kubernetes
    configures them
  - >-
    Diagnose common DNS failures: CoreDNS crash-looping, DNS timeouts vs
    NXDOMAIN, pods resolving external but not internal names
  - >-
    Use debugging tools: nslookup and dig from inside a pod, reading CoreDNS
    logs, the dnsutils debug pod
  - >-
    Understand DNS caching options: why it matters at scale, NodeLocal DNSCache
    for node-level caching
  - >-
    Know the dnsPolicy options on pods: ClusterFirst vs Default vs None and when
    you'd change them
---

DNS problems are the most common networking issue in Kubernetes clusters. Lookups time out, external domains resolve slowly, internal names return NXDOMAIN for no apparent reason. Most of these problems trace back to a few well-known causes — the ndots:5 default, CoreDNS resource issues, or misconfigured resolv.conf. Knowing how to systematically debug DNS saves hours of guesswork.

<!-- DEEP_DIVE -->

## The ndots:5 problem

This is the single most common Kubernetes DNS performance issue, and almost nobody explains it well.

Look at a pod's `/etc/resolv.conf`:

```
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

`ndots:5` means: if the name you're looking up has fewer than 5 dots, try appending each search domain first before trying the name as-is.

When your app looks up `api.stripe.com` (2 dots, less than 5):

1. Try `api.stripe.com.default.svc.cluster.local` → NXDOMAIN
2. Try `api.stripe.com.svc.cluster.local` → NXDOMAIN
3. Try `api.stripe.com.cluster.local` → NXDOMAIN
4. Try `api.stripe.com` → success

That's **four DNS queries** before the real one succeeds. Every single external domain lookup generates this burst. Under load, this multiplies and hammers CoreDNS.

### Fixing ndots

Option 1: Add a trailing dot to external names (makes it fully qualified, skips search domains):

```bash
# In application code or config
curl api.stripe.com.    # trailing dot = absolute name, no search domains
```

Option 2: Set ndots lower in the pod spec:

```yaml
spec:
  dnsConfig:
    options:
      - name: ndots
        value: "2"
```

With `ndots:2`, names with 2+ dots (like `api.stripe.com`) are tried as-is first. Internal names like `my-service` (0 dots) still go through search domains.

Option 3: Deploy NodeLocal DNSCache (see below).

## The debugging toolkit

Start with a debug pod that has DNS tools:

```bash
# Run a pod with DNS utilities
kubectl run dnstest --image=registry.k8s.io/e2e-test-images/agnhost:2.39 \
  --restart=Never -- /bin/sh -c "sleep 3600"

# Or use kubectl debug to attach to an existing pod
kubectl debug -it my-pod --image=nicolaka/netshoot
```

### Test internal DNS

```bash
# Resolve a service name
kubectl exec dnstest -- nslookup my-service.default.svc.cluster.local

# Verbose lookup with dig
kubectl exec dnstest -- dig my-service.default.svc.cluster.local

# Check what nameserver the pod uses
kubectl exec dnstest -- cat /etc/resolv.conf
```

### Test external DNS

```bash
# This should work if CoreDNS forwards external queries correctly
kubectl exec dnstest -- nslookup google.com

# If external works but internal doesn't (or vice versa), that narrows the problem
```

## Common failures and what causes them

### Internal names fail, external names work

CoreDNS's Kubernetes plugin can't reach the API server, or the Service/Endpoints aren't registered. Check:

```bash
# Is the service you're looking up real?
kubectl get svc my-service -n default

# Is CoreDNS healthy?
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns
```

### Everything fails — all DNS is broken

CoreDNS pods are likely down or unreachable:

```bash
# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Check if the kube-dns Service has endpoints
kubectl get endpoints -n kube-system kube-dns
```

If CoreDNS pods are running but the Service has no endpoints, the labels don't match.

### DNS is slow but not broken

Usually the ndots:5 problem. Verify by timing a lookup with a trailing dot:

```bash
# Slow (search domain iteration)
time kubectl exec dnstest -- nslookup api.stripe.com

# Fast (fully qualified, skips search domains)
time kubectl exec dnstest -- nslookup api.stripe.com.
```

If the second is significantly faster, ndots is the issue.

### Intermittent timeouts under load

CoreDNS is getting overwhelmed. Check resource usage:

```bash
kubectl top pods -n kube-system -l k8s-app=kube-dns
```

If CoreDNS is hitting memory or CPU limits, scale it up (more replicas) or deploy NodeLocal DNSCache.

## NodeLocal DNSCache

NodeLocal DNSCache runs a DNS caching agent on every node as a DaemonSet. Pods send DNS queries to the local cache first, which handles repeated lookups without going to CoreDNS. This dramatically reduces load on CoreDNS and avoids conntrack race conditions that cause intermittent DNS failures on Linux.

It's especially valuable in large clusters or environments with heavy DNS traffic. Most managed Kubernetes services (GKE, EKS, AKS) offer it as a one-click or one-flag option.

## dnsPolicy options

The `dnsPolicy` field on a pod controls how its `/etc/resolv.conf` is configured:

- **ClusterFirst** (default) — use CoreDNS for everything, fall back to node DNS for external names
- **Default** — inherit the node's DNS config (skip CoreDNS entirely)
- **None** — empty resolv.conf; you must provide everything via `dnsConfig`
- **ClusterFirstWithHostNet** — like ClusterFirst but for pods using host networking

You'd change this if a pod needs to use external DNS directly (e.g., a monitoring pod that should resolve names the way the node does, not through CoreDNS).

<!-- RESOURCES -->

- [Kubernetes Docs - Debugging DNS Resolution](https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/) -- type: docs, time: 15m
- [Kubernetes DNS ndots Explained](https://pracucci.com/kubernetes-dns-resolution-ndots-options-and-why-it-may-affect-application-performances.html) -- type: article, time: 10m
- [NodeLocal DNSCache](https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/) -- type: docs, time: 15m
