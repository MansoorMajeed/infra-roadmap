---
id: node-autoscaling
title: Node Autoscaling
zone: kubernetes-production
edges:
  to:
    - id: managing-k8s-manifests
      question: >-
        My cluster scales automatically. Now how do I manage all the manifests
        for everything I'm deploying on it?
      detail: >-
        The infrastructure takes care of itself, but my YAML files are still a
        mess — different copies for staging and prod, edited by hand. I need a
        proper way to manage and version all of this.
difficulty: 3
tags:
  - kubernetes
  - autoscaling
  - karpenter
  - cluster-autoscaler
  - nodes
  - k8s
  - production
category: concept
milestones:
  - >-
    Understand why accurate resource requests are critical — the autoscaler
    makes bin-packing decisions based on requests, not limits
  - >-
    Know Karpenter's advantages over Cluster Autoscaler: flexible node type
    selection, faster provisioning, bin-packing across instance families
  - >-
    Understand scale-down safety: how PDBs and do-not-evict annotations interact
    with the autoscaler's drain process
  - >-
    Know the overprovisioning pattern: placeholder pause pods that get evicted
    first, giving real workloads a pre-warmed node to land on
  - >-
    Understand spot/preemptible node handling: interruption notices, mixed node
    groups, and safe workload placement
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
