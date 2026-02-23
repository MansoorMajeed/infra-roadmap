---
id: debugging-pods
title: Debugging Pods
zone: kubernetes
edges:
  to: []
difficulty: 1
tags:
  - kubernetes
  - debugging
  - pods
  - crashloopbackoff
  - kubectl
  - logs
  - k8s
category: practice
milestones:
  - Use kubectl logs to see what a container printed before it crashed
  - >-
    Use kubectl describe pod to read the Events section — this is where
    Kubernetes explains what it tried and what went wrong
  - Use kubectl exec to get a shell inside a running container
  - >-
    Recognize the common failure states: CrashLoopBackOff, Pending,
    ImagePullBackOff, OOMKilled — and know what each one means
  - >-
    Use kubectl get events to see a timeline of what happened to a pod
---

When a pod isn't behaving, Kubernetes gives you several tools to understand why. The hard part for new users is knowing which tool to reach for first and how to read what it tells you.

<!-- DEEP_DIVE -->

## Start with kubectl logs

The first thing to check when a pod is crashing is what the container printed before it died:

```bash
kubectl logs my-pod
```

If the container has already exited, add `--previous` to see the logs from the last run:

```bash
kubectl logs my-pod --previous
```

If your pod has multiple containers (or init containers), specify which one:

```bash
kubectl logs my-pod -c my-container
kubectl logs my-pod -c my-init-container
```

Logs tell you what your application reported. If it crashed with a stack trace, a missing environment variable, a connection refused error — it's in here.

## kubectl describe pod — the Events section

When logs aren't enough (or the container never started at all), `kubectl describe pod` is your next stop:

```bash
kubectl describe pod my-pod
```

The most useful part is at the bottom — the **Events** section. It shows what Kubernetes itself has been doing:

```
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  2m                default-scheduler  Successfully assigned default/my-pod to node-1
  Normal   Pulling    2m                kubelet            Pulling image "my-app:latest"
  Warning  Failed     2m                kubelet            Failed to pull image: rpc error: ...
  Warning  BackOff    90s (x3 over 2m)  kubelet            Back-off pulling image
```

Events tell you about scheduling, image pulls, volume mounts, probe failures — things that happen at the Kubernetes level before your app even starts.

## kubectl exec — get inside a running container

If the pod is running but behaving unexpectedly, you can open a shell inside it:

```bash
kubectl exec -it my-pod -- /bin/sh
```

Use `/bin/bash` if the image has it. From inside, you can check environment variables, test network connections, look at filesystem paths, or manually run commands your app would run.

```bash
# Check env vars are what you expect
env | grep DATABASE

# Test if a dependency is reachable
curl http://postgres-service:5432

# Inspect the filesystem
ls -la /app/config/
```

## Common failure states and what they mean

**CrashLoopBackOff** — the container starts, crashes, and Kubernetes keeps restarting it with increasing delays. The container is running long enough to exit with a non-zero code. Check `kubectl logs --previous` to see what it printed before exiting.

**Pending** — the pod hasn't been scheduled to a node yet. This means the scheduler can't find a suitable node. Common causes:
- Not enough CPU or memory available on any node
- A node selector or affinity rule that no node satisfies
- A PVC that hasn't bound yet (the pod waits for its volumes)

Check `kubectl describe pod` — the Events section will say why it can't schedule.

**ImagePullBackOff** — Kubernetes can't pull the container image. Either the image name is wrong, the tag doesn't exist, or the registry requires credentials that aren't configured. The Events section will show the exact error message from the registry.

**OOMKilled** — the container exceeded its memory limit and was killed by the kernel. The exit code is 137. Either the memory limit is too low, or the application has a memory leak. Increase the limit or investigate the leak.

**Error** (exit code non-zero) — the container started and exited with a failure. Check logs.

## kubectl get events

For a broader picture of what's happening across the namespace:

```bash
kubectl get events --sort-by='.lastTimestamp'
```

To filter events for a specific pod:

```bash
kubectl get events --field-selector involvedObject.name=my-pod
```

Events are namespace-scoped and expire after an hour by default, so check them while things are still fresh.

## A systematic approach

When a pod isn't working:

1. `kubectl get pods` — what state is it in?
2. `kubectl describe pod my-pod` — read the Events section
3. `kubectl logs my-pod --previous` — what did the container print?
4. `kubectl exec -it my-pod -- /bin/sh` — if it's running, get inside
5. `kubectl get events --field-selector involvedObject.name=my-pod` — broader timeline

Most pod problems are one of: wrong image, missing environment variable, missing secret, failing readiness probe, or not enough resources. The tools above will surface whichever one it is.

<!-- RESOURCES -->

- [Kubernetes Docs - Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) -- type: docs, time: 20m
- [Kubernetes Docs - Determine the Reason for Pod Failure](https://kubernetes.io/docs/tasks/debug/debug-application/determine-reason-pod-failure/) -- type: docs, time: 10m
