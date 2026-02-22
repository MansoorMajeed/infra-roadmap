---
id: "autoscaling"
title: "Autoscaling"
zone: "kubernetes"
edges:
  from:
    - id: "secrets"
      question: "My app is running, configured, and secured. How do I make it scale automatically?"
      detail: "Right now your app runs a fixed number of Pod replicas. When traffic spikes it gets slow; when traffic drops you're paying for idle compute. The Horizontal Pod Autoscaler watches metrics — CPU, memory, or custom signals — and adjusts the replica count automatically."
    - id: "resource-requests-and-limits"
      question: "Requests and limits are set. Now the HPA can actually measure utilisation — how do I configure autoscaling?"
      detail: "Resource requests are the prerequisite. With them defined, the HPA has a baseline to work from: if a Pod is using 80% of its requested CPU, add another replica. If it's using 20%, remove one. Now let's set that up."
  to:
    - id: "deployments"
      question: "Autoscaling manages how many Pods run. But how do I manage what they run — updating my app without downtime?"
      detail: "The HPA controls scale. The Deployment controls what's actually running: which container image, how to roll out a new version, what to do if the rollout fails. Deployments are the resource that makes 'ship a new version without downtime' possible in Kubernetes."
difficulty: 2
tags: ["kubernetes", "autoscaling", "hpa", "vpa", "cluster-autoscaler", "metrics-server", "k8s"]
category: "practice"
milestones:
  - "Install Metrics Server and verify kubectl top pods works"
  - "Create an HPA targeting 50% CPU utilisation and watch it scale under load"
  - "Understand the difference between HPA (Pod count) and VPA (Pod resource requests)"
  - "Understand how the cluster autoscaler adds nodes when Pods are unschedulable"
---

Kubernetes can automatically adjust the number of Pod replicas based on observed metrics. The Horizontal Pod Autoscaler (HPA) adds or removes replicas when CPU or memory utilization crosses thresholds. The Cluster Autoscaler adds or removes nodes when Pods can't be scheduled. Together, they let your cluster grow and shrink with actual demand.

<!-- DEEP_DIVE -->

## Prerequisites: Metrics Server

The HPA watches metrics, but it needs something to provide them. **Metrics Server** collects resource utilization from each node's kubelet and exposes it through the Kubernetes metrics API. Without Metrics Server, `kubectl top pods` doesn't work and the HPA has nothing to read.

Install it:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Verify:

```bash
kubectl top nodes
kubectl top pods
```

Most managed clusters (EKS, GKE, AKS) install Metrics Server by default.

## The Horizontal Pod Autoscaler (HPA)

The HPA watches the resource utilization of a Deployment (or other scalable resource) and adjusts the replica count to keep utilization near the target:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50   # scale when avg Pod CPU > 50% of its request
```

The HPA checks every 15 seconds (by default). If average CPU across all Pods exceeds 50% of their CPU request, it adds replicas. If utilization drops significantly below, it removes them — with a scale-down cool-down period to avoid flapping.

## Why resource requests are required

The HPA measures utilization as a percentage of the resource **request**. If requests aren't set, the HPA has no denominator — it can't compute utilization — and simply won't function. This is why setting resource requests is a strict prerequisite for autoscaling.

## The Vertical Pod Autoscaler (VPA)

The HPA changes how many Pods run. The **Vertical Pod Autoscaler** changes what resources individual Pods are allowed to request. VPA watches actual usage over time and recommends (or automatically adjusts) the `requests` on the Pod template to better match real consumption.

VPA and HPA don't work well together when targeting the same metric — they'll fight over what the right behavior is. Common practice: use VPA in recommendation-only mode (`updateMode: Off`) to get sizing suggestions, then apply those manually to your resource requests.

## The Cluster Autoscaler

The HPA and VPA operate within the existing set of nodes. But what if all nodes are full? The **Cluster Autoscaler** (CA) adds new nodes when Pods are stuck in `Pending` because no existing node can accommodate them. It also removes underutilized nodes by cordoning and draining them.

The Cluster Autoscaler integrates with cloud provider APIs to actually provision or terminate instances. On EKS, it adjusts Auto Scaling Group desired counts. On GKE, it's built into the managed node pool. In all cases, it's triggered by unschedulable Pods, not by CPU utilization.

## KEDA: scaling on custom signals

The built-in HPA scales on CPU and memory. **KEDA** (Kubernetes Event-Driven Autoscaling) extends the HPA to scale on external event sources: Kafka consumer lag, SQS queue depth, Prometheus query results, HTTP request rate, and dozens more. For event-driven workloads — workers that process a queue — KEDA is often a better fit than raw CPU-based autoscaling.

<!-- RESOURCES -->

- [Kubernetes Docs - Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) -- type: docs, time: 25m
- [Metrics Server GitHub](https://github.com/kubernetes-sigs/metrics-server) -- type: tool, time: 10m
- [Cluster Autoscaler GitHub](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler) -- type: docs, time: 20m
- [KEDA - Kubernetes Event-Driven Autoscaling](https://keda.sh/) -- type: tool, time: 20m
