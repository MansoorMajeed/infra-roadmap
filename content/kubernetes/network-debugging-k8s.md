---
id: network-debugging-k8s
title: Debugging Kubernetes Networking
zone: kubernetes
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - debugging
  - networking
  - tcpdump
  - k8s
category: practice
milestones:
  - >-
    Follow a systematic approach: is it DNS? routing? the pod? the Service? the
    CNI?
  - >-
    Use kubectl exec with curl or wget to test connectivity from inside pods
  - >-
    Know how to use ephemeral debug containers with kubectl debug to attach to
    running pods
  - >-
    Capture packets with tcpdump inside pods or on nodes to trace actual network
    traffic
  - >-
    Diagnose common failures: pod can't reach external DNS, cross-node traffic
    drops, connection resets
  - >-
    Use CNI-specific tools: calicoctl for Calico, cilium status and hubble
    observe for Cilium
  - >-
    Debug network policy issues: applied a policy and broke everything — how to
    identify what's being blocked
---

TODO
