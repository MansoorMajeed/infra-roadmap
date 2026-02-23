---
id: hpa-vpa
title: Horizontal and Vertical Pod Autoscaling
zone: kubernetes-production
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - hpa
  - vpa
  - autoscaling
  - pods
  - k8s
  - production
  - scaling
category: concept
milestones:
  - >-
    Know why CPU% is a poor scaling signal for most apps — and what custom
    metrics (request rate, queue depth) look like instead
  - >-
    Understand KEDA: event-driven autoscaling triggered by external sources like
    SQS queues, Kafka lag, or Prometheus metrics
  - >-
    Know scaling behavior tuning: stabilizationWindow, scaleDown policies, and
    why fast scale-up + slow scale-down is usually the right default
  - >-
    Understand VPA modes — Off, Initial, Recreate — and why Recreate evicts
    running pods (and when that's acceptable)
  - >-
    Know the HPA + VPA conflict: both touching resource requests simultaneously
    causes thrashing; use VPA in Off mode for recommendations only
---

Static replica counts are a compromise: high enough to handle peak traffic (expensive), or low enough to save money (risky). HPA adjusts replica counts dynamically based on metrics. VPA adjusts the resource requests of individual pods. Together they let the cluster self-tune rather than requiring you to guess right upfront.

<!-- DEEP_DIVE -->

## HPA: Horizontal Pod Autoscaler

HPA watches a metric and adjusts replica count to keep that metric within a target range. The classic configuration is CPU:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-api
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
```

HPA watches the average CPU utilization across all pods. If it's above 60%, it adds replicas. If it's below, it removes them.

## Why CPU is often the wrong metric

CPU utilization is an implementation detail, not a measure of load. An I/O-bound service (waiting on database queries, external APIs) could be handling heavy load while showing 5% CPU — and HPA wouldn't scale it.

Better signals are application-level metrics:
- Request rate (requests per second)
- Request queue depth
- Response latency percentiles

These require your app to emit custom metrics into Prometheus (or a compatible adapter), which the HPA can then query. The `autoscaling/v2` API supports `Pods` and `External` metric types for this.

## KEDA: Event-driven autoscaling

KEDA (Kubernetes Event-Driven Autoscaler) extends HPA with native connectors for external event sources:

- SQS queue depth → scale workers as the queue fills
- Kafka consumer group lag → scale consumers when messages back up
- Prometheus query → scale on any metric you can express
- Cron schedule → scale to zero at night, pre-warm in the morning

KEDA can also scale to zero — something standard HPA can't do. This is useful for batch workers or development workloads that should consume no resources when idle.

## Scale-down behavior and stabilizationWindow

Fast scale-up is usually what you want: traffic spiked, add replicas now. But fast scale-down is usually dangerous: traffic ebbed, remove replicas — and then traffic came back and your service is understaffed before the new replicas start.

HPA has stabilization windows to control this:

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300  # don't scale down for 5 minutes after a spike
    policies:
      - type: Percent
        value: 25
        periodSeconds: 60            # scale down at most 25% per minute
  scaleUp:
    stabilizationWindowSeconds: 0    # scale up immediately
```

The default scale-down stabilization is 5 minutes. This is usually the right default — leave it there unless you have a specific reason to change it.

## VPA: Vertical Pod Autoscaler

VPA observes the actual resource usage of your pods over time and recommends (or sets) better resource requests. It solves the "my requests are wrong because I guessed" problem.

VPA has three modes:

**Off** — VPA just collects data and makes recommendations. You apply them manually. This is the safest starting point: get recommendations without disrupting running pods.

**Initial** — VPA sets resource requests when a pod is first created. Pods already running aren't touched. No evictions.

**Recreate** — VPA actively evicts pods to update their resource requests when its recommendations change significantly. This causes pod restarts, which is disruptive. Use only for workloads where you've verified VPA's recommendations are stable.

## The HPA + VPA conflict

HPA and VPA can't both manage the same target metric on the same deployment without conflicting. If HPA is scaling based on CPU percentage and VPA is simultaneously changing the CPU requests those percentages are calculated against, they'll fight each other and cause replica count thrashing.

The safe combination: **HPA for replica count on application metrics (not CPU), VPA in Off mode for recommendations only.** Use VPA's recommendations to tune your requests, then configure HPA on request rate or queue depth.

If you must use CPU-based HPA alongside VPA, use VPA in Initial or Off mode — never Recreate.

<!-- RESOURCES -->

- [Kubernetes Docs - Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) -- type: docs, time: 25m
- [Kubernetes Docs - Vertical Pod Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler) -- type: docs, time: 20m
- [KEDA Documentation](https://keda.sh/docs/) -- type: docs, time: 30m
