---
id: pod-scheduling-spread
title: 'Pod Affinity, Anti-Affinity, and Spread'
zone: kubernetes-production
edges:
  to:
    - id: pod-disruption-budgets
      question: >-
        My pods are spread across nodes. But can Kubernetes still drain all of
        them at once during an upgrade and cause an outage anyway?
      detail: >-
        I've set up topology spread so replicas land on different nodes. But if
        Kubernetes decides to drain three nodes simultaneously for a version
        upgrade, I'd still lose everything. Is there a way to tell it how many
        pods it's allowed to take down at a time?
difficulty: 3
tags:
  - kubernetes
  - affinity
  - anti-affinity
  - topology
  - spread
  - scheduling
  - k8s
  - production
category: practice
milestones:
  - >-
    Understand why two replicas on the same node gives you false confidence in
    availability
  - >-
    Know how anti-affinity rules prevent replicas from co-locating on the same
    node or zone
  - >-
    Use topologySpreadConstraints as the modern, flexible approach to spreading
    pods
  - >-
    Use node affinity to pin workloads to specific pools (e.g. GPU jobs to GPU
    nodes)
  - >-
    Know the difference between required (hard) and preferred (best-effort)
    constraints
---

Running three replicas of your app is false confidence if all three are on the same node. One node failure — hardware failure, node drain, cloud provider maintenance — takes all three down at once. You need the scheduler to actively spread pods across failure domains: different nodes, different availability zones.

<!-- DEEP_DIVE -->

## The false safety illusion

A Deployment with 3 replicas gives you redundancy — unless the scheduler decides to place all three on the same node, which it can do by default. The scheduler optimizes for bin-packing efficiency, not fault tolerance. Without explicit constraints, replicas frequently co-locate.

## Pod anti-affinity

Pod anti-affinity tells the scheduler to avoid placing a pod on a node that already has a pod matching a given selector.

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: my-api
        topologyKey: kubernetes.io/hostname
```

`requiredDuringScheduling` means this is a hard requirement. If no node exists that satisfies the anti-affinity rule, the pod will not schedule. This can cause pods to be unschedulable if your cluster is small — if you have 3 replicas required to be on 3 different nodes but only have 2 nodes, one pod will remain pending.

`preferredDuringScheduling` is a soft requirement: the scheduler tries to satisfy it but will co-locate if there's no other option.

## topologySpreadConstraints

The modern, more flexible approach. Instead of "don't put pods together," it says "distribute pods evenly across this topology key":

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: my-api
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: ScheduleAnyway
    labelSelector:
      matchLabels:
        app: my-api
```

`maxSkew: 1` means the difference between the most-loaded and least-loaded topology domain is at most 1. This ensures balanced distribution rather than just co-location avoidance.

`whenUnsatisfiable: DoNotSchedule` makes it a hard requirement. `ScheduleAnyway` makes it a best-effort. Mix them: hard constraint on hostname (spread across nodes), soft constraint on zone (spread across zones when possible but don't block scheduling if you only have nodes in one zone).

## Spreading across availability zones

Spreading across nodes protects you against node failures. Spreading across availability zones protects you against AZ failures — which happen more often than you'd expect (cloud provider incidents frequently affect single AZs).

Use `topology.kubernetes.io/zone` as the topology key in a second spread constraint. Your cluster needs nodes in multiple zones for this to work.

## Node affinity for pool targeting

If you want a workload to land on a specific node pool (e.g., only on high-memory nodes, or only on spot nodes), use node affinity:

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: cloud.google.com/gke-nodepool
              operator: In
              values:
                - memory-optimized
```

This pins the workload to nodes with that label. Use taints + tolerations alongside node affinity for strict targeting (node affinity selects; taints prevent other workloads from landing there).

## Required vs preferred

**Required** constraints block scheduling if they can't be satisfied. Use for true availability requirements: "I need replicas on different nodes" is a valid hard requirement.

**Preferred** constraints are best-effort. Use when you'd like spreading but don't want it to cause unschedulable pods in edge cases (small clusters, unusual topologies).

A good default: hard constraint on hostname spread, soft constraint on zone spread. This ensures you never co-locate on the same node, but handles the case where your cluster doesn't have nodes in all zones.

<!-- RESOURCES -->

- [Kubernetes Docs - Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) -- type: docs, time: 20m
- [Kubernetes Docs - Assign Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) -- type: docs, time: 20m
