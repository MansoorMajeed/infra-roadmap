---
id: resource-requests-and-limits
title: Resource Requests and Limits
zone: kubernetes
edges:
  to:
    - id: autoscaling
      question: >-
        Resources are defined. Now I want Kubernetes to scale my Pods
        automatically based on those metrics.
      detail: >-
        I've set requests and limits so Kubernetes knows what each Pod needs.
        But when traffic spikes I'd still have to manually bump the replica
        count. Is there a way for the cluster to just figure out 'there's more
        load, spin up more Pods' on its own — without me having to watch it?
difficulty: 2
tags:
  - kubernetes
  - resource-requests
  - resource-limits
  - qos
  - scheduling
  - hpa
  - k8s
category: practice
milestones:
  - >-
    Set CPU and memory requests and limits on a Pod and observe where the
    scheduler places it
  - >-
    Understand the three QoS classes: Guaranteed, Burstable, BestEffort — and
    which gets evicted first
  - >-
    Deliberately exhaust a node's memory and watch BestEffort Pods get evicted
    first
  - Explain why requests affect scheduling while limits affect runtime behaviour
  - 'Know the rule of thumb: always set requests, set limits carefully'
---

Resource requests tell the Kubernetes scheduler how much CPU and memory a Pod needs — the scheduler uses this to decide which node to place it on. Limits cap what a Pod can actually consume at runtime. Getting this right is a prerequisite for both reliable scheduling and for autoscaling to work correctly.

<!-- DEEP_DIVE -->

## Requests vs limits

**Requests** — what the Pod is *guaranteed*. The scheduler only places a Pod on a node that has enough unallocated capacity to satisfy the request. The Pod always gets at least what it requests.

**Limits** — the maximum the Pod can use at runtime. If a container tries to exceed its CPU limit, it's throttled. If it tries to exceed its memory limit, it's killed with an OOMKill.

```yaml
resources:
  requests:
    cpu: "250m"      # 250 millicores = 0.25 CPUs
    memory: "256Mi"
  limits:
    cpu: "1"         # 1 full CPU
    memory: "512Mi"
```

CPU is expressed in cores or millicores (`1000m` = 1 core). Memory uses binary SI suffixes: `Ki`, `Mi`, `Gi`.

## How scheduling uses requests

When you create a Pod, the scheduler looks at every node and finds one where:

- The sum of all Pod CPU requests doesn't exceed the node's allocatable CPU capacity
- The sum of all Pod memory requests doesn't exceed the node's allocatable memory capacity

It ignores actual current usage — only committed requests matter for scheduling decisions. A node that's physically "busy" but has unallocated request headroom will happily accept more Pods. A node with plenty of actual headroom but fully committed requests will refuse them.

This is why accurate requests matter. Set them too low and your Pods get scheduled onto already-overloaded nodes. Set them too high and your nodes are under-utilized while Pods sit in `Pending`.

## QoS classes

Kubernetes assigns each Pod a Quality of Service class based on how requests and limits are configured. This determines eviction order when a node runs out of memory:

**Guaranteed** — requests equal limits for every container in the Pod. These Pods have the highest priority and are evicted last. Good for latency-sensitive production workloads.

**Burstable** — at least one container has a request set, but requests don't equal limits. Most Pods land here. They can burst above their requests when capacity is available.

**BestEffort** — no requests or limits set at all. These Pods are the first to be evicted when a node runs out of memory. Never run production workloads without resource requests.

## The CPU limits debate

Setting CPU limits is controversial in the Kubernetes community. The problem: a container that hits its CPU limit gets throttled by the Linux kernel's CFS scheduler — even if the node has spare CPU capacity available. This causes latency spikes that aren't visible from CPU utilization metrics.

Many teams set CPU requests but not CPU limits, accepting the risk of "noisy neighbor" effects in exchange for avoiding unnecessary throttling. If you do set CPU limits, set them well above the request and monitor for throttling with `container_cpu_cfs_throttled_seconds_total` in Prometheus.

Memory limits are different and should always be set — a container that exceeds its memory limit is killed immediately (OOMKill), which is a hard failure you want to scope and control.

## Practical rule of thumb

- **Always set memory requests and limits** — required for scheduling, prevents OOM cascades
- **Always set CPU requests** — required for autoscaling, affects where Pods land
- **Set CPU limits cautiously** — test under real load and watch for throttling before enforcing them

<!-- RESOURCES -->

- [Kubernetes Docs - Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) -- type: docs, time: 25m
- [Kubernetes Docs - Pod Quality of Service](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) -- type: docs, time: 15m
- [For the Love of God, Stop Using CPU Limits on Kubernetes](https://home.robusta.dev/blog/stop-using-cpu-limits) -- type: article, time: 10m
