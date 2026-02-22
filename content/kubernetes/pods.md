---
id: "pods"
title: "Pods"
zone: "kubernetes"
edges:
  from:
    - id: "why-kubernetes"
      question: "How do I actually run a container on Kubernetes?"
      detail: "You don't run containers directly in Kubernetes — you run Pods. A Pod is the smallest deployable unit, and understanding why Kubernetes chose this abstraction (instead of just 'a container') explains a lot about how the system works."
    - id: "namespaces"
      question: "Namespaces make sense. Now how do I actually run a workload in one?"
      detail: "With namespaces understood, you can run workloads in a properly organised cluster from day one. The fundamental unit you'll deploy is a Pod."
  to:
    - id: "services"
      question: "My Pod is running. How do I access it reliably?"
      detail: "A Pod gets an IP address — but that IP disappears when the Pod is replaced. You need a stable endpoint that doesn't change when Pods come and go. That's what a Service is."
    - id: "port-forward"
      question: "My Pod is running. I just want to quickly access it to see if it works — what's the simplest way?"
      detail: "kubectl port-forward tunnels traffic from your local machine to a Pod, without any networking setup on the cluster. It's a debugging tool, not a production solution — but it's the fastest way to verify your Pod is working."
    - id: "health-checks"
      question: "My Pod is running — but how does Kubernetes know if it's actually healthy and ready to serve traffic?"
      detail: "Running and healthy are different things. A Pod can be in the Running state while your app is still initialising, or silently broken. Probes are how you tell Kubernetes what 'ready' and 'alive' mean for your specific application."
difficulty: 1
tags: ["kubernetes", "pods", "containers", "k8s", "kubectl", "multi-container"]
category: "concept"
milestones:
  - "Write a Pod manifest and apply it with kubectl apply"
  - "Exec into a running Pod with kubectl exec"
  - "Read Pod logs with kubectl logs"
  - "Explain why a Pod can run multiple containers and when you'd want that"
  - "Understand why you shouldn't run naked Pods in production"
---

In Kubernetes, the smallest deployable unit is not a container — it's a Pod. A Pod wraps one or more containers that share a network stack and storage, and runs together on a single node. Understanding the Pod abstraction is the foundation for everything else in Kubernetes.

<!-- DEEP_DIVE -->

## Why not just "a container"?

The most natural question: why invent the "Pod" concept at all? Why not just schedule containers?

The short answer: sometimes two containers are so tightly coupled that they need to share a local network or filesystem. The Pod models that relationship. Two containers in the same Pod communicate over `localhost`, share a network interface, and can mount the same volumes.

The most common case is a Pod with exactly one container, and that's fine. The Pod is just a thin wrapper around it. But the abstraction exists for when you need that tight coupling.

## Writing a Pod manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  namespace: default
spec:
  containers:
    - name: app
      image: nginx:1.25
      ports:
        - containerPort: 80
```

Apply it:

```bash
kubectl apply -f pod.yaml
kubectl get pods
# NAME     READY   STATUS    RESTARTS   AGE
# my-app   1/1     Running   0          12s
```

Get logs: `kubectl logs my-app`

Exec into it: `kubectl exec -it my-app -- /bin/sh`

Describe it (events, status, container details): `kubectl describe pod my-app`

## The sidecar pattern

When would you run multiple containers in a Pod? The classic case is the **sidecar** — one container runs your application, a second runs a helper that doesn't belong in the app image.

Examples:

- A log shipper (Fluentd, Filebeat) that reads log files written by the app and forwards them to a central logging platform
- An Envoy proxy sidecar that handles mTLS and traffic management (how Istio works)
- A git-sync container that pulls config from a Git repository and writes it to a shared volume for the app to read

The key: sidecar containers need to run on the same node as the app, share its network interface, and often need access to the same files. The Pod provides exactly that.

## Why you shouldn't run naked Pods in production

A Pod by itself is not self-healing. If the node it's running on dies, the Pod is gone and doesn't come back. The container inside a Pod will be restarted if it crashes (based on `restartPolicy`), but the Pod itself is permanently tied to that one node.

For production workloads, you almost never create Pods directly. You create a **Deployment** instead. A Deployment manages a ReplicaSet, which manages Pods — and the Deployment controller ensures the right number of Pods are always running across the cluster. If a node dies, the affected Pods are rescheduled onto healthy nodes automatically.

Think of bare Pods as a learning and debugging tool. For anything that needs to stay alive, use a Deployment.

## Pod lifecycle phases

A Pod moves through these phases:

- **Pending** — scheduled but containers not yet started (pulling images, waiting for a node with enough resources)
- **Running** — at least one container is running
- **Succeeded** — all containers exited with code 0 (used for Jobs)
- **Failed** — at least one container exited non-zero and won't be restarted
- **Unknown** — the node isn't reporting back; usually a node connectivity problem

`kubectl describe pod <name>` shows the events log that explains why a Pod is stuck in any of these phases. It's the first thing to check when a Pod won't start.

<!-- RESOURCES -->

- [Kubernetes Docs - Pods](https://kubernetes.io/docs/concepts/workloads/pods/) -- type: docs, time: 20m
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) -- type: reference, time: 15m
- [Kubernetes Docs - Sidecar Containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/) -- type: docs, time: 10m
