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
    5 failed queries before the real one succeeds
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

TODO
