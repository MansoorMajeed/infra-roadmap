---
id: debugging-deployments
title: Debugging Deployments
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - debugging
  - deployments
  - rollout
  - kubectl
  - k8s
category: practice
milestones:
  - >-
    Use kubectl rollout status to see whether a rollout is progressing or stuck
  - >-
    Identify why new pods are failing during a rollout — image errors, bad
    config, failing readiness probes
  - Roll back a broken deployment with kubectl rollout undo
  - >-
    Understand why a readiness probe failure stalls a rollout rather than
    completing it
---

A stuck rollout almost always means the new pods are failing — either they're crashing immediately, or they're running but failing their readiness probe. Kubernetes deliberately holds the old pods until new ones are healthy, so a stuck rollout is a safety mechanism, not a bug.

<!-- DEEP_DIVE -->

## Check rollout status first

```bash
kubectl rollout status deployment/my-app
```

If this is stuck, Kubernetes is waiting for new pods to become ready. It won't remove old pods until new ones pass their readiness probe.

See the full rollout history:

```bash
kubectl rollout history deployment/my-app
```

## Find the failing pods

During a rollout, there will be a mix of old and new pods. Identify which generation is which:

```bash
kubectl get pods -l app=my-app
```

Look for pods in `CrashLoopBackOff`, `Error`, or stuck in `0/1 Running` (container running but not passing readiness). The pods with a newer creation timestamp are the new ones.

Check what the new pods are doing:

```bash
kubectl logs my-app-<new-pod-hash> --previous
kubectl describe pod my-app-<new-pod-hash>
```

The Events section in `describe` will tell you whether it's an image pull failure, a crash, or a readiness probe timeout.

## Common causes

**Wrong image tag** — the image doesn't exist in the registry. `kubectl describe pod` will show `ImagePullBackOff` in Events with the exact registry error.

**Bad environment variable or secret** — the app starts, tries to connect somewhere using a misconfigured URL or credential, and crashes. The error will be in `kubectl logs --previous`.

**Readiness probe failing** — the container is running but not passing the readiness check. The pod shows `0/1 Running`. `kubectl describe pod` will show repeated probe failures in Events. The pod is alive but Kubernetes won't count it as ready, so the rollout stalls. Check whether the probe path, port, or timing is wrong.

**Resource limits too low** — if the container hits its memory limit during startup, it gets OOMKilled before it can become ready. Exit code 137. Increase the memory limit.

## Roll back immediately

If you need to restore the previous version right now:

```bash
kubectl rollout undo deployment/my-app
```

To go back to a specific revision:

```bash
kubectl rollout undo deployment/my-app --to-revision=3
```

The rollback triggers a new rollout — it scales up the previous ReplicaSet and scales down the broken one. Watch it with `kubectl rollout status`.

## Pause a rollout while you investigate

If you want to stop the rollout without rolling back (to preserve the partially-deployed state while you debug):

```bash
kubectl rollout pause deployment/my-app
# ... investigate ...
kubectl rollout resume deployment/my-app
```

## A systematic approach

1. `kubectl rollout status deployment/my-app` — is it stuck?
2. `kubectl get pods` — which new pods exist and what state are they in?
3. `kubectl logs <new-pod> --previous` — what did it print before crashing?
4. `kubectl describe pod <new-pod>` — Events section: image pull? probe failures? OOMKilled?
5. Fix the underlying cause (image, config, probe, limits) then re-apply
6. If you need to restore immediately: `kubectl rollout undo`

<!-- RESOURCES -->

- [Kubernetes Docs - Performing a Rollback](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment) -- type: docs, time: 15m
