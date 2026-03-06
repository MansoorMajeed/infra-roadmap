---
id: pod-disruption-budgets
title: Pod Disruption Budgets
zone: kubernetes-production
edges:
  to:
    - id: you-cant-debug-what-you-cant-see
      zone: observability
      question: >-
        My cluster handles disruptions gracefully now. But when something
        does go wrong, I'm still flying blind — I have no idea what's
        happening inside my services.
      detail: >-
        The infrastructure is solid. Pods survive node drains, autoscaling
        works, deploys are safe. But last week a service started returning
        errors and I had nothing — no logs I could search, no metrics to
        look at, no way to tell which request was failing or why. I need
        to actually see what's going on inside these things.
difficulty: 3
tags:
  - kubernetes
  - pdb
  - disruption
  - availability
  - draining
  - autoscaler
  - k8s
  - production
category: concept
milestones:
  - Understand voluntary vs involuntary disruptions
  - Know what a PDB tells the cluster and why it matters during node drains
  - >-
    Understand the danger: Cluster Autoscaler + no PDB = all pods evicted
    simultaneously
  - Know the difference between minAvailable and maxUnavailable
---

A PodDisruptionBudget tells Kubernetes how many pods of a given workload it's allowed to evict at once during voluntary operations. Without one, a node drain or cluster autoscaler scale-down can evict all your pods simultaneously — turning a routine maintenance operation into an outage.

<!-- DEEP_DIVE -->

## Voluntary vs involuntary disruptions

**Involuntary disruptions** are things Kubernetes can't prevent: hardware failure, kernel panic, the cloud provider deleting your node. PDBs don't help with these — there's nothing to coordinate.

**Voluntary disruptions** are controlled operations: `kubectl drain` for node maintenance, the cluster autoscaler consolidating underutilized nodes, rolling updates, and cluster upgrades. These are operations that *ask* the cluster to evict pods, and the cluster can honor a PDB before proceeding.

PDBs protect against voluntary disruptions. They're the mechanism that turns "drain this node immediately" into "drain this node, but respect my availability guarantees."

## What a PDB looks like

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: my-api-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: my-api
```

This says: when any voluntary disruption targets pods matching `app: my-api`, ensure at least 2 are available at all times. If evicting a pod would drop below 2, the drain pauses and waits until the pod is replaced and healthy before evicting another.

## minAvailable vs maxUnavailable

**minAvailable** — the minimum number (or percentage) of pods that must be available.

```yaml
minAvailable: 2     # absolute number
minAvailable: "50%" # at least half must be available
```

**maxUnavailable** — the maximum number (or percentage) of pods that can be unavailable simultaneously.

```yaml
maxUnavailable: 1     # at most one down at a time
maxUnavailable: "25%" # at most a quarter unavailable
```

Use `minAvailable` when you care about a hard floor. Use `maxUnavailable` when you're thinking about how much disruption you can absorb as a fraction of your fleet.

## The Cluster Autoscaler problem

Without a PDB, when the cluster autoscaler decides to consolidate nodes, it evicts all pods on those nodes in parallel. If your 3 replicas happen to be on 2 nodes being consolidated simultaneously, all 3 evictions can fire at once.

With a PDB of `minAvailable: 2`, the autoscaler evicts one pod, waits for a replacement to become available and healthy, then evicts another. The autoscaler is a well-behaved voluntary disruptor that respects PDBs.

This is the single most important reason to set PDBs: it makes your service immune to autoscaler-driven consolidation causing availability gaps.

## The trap with single replicas

A PDB of `minAvailable: 1` with only 1 replica means the PDB *blocks all drains*. You can't drain the node the pod is on because evicting the pod would drop below `minAvailable: 1`. The node drain will hang indefinitely waiting for a pod that will never be replaced while the original is still there.

If you run a single replica and need drains to succeed, either:
- Remove the PDB (accept the downtime)
- Use `maxUnavailable: 1` instead of `minAvailable` — this allows eviction even for single-replica workloads
- Increase replicas to at least 2

## Pairing with topologySpreadConstraints

A PDB ensures Kubernetes evicts pods gradually. topologySpreadConstraints ensure those pods are spread across nodes and zones so they're not all on the same node to begin with. Together they're the complete answer to "how do I survive a node going away?"

PDB alone: your 3 pods are all on node A, node A is drained, PDB allows 1 eviction at a time — but there's nowhere to move them until the drain is done and a new node is provisioned.

PDB + spread: your pods are on nodes A, B, and C. Node A is drained. The pod on A is evicted (PDB allows it; 2 remain available). A new pod schedules on node D. Nothing went down.

<!-- RESOURCES -->

- [Kubernetes Docs - Pod Disruption Budgets](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) -- type: docs, time: 20m
- [Kubernetes Docs - Specifying a Disruption Budget](https://kubernetes.io/docs/tasks/run-application/configure-pdb/) -- type: docs, time: 15m
