---
id: resource-requests-limits
title: Resource Requests and Limits
zone: kubernetes-production
edges:
  to:
    - id: hpa-vpa
      question: >-
        Setting static requests worked. But what if my traffic spikes — can the
        cluster adjust automatically?
      detail: >-
        My requests and limits are set and scheduling is working. But my traffic
        is unpredictable — sometimes I need 2 replicas, sometimes 20. I don't
        want to pre-provision for peak if I'm paying for idle capacity most of
        the time.
    - id: health-checks-k8s
      question: >-
        Resources are set. But how does Kubernetes actually know if my app is
        healthy and ready to serve traffic?
      detail: >-
        I've set my resource requests so the scheduler can place pods. But a pod
        could be Running while my app is still initializing or silently broken.
        How does Kubernetes know the difference between a pod that's started and
        one that's actually ready?
difficulty: 3
tags:
  - kubernetes
  - resources
  - requests
  - limits
  - qos
  - oom
  - cpu-throttling
  - k8s
  - production
category: concept
milestones:
  - >-
    Understand the difference: requests are for scheduling, limits are for
    runtime enforcement
  - Know why CPU throttling and memory OOM kill are different failure modes
  - >-
    Understand QoS classes: Guaranteed, Burstable, BestEffort — and which gets
    evicted first
  - >-
    Know why 'no limits' is dangerous and why limits set too tight are also
    dangerous
  - >-
    Understand how resource requests feed directly into node autoscaling
    decisions
---

Resource requests and limits are two separate things that solve two separate problems. Requests tell the scheduler where a pod can fit. Limits enforce a ceiling at runtime. Getting either wrong causes subtle failures that are hard to debug under load.

<!-- DEEP_DIVE -->

## Requests vs limits

**Requests** — what the scheduler uses to decide which node can host the pod. If a node has 2 vCPU of unallocated capacity and your pod requests 3 vCPU, the pod won't schedule there, even if the node's actual CPU usage is 0.5 vCPU. Requests are guarantees from the cluster to the pod.

**Limits** — the hard ceiling enforced at runtime. The container cannot use more than the limit. What happens when it hits the limit is different for CPU vs memory.

## CPU throttling vs OOM kill — a critical difference

**CPU** — when a container exceeds its CPU limit, it gets throttled. The kernel slows it down. The process keeps running, but slower. You'll see increased latency without knowing why. This is especially painful for latency-sensitive applications.

**Memory** — when a container exceeds its memory limit, the kernel kills the process immediately with OOMKill. The pod restarts. You'll see `OOMKilled` in `kubectl describe pod`.

This asymmetry matters for how you set limits:
- CPU limits set too tight → invisible latency degradation
- Memory limits set too tight → pod crashes under load

The controversial opinion: some teams don't set CPU limits at all (to avoid throttling) and rely only on requests for scheduling. This is defensible on dedicated node pools where noisy neighbor isn't a concern.

## QoS classes

Kubernetes assigns one of three QoS classes based on how requests and limits are configured:

**Guaranteed** — requests = limits for both CPU and memory. The pod gets exactly what it asked for, never less. Last to be evicted when a node runs low on resources.

**Burstable** — requests set but limits either not set or different from requests. Can burst above requests if capacity is available. Evicted after BestEffort pods when nodes are under pressure.

**BestEffort** — no requests or limits set at all. Gets whatever's left over. First to be evicted when the node needs resources.

For production workloads: aim for Guaranteed or Burstable. BestEffort pods are unpredictable under node resource pressure.

## Common mistakes

**No limits at all** — a pod that leaks memory or has a bug can consume the entire node's memory and start evicting everything else. Always set memory limits.

**Requests = 0** — the scheduler thinks the pod needs nothing. It packs pods onto nodes until they're starved. Everything slows down together and you don't know why.

**Limits set dramatically higher than requests** — the scheduler sees light load but nodes are actually saturated. The autoscaler won't provision new nodes because it thinks capacity is fine.

**Copy-pasted requests from examples** — "512m CPU, 256Mi memory" is in every tutorial. Whether it's right for your app requires measurement, not guessing.

## Finding the right values

You need to measure, not guess. Ways to do it:

- Run your app under realistic load and watch `kubectl top pods`
- Use VPA in `Off` mode — it observes resource usage and produces recommendations without changing anything
- Check `container_memory_working_set_bytes` in Prometheus to see actual memory consumption

Set requests to roughly your app's average usage, and limits to your app's expected peak. Leave some headroom so you're not right at the limit under normal load.

## How requests feed autoscaling

The node autoscaler provisions nodes based on pending pods whose requests don't fit. If you set requests too low, the autoscaler underestimates load and won't provision nodes until CPUs are already saturated at the kernel level. If you set requests too high, nodes are underutilized and autoscaling is sluggish.

Accurate requests = accurate autoscaling.

<!-- RESOURCES -->

- [Kubernetes Docs - Resource Requests and Limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) -- type: docs, time: 25m
- [Kubernetes Docs - Pod Quality of Service](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) -- type: docs, time: 15m
