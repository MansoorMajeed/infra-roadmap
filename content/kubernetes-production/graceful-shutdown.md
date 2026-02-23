---
id: graceful-shutdown
title: Graceful Pod Shutdown
zone: kubernetes-production
edges:
  to:
    - id: pod-scheduling-spread
      question: >-
        My app shuts down cleanly, but I just realized all my replicas might be
        running on the same node.
      detail: >-
        I handle SIGTERM properly so my app drains. But if all my replicas land
        on the same node and that node goes away — hardware failure, maintenance
        drain, whatever — there's nothing left to serve traffic. How do I
        actually guarantee they end up on different nodes?
difficulty: 3
tags:
  - kubernetes
  - sigterm
  - sigkill
  - graceful
  - shutdown
  - prestop
  - k8s
  - production
category: practice
milestones:
  - >-
    Understand the shutdown sequence: SIGTERM → terminationGracePeriodSeconds →
    SIGKILL
  - >-
    Know why endpoints are removed asynchronously and what that means for
    in-flight requests
  - Understand the preStop hook sleep trick and why it exists
  - >-
    Know what your application needs to do: handle SIGTERM, drain connections,
    close DB pools
---

When Kubernetes kills a pod — during a rolling update, a node drain, or a scale-down — in-flight requests can fail unless the application handles shutdown correctly. This isn't just about catching SIGTERM; there's a timing issue built into how Kubernetes removes pods from the load balancer that you need to work around explicitly.

<!-- DEEP_DIVE -->

## The shutdown sequence

When a pod is deleted, several things happen:

1. Kubernetes sets the pod's status to `Terminating`
2. If a `preStop` hook is defined, it runs first
3. SIGTERM is sent to the container
4. Simultaneously, the pod's IP is removed from Service endpoints (stops new traffic from routing to it)
5. The `terminationGracePeriodSeconds` countdown begins (default: 30 seconds)
6. If the container is still running when the grace period expires, SIGKILL is sent

Your application's job: catch SIGTERM, finish in-flight requests, close connections cleanly, exit.

## The race condition you must work around

Step 3 (SIGTERM) and step 4 (removing endpoints) happen simultaneously — but they're handled by different Kubernetes controllers that don't coordinate with each other. The endpoint update propagates through the cluster asynchronously: it goes to kube-proxy, which updates iptables on every node, which takes some amount of time.

During that propagation window (typically 1–5 seconds), traffic is still being routed to your pod even though it has received SIGTERM. If your application stops accepting connections immediately on SIGTERM, those requests fail.

## The preStop sleep trick

The most practical solution is a preStop hook that sleeps for a few seconds before SIGTERM is sent:

```yaml
lifecycle:
  preStop:
    exec:
      command: [sh, -c, "sleep 5"]
```

This gives the endpoint removal time to propagate through kube-proxy before the container starts shutting down. The preStop hook runs, the process sleeps for 5 seconds, SIGTERM fires, the application drains its connections and exits. By the time SIGTERM fires, no new traffic is being routed to the pod.

The 5 second delay does increase the time a pod takes to shut down. It's worth it.

## What your application must do

The preStop trick buys time, but your application still needs to handle shutdown correctly:

**Stop accepting new connections** — when you receive SIGTERM, stop listening for new connections.

**Finish in-flight requests** — allow currently running request handlers to complete. Don't kill them mid-way.

**Close database connection pools** — return connections to the pool cleanly. An abrupt exit leaves connections open on the server side until they time out.

**Exit cleanly** — call `os.Exit(0)` or equivalent after draining. If you don't exit, Kubernetes waits until `terminationGracePeriodSeconds` and then SIGKILLs the process.

Most web frameworks have built-in graceful shutdown support. In Go, `http.Server.Shutdown`. In Node.js, close the server with `server.close()`. In Java (Spring Boot), the `server.shutdown=graceful` property. Use it.

## Setting terminationGracePeriodSeconds

The default is 30 seconds. If your application can take longer to drain (long-running requests, slow connection draining), set it higher:

```yaml
spec:
  terminationGracePeriodSeconds: 60
```

If your application exits faster (most stateless web apps), keeping it at 30 is fine. Don't set it lower than 10 — you need time for both the preStop delay and the actual drain.

For batch jobs or long-running processes, you may need minutes or more. Set it to match the maximum time the job needs to complete a unit of work.

<!-- RESOURCES -->

- [Kubernetes Docs - Pod Termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination) -- type: docs, time: 20m
- [Kubernetes Docs - Container Lifecycle Hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/) -- type: docs, time: 15m
