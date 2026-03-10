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

TODO
