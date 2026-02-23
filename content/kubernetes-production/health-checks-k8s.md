---
id: health-checks-k8s
title: 'Health Checks: Liveness, Readiness, Startup'
zone: kubernetes-production
edges:
  to:
    - id: graceful-shutdown
      question: >-
        Kubernetes knows when my app is sick. But what happens when it decides
        to restart or move a pod — does traffic just get dropped?
      detail: >-
        My liveness probe works and unhealthy pods get restarted. But what
        happens to requests that are in-flight when the pod gets killed? Do they
        just fail, or is there something that drains them first?
difficulty: 2
tags:
  - kubernetes
  - liveness
  - readiness
  - startup
  - probes
  - health
  - k8s
  - production
category: practice
milestones:
  - Understand the three probe types and when each fires
  - >-
    Know the critical mistake: an aggressive liveness probe that causes restart
    loops
  - >-
    Know the readiness probe problem: no probe means traffic hits pods that
    aren't ready
  - >-
    Understand when startup probes save JVM and heavy-framework apps from being
    killed during boot
  - 'Write HTTP, TCP, and exec probe configurations'
---

Kubernetes has three probe types for checking container health, and each one does a fundamentally different thing. Configuring the wrong probe type for the wrong purpose is one of the most common causes of self-inflicted production incidents — including restart loops that take your service down entirely.

<!-- DEEP_DIVE -->

## The three probe types

**Liveness probe** — answers the question: "Is this container in a state it can never recover from?" If the liveness probe fails, Kubernetes kills the container and restarts it.

**Readiness probe** — answers the question: "Is this container ready to receive traffic?" If the readiness probe fails, Kubernetes removes the pod from the Service endpoints. Traffic stops going to it. The pod isn't killed — it stays running but receives no traffic until the probe passes again.

**Startup probe** — answers the question: "Has this container finished starting up?" Used to protect slow-starting containers from the liveness probe firing too early. While the startup probe hasn't passed, the liveness probe is disabled.

## The dangerous liveness probe mistake

This is the most consequential misconfiguration: using the liveness probe to check things the container has no control over.

Example of what not to do: checking that your database is reachable in the liveness probe. If the database goes down, all your pods fail their liveness probe and Kubernetes starts killing and restarting them — over and over, in a loop. The restarts don't fix the database. You've now made the situation worse: your app goes from degraded (slow queries, errors) to completely unavailable (restart loop).

The liveness probe should only check things that indicate the process itself is stuck and needs to be killed. An HTTP endpoint that returns 200 as long as the application's event loop is responsive. A simple check that the process hasn't deadlocked.

**Readiness** is the right probe for dependency failures. If the database is unreachable, fail the readiness probe. Traffic stops hitting the pod. The pod stays running and ready to serve as soon as the database comes back — no restart needed.

## No readiness probe is also a problem

Without a readiness probe, Kubernetes adds a pod to the Service endpoints as soon as it's Running. Your application might take 10 seconds to load configuration, warm caches, or establish connection pools. During those 10 seconds, live traffic is hitting an unready pod and failing.

Always configure a readiness probe for services that receive traffic.

## Startup probe for slow applications

JVM applications, Rails, and other heavy frameworks can take 30–90 seconds to start. Without a startup probe:
- Set liveness `initialDelaySeconds` too short → liveness fires during startup → restart loop
- Set it too long → a genuinely crashed pod isn't detected for a long time

The startup probe is a clean solution: it fires repeatedly during startup until the app is ready. Once it passes, it hands off to the liveness probe for the rest of the container's life.

## Probe configuration

All three probes support the same probe types:

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10    # wait this long before starting
  periodSeconds: 10          # check every N seconds
  failureThreshold: 3        # fail this many times before action
  successThreshold: 1        # pass this many times before healthy

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30       # 30 * 10s = 5 minutes to start
  periodSeconds: 10
```

Beyond `httpGet`, probes also support `tcpSocket` (checks if a port accepts connections) and `exec` (runs a command in the container; exit code 0 = healthy).

## Separate liveness and readiness endpoints

Expose two different HTTP endpoints: `/healthz` for liveness (always returns 200 as long as the process is alive), `/ready` for readiness (returns 200 only when dependencies are available and the app is ready to serve). Keep them separate — conflating them leads to the liveness-checking-dependencies mistake.

<!-- RESOURCES -->

- [Kubernetes Docs - Configure Liveness, Readiness, and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) -- type: docs, time: 25m
