---
id: deployment-strategies
title: Deployment Strategies
zone: kubernetes
edges:
  to:
    - id: gitops-with-argocd
      question: >-
        I understand deployment strategies. How do I automate all of this so
        updates happen from a Git push?
      detail: >-
        I understand blue-green and canary deployments now — but I'm still
        triggering all of this manually. I want a code push to be what kicks it
        off, not me running kubectl commands. How does that actually get wired
        up?
difficulty: 2
tags:
  - kubernetes
  - deployment-strategies
  - blue-green
  - canary
  - rolling-update
  - argo-rollouts
  - k8s
category: concept
milestones:
  - >-
    Implement a blue-green deployment using two Deployments and a Service
    selector swap
  - Implement a basic canary by running two Deployments with weighted traffic
  - Understand what Argo Rollouts adds on top of standard Kubernetes Deployments
  - >-
    Know when to use rolling update vs blue-green vs canary based on risk
    tolerance
---

Kubernetes rolling updates are safe for most changes, but they give you limited control: old and new versions handle traffic simultaneously during the transition. Blue-green and canary deployments give you more options — either an instant, clean switch between versions, or a gradual rollout with real traffic testing before full commitment.

<!-- DEEP_DIVE -->

## Rolling update (the default)

The Deployment rolling update gradually replaces old Pods with new ones. It's zero-downtime for properly configured apps and requires no extra tooling. The trade-off: during the transition, old and new versions both receive traffic simultaneously.

If your change is backwards-incompatible — a breaking API change, a database schema change that the old code can't read — a rolling update can cause errors during the transition window. In those cases, you need more control.

## Blue-green deployments

Blue-green means two complete environments: the live one (blue) and the new version (green). All traffic is on blue. When you're confident in green — you've tested it, your metrics look good — you switch all traffic to it at once by updating a Service selector.

On Kubernetes, implement this with two Deployments:

```yaml
# Service — controls which version gets traffic
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
    slot: blue      # change to "green" to switch all traffic instantly
  ports:
    - port: 80
      targetPort: 8080
```

Deploy the green Deployment alongside blue (with label `slot: green`), test it with port-forward or a separate Service, then flip:

```bash
kubectl patch service my-app -p '{"spec":{"selector":{"slot":"green"}}}'
```

Traffic immediately flows to green. If anything is wrong, flip back to blue instantly. Once satisfied, scale down blue.

The cost: you're running twice the compute during the switchover window. For large Deployments, that's significant.

## Canary deployments

Canary means sending a small slice of real traffic to the new version while the majority stays on the old version. If the canary looks healthy — error rate, latency, business metrics — you gradually increase the traffic split until the rollout is complete.

A simple Kubernetes canary without extra tooling: two Deployments sharing the same Service label, with different replica counts to control the traffic split:

```yaml
# stable: 9 replicas → ~90% of traffic
# canary: 1 replica  → ~10% of traffic
# Service selector matches both via shared label "app: my-app"
```

This is blunt — the split is purely proportional to replica counts. For precise traffic weights (10% regardless of replica count), you need an Ingress controller that supports traffic splitting (Traefik, NGINX with annotations), or a service mesh (Istio, Linkerd).

## Argo Rollouts

**Argo Rollouts** is a Kubernetes controller that replaces the standard Deployment with a `Rollout` resource that natively supports progressive delivery strategies:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 10       # send 10% to new version
        - pause: {duration: 5m}
        - analysis: {...}     # check Prometheus metrics; abort if error rate spikes
        - setWeight: 50
        - pause: {duration: 5m}
        - setWeight: 100
```

Argo Rollouts integrates with ArgoCD for GitOps-driven progressive delivery — a Git commit triggers the rollout, analysis gates decide whether to proceed or auto-rollback.

## Choosing a strategy

- **Rolling update** — the right default for backwards-compatible changes. No extra tooling, no extra cost.
- **Blue-green** — when you need an instant, clean switch between versions and can afford the extra compute.
- **Canary** — when you want to test a new version with real production traffic before committing to a full rollout, especially for high-risk changes.

<!-- RESOURCES -->

- [Argo Rollouts Documentation](https://argo-rollouts.readthedocs.io/) -- type: docs, time: 30m
- [Kubernetes Deployment Strategies - Container Solutions](https://blog.container-solutions.com/kubernetes-deployment-strategies) -- type: article, time: 15m
- [Kubernetes Docs - Deployments (strategy section)](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy) -- type: docs, time: 15m
