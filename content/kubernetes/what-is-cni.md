---
id: what-is-cni
title: "CNI: The Plugin That Builds the Network"
zone: kubernetes
edges:
  to:
    - id: overlay-vs-native-routing
      question: >-
        My CNI has different modes for how it moves traffic between nodes — one
        wraps packets, another uses real routes. What's the difference?
      detail: >-
        I'm setting up my CNI and it's asking me to choose between 'overlay' and
        'native routing.' One apparently wraps each pod's traffic inside another
        layer to send it across nodes. The other makes the real network aware of
        pod IPs. I don't know which one I want or what the trade-offs are.
    - id: choosing-a-cni
      question: >-
        Flannel, Calico, Cilium, Weave, AWS VPC CNI — there are a dozen
        options. How do I pick?
      detail: >-
        My cluster came with a default CNI and I never questioned it. But now I
        need network policies and someone said my CNI doesn't support them.
        Another person says I should use Cilium for everything. I have no idea
        what the actual differences are.
difficulty: 2
tags:
  - kubernetes
  - cni
  - networking
  - kubelet
  - ipam
  - k8s
category: concept
milestones:
  - >-
    Understand that CNI (Container Network Interface) is a spec — it defines the
    interface between container runtimes and network plugins
  - >-
    Know the lifecycle: when kubelet starts a pod, it calls the CNI plugin to
    assign an IP and wire up the network
  - >-
    Understand what IPAM (IP Address Management) does: allocates pod IPs from a
    configured range, tracks which IPs are in use
  - >-
    Know that CNI plugin chaining lets you stack plugins — e.g., a main network
    plugin plus a bandwidth-limiting plugin
  - >-
    Recognize the symptom of a broken CNI: pods stuck in ContainerCreating with
    network setup errors
---

TODO
