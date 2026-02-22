---
id: "port-forward"
title: "Accessing Pods with Port Forward"
zone: "kubernetes"
edges:
  from:
    - id: "pods"
      question: "My Pod is running. I just want to quickly reach it — what's the easiest way?"
      detail: "kubectl port-forward is the fastest path from 'Pod is running' to 'I can open it in my browser'. It tunnels traffic directly from a local port to the Pod — no service, no ingress, no networking config needed. Perfect for development and debugging."
  to:
    - id: "services"
      question: "Port-forward works for local testing. What's the proper way to expose a Pod inside the cluster?"
      detail: "Port-forward is temporary — it only works while the command is running, only works from your machine, and it bypasses all cluster networking. A Service is the real answer: a stable, cluster-level endpoint that routes to your Pods regardless of which machine they're running on or when they restart."
difficulty: 1
tags: ["kubernetes", "kubectl", "port-forward", "debugging", "development", "k8s"]
category: "practice"
milestones:
  - "Use kubectl port-forward to reach a Pod from your local browser"
  - "Understand why port-forward is not suitable for production access"
  - "Know the difference between port-forwarding to a Pod vs to a Service"
---

`kubectl port-forward` creates a tunnel from a port on your local machine directly to a port on a Pod in the cluster. It bypasses Services, Ingress, and any other cluster networking — making it the fastest way to verify a Pod is working without setting up anything else.

<!-- DEEP_DIVE -->

## How it works

```bash
kubectl port-forward pod/my-app 8080:80
```

This forwards `localhost:8080` on your machine to port 80 on the Pod `my-app`. Open `http://localhost:8080` in a browser and you're hitting that Pod directly.

You can also forward to a Service (which load-balances across the Service's Pods):

```bash
kubectl port-forward service/my-service 8080:80
```

The connection is maintained for as long as the `kubectl` command is running. Kill it with Ctrl-C and the tunnel closes.

## What it's good for

- Checking that a newly deployed Pod is serving the right response before configuring a Service
- Accessing internal dashboards (Prometheus UI, ArgoCD, Kubernetes Dashboard, Grafana) that you deliberately don't expose to the internet
- Debugging a specific Pod instance when you're investigating a problem on that particular replica
- Reaching a database or cache from your local machine without SSH tunnels

## What it's not

Port-forward is a debugging shortcut, not a networking solution. It:

- Only works while the command is running — there's no persistent tunnel
- Only works from your local machine
- Routes to one specific Pod or Service backend — if the Pod restarts, you need to re-run the command
- Has no authentication, TLS, or load balancing beyond what's on the Pod itself

For production traffic to reach your Pods, use Services and Ingress.

## Targeting a specific namespace

If your Pod isn't in the default namespace, add `-n`:

```bash
kubectl port-forward pod/my-app 8080:80 -n my-namespace
```

And if you want to forward a local port to a container port that uses a different number:

```bash
kubectl port-forward pod/my-app 9090:8080
# local:9090 → container:8080
```

<!-- RESOURCES -->

- [kubectl port-forward docs](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/) -- type: docs, time: 5m
- [Kubernetes Docs - Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/) -- type: docs, time: 15m
