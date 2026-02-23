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

Node autoscaling watches for pods that can't be scheduled due to insufficient capacity and provisions new nodes automatically — and removes underutilized nodes when they're no longer needed. Without it, you're either over-provisioning (paying for idle nodes) or under-provisioning (pods stuck pending during traffic spikes).

<!-- DEEP_DIVE -->

## How it works

The node autoscaler doesn't watch CPU or memory usage. It watches the scheduler. When a pod can't be placed on any existing node (its resource requests don't fit), the autoscaler provisions a new node. When nodes are underutilized and their pods can be packed elsewhere, it drains and removes them.

This is why accurate resource requests are critical: the autoscaler makes decisions based on what pods *claim* they need, not what they actually use. A pod requesting 4 CPU will hold that scheduling space even if it's only using 0.1 CPU.

## Cluster Autoscaler vs Karpenter

**Cluster Autoscaler** (CA) is the original approach. It works with predefined node groups (AWS ASGs, GKE managed instance groups). When it needs a node, it scales up the appropriate group. It's well-tested and widely used.

Limitations: you configure node groups in advance, so you're picking instance types ahead of time. The autoscaler can only choose from what you've defined.

**Karpenter** (AWS-native, increasingly cross-cloud) takes a different approach: it provisions nodes directly, choosing the best instance type for the pending pods at the moment. If you have pending pods that need 7 vCPU, Karpenter can provision an 8 vCPU instance instead of wasting 8 vCPU because your node group only has 16 vCPU instances.

Karpenter advantages:
- Faster provisioning (doesn't wait for ASG to scale; provisions directly)
- Better bin-packing across many instance families
- Can mix spot and on-demand in a single provisioner configuration
- More flexible node lifecycle (terminates unused nodes faster)

For new AWS deployments, Karpenter is the preferred choice. For GKE and AKS, the managed autoscaler is tightly integrated and well-supported.

## Scale-down safety

The autoscaler will try to drain nodes it considers underutilized. A drain evicts all pods on that node, which means your pods must handle being killed gracefully.

Two mechanisms protect against eviction:

**PodDisruptionBudgets (PDBs)** — the autoscaler respects PDBs during drain. If draining a node would violate a PDB, the autoscaler skips that node. This is why PDBs matter even when you're not manually draining nodes.

**do-not-evict annotations** — `cluster-autoscaler.kubernetes.io/safe-to-evict: "false"` on a pod tells the autoscaler to never drain the node that pod is on. Use sparingly; it blocks scale-down.

## The overprovisioning pattern

Cold starts are a problem: the autoscaler provisions a node when pods are already pending. Provisioning a node takes 1–3 minutes. During a traffic spike, your new pods wait.

The overprovisioning pattern: run low-priority "placeholder" pods that consume capacity on fresh nodes. When a real workload pod needs to be scheduled and can't fit, it preempts the placeholder (which has lower priority). The real pod schedules immediately; the autoscaler then provisions a new node to replace the evicted placeholder.

This keeps one node of spare capacity warm, at the cost of paying for that spare capacity continuously.

## Spot node handling

If your node pool includes spot instances, nodes will be reclaimed with 2 minutes' warning. The autoscaler (and Karpenter) can respond to these interruption notices by preemptively migrating workloads.

Best practices for spot:
- Only run interruptible workloads on spot nodes
- Use taints + tolerations to segregate spot from on-demand
- Configure multiple instance types in your spot pool so AWS/GCP has more options to fulfill requests
- Use PDBs to limit how many pods can be evicted during an interruption

<!-- RESOURCES -->

- [Kubernetes Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/README.md) -- type: docs, time: 20m
- [Karpenter Documentation](https://karpenter.sh/docs/) -- type: docs, time: 30m
- [Kubernetes Docs - Pod Priority and Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) -- type: docs, time: 15m
