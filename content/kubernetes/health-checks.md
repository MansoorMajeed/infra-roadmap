---
id: "health-checks"
title: "Health Checks: Liveness, Readiness, and Startup Probes"
zone: "kubernetes"
edges:
  from:
    - id: "pods"
      question: "My Pod is running — but how does Kubernetes know if it's actually healthy and ready for traffic?"
      detail: "kubectl shows the Pod as Running, but 'running' just means the container process started. It doesn't mean your app finished initialising, connected to the database, or is capable of handling requests. Probes are how you tell Kubernetes what 'healthy' actually means for your application."
  to:
    - id: "services"
      question: "Probes are configured. Now how do I expose my Pod with a stable endpoint?"
      detail: "My probes are configured and Kubernetes knows when my pod is healthy. But how does traffic actually reach my pods? They have IPs that change every time they restart — I need something stable that I can point DNS at, something that finds the healthy pods automatically."
difficulty: 2
tags: ["kubernetes", "liveness-probe", "readiness-probe", "startup-probe", "health-checks", "reliability", "k8s"]
category: "practice"
milestones:
  - "Add a readiness probe to a Pod and verify it's removed from Service endpoints during startup"
  - "Add a liveness probe and watch Kubernetes restart a Pod that stops responding"
  - "Understand when to use a startup probe instead of a long initialDelaySeconds"
  - "Explain the difference: liveness (is it broken?) vs readiness (is it ready for traffic?)"
  - "See what happens to a rolling update when the new Pod fails its readiness probe"
---

Kubernetes has three types of probes for monitoring container health: liveness (is it broken and needs restarting?), readiness (is it ready to receive traffic?), and startup (has it finished initializing?). Configuring them correctly is the difference between self-healing infrastructure and a service that silently fails under load.

<!-- DEEP_DIVE -->

## The three probes

**Liveness probe** — answers "is this container broken in a way that warrants a restart?" If a liveness probe fails repeatedly, Kubernetes kills the container and restarts it. Use this for detecting deadlocks, memory leaks that make the app unresponsive, or any state where "restart it" is the right fix.

**Readiness probe** — answers "is this container ready to serve traffic?" A failing readiness probe removes the Pod from the Service's endpoint list. Traffic stops being routed to it. This is not a restart — the Pod keeps running, it just receives no traffic until it recovers. Use this to signal "I'm still initializing" or "I'm under too much load, back off."

**Startup probe** — answers "has this container finished starting up?" It blocks the liveness and readiness probes from running until it passes. Use this for slow-starting apps (JVM services, anything loading large datasets on boot) — it prevents the liveness probe from killing the container before it's had time to start.

## Probe types

All three probes support the same check mechanisms:

**HTTP GET** — the most common. Kubernetes makes an HTTP request; any 2xx or 3xx response counts as healthy:

```yaml
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3
```

**TCP Socket** — opens a TCP connection; success means the port is accepting connections. Good for non-HTTP services:

```yaml
readinessProbe:
  tcpSocket:
    port: 5432
  initialDelaySeconds: 5
  periodSeconds: 10
```

**Exec** — runs a command inside the container; exit code 0 is healthy:

```yaml
livenessProbe:
  exec:
    command: ["redis-cli", "ping"]
  periodSeconds: 10
```

## Common configuration fields

- `initialDelaySeconds` — how long to wait after container start before running the first probe
- `periodSeconds` — how often to run the probe (default: 10s)
- `timeoutSeconds` — how long to wait for a response before counting it as a failure
- `failureThreshold` — how many consecutive failures before acting (restarting for liveness, removing from Service endpoints for readiness)
- `successThreshold` — how many consecutive successes to be considered healthy again after a failure (always 1 for liveness and startup)

## How readiness integrates with rolling updates

During a rolling update, Kubernetes replaces Pods one by one. A new Pod only starts receiving traffic after its readiness probe passes. If the new Pod never passes readiness, the rolling update pauses — it stops replacing old Pods, and your old version keeps serving traffic.

This is the safety net that makes rolling updates safe: a broken new version can't take over the Deployment because it never becomes "ready." The update stalls rather than silently failing.

## What not to probe

Don't wire your readiness probe to an external database. If your database goes down, all your Pods fail readiness simultaneously, all traffic drops — even though the Pods themselves are fine. Your app should handle database outages (return errors, use circuit breakers), not respond by refusing to serve traffic.

Probes should check your app's internal health, not the health of its dependencies.

<!-- RESOURCES -->

- [Kubernetes Docs - Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) -- type: docs, time: 25m
- [Liveness Probes are Dangerous](https://srcco.de/posts/kubernetes-liveness-probes-are-dangerous.html) -- type: article, time: 10m
- [Kubernetes Docs - Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) -- type: docs, time: 15m
