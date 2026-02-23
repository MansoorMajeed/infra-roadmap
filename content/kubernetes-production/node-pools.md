---
id: node-pools
title: Node Pools and Sizing
zone: kubernetes-production
edges:
  to:
    - id: node-autoscaling
      question: >-
        I have my node pools set up — but do I really need to manually decide
        how many nodes to run?
      detail: >-
        Right now I have a fixed number of nodes and I'm constantly either
        over-provisioned and wasting money, or under-provisioned and pods are
        pending. Surely the cluster can figure out how many nodes it needs on
        its own?
    - id: managing-k8s-manifests
      question: >-
        I understand my cluster hardware setup. Now how do I manage the
        workloads that run on it?
      detail: >-
        I've got my node pools sorted out. Now I need to actually define and
        manage all the Kubernetes resources for my apps. I'm not sure how to
        keep deployments, services, and configmaps organized as things get more
        complex.
difficulty: 2
tags:
  - kubernetes
  - node-pools
  - spot
  - on-demand
  - sizing
  - gpu
  - k8s
  - production
category: concept
milestones:
  - Understand what a node pool is and why you'd have more than one
  - Know the tradeoff between spot and on-demand nodes
  - Understand what workloads belong on spot and which must not
  - 'Have a mental model for node sizing: many small vs few large'
---

A node pool is a group of nodes with the same configuration — same instance type, same OS, same labels. Running all workloads on one pool of identical nodes is simple but wasteful: a CPU-intensive batch job sitting next to a latency-sensitive API on the same node degrades both. Node pools let you match hardware to workload.

<!-- DEEP_DIVE -->

## Why you'd have more than one pool

Different workloads have different resource profiles:

- **Web servers and APIs** — moderate CPU, low memory, many small instances work fine
- **ML training / GPU workloads** — require GPU instances, which cost 10–100x more per hour than CPU instances. You want exactly zero GPU nodes sitting idle.
- **Data processing / Spark** — high memory nodes. Need 128GB+ RAM per node, which isn't available in standard instance families.
- **Spot/preemptible workloads** — batch jobs, CI workers, anything stateless and retryable that can run on 60% cheaper instances that may disappear with 2 minutes' notice

A single pool forces you to choose: provision for your heaviest workload (waste money most of the time) or provision for average (fail during spikes). Multiple pools let you right-size each category.

## Spot and preemptible nodes

Cloud providers offer spare compute at a significant discount — 60–80% off on-demand prices. The catch: they can reclaim the instance with 2 minutes' warning.

**What's safe on spot:**
- Batch jobs with checkpointing
- CI build runners
- Stateless workers that can be restarted
- Dev/staging workloads

**What must not run on spot:**
- Production databases (StatefulSets with persistent data — a sudden node loss = potential data corruption)
- Any stateful workload where restart is disruptive
- Applications that take several minutes to start (they'll be evicted before they're useful)

In practice: mix on-demand nodes for your core production workloads, and spot nodes for everything that can tolerate interruption.

## Node sizing: many small vs few large

**Many small nodes (e.g., 4 vCPU / 16GB RAM):**
- Better blast radius isolation — a node failure takes down fewer pods
- Easier to schedule many small pods
- More nodes means more flexibility in scheduling constraints

**Few large nodes (e.g., 32 vCPU / 128GB RAM):**
- Better bin-packing efficiency — larger scheduling surface per node reduces wasted fractional resources
- Fewer nodes means fewer node management operations (upgrades, drains)
- Some workloads need more resources than a small node can provide

There's no universal answer. Many teams use medium-sized nodes (8–16 vCPU) as a default and add specialized pools for outlier workloads.

## Taints and tolerations

When you add a GPU node pool, you don't want random workloads landing on it (those GPU instances are expensive). Use taints to mark the pool as reserved:

```yaml
# Applied to GPU nodes
kubectl taint nodes <node-name> gpu=true:NoSchedule
```

Only pods with the matching toleration will schedule there:

```yaml
tolerations:
  - key: gpu
    operator: Equal
    value: "true"
    effect: NoSchedule
```

Combined with node affinity (requiring specific node labels), this ensures GPU workloads land on GPU nodes and nothing else does.

<!-- RESOURCES -->

- [Kubernetes Docs - Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) -- type: docs, time: 15m
- [Kubernetes Docs - Assign Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) -- type: docs, time: 20m
