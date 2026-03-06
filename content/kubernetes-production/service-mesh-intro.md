---
id: service-mesh-intro
title: Service Meshes
zone: kubernetes-production
edges:
  to:
    - id: always-firefighting
      zone: sre
      question: >-
        The infrastructure is sorted — GitOps, autoscaling, security,
        networking. But we're still scrambling every time something breaks.
        Is there a more structured way to run all of this?
      detail: >-
        We have great tooling now. But incidents are still chaos — nobody
        knows who's in charge, we keep having the same problems, and there's
        no process for learning from failures. The technology is solid but
        the way we operate feels broken. How do teams actually do this
        professionally?
difficulty: 3
tags:
  - kubernetes
  - istio
  - linkerd
  - cilium
  - service-mesh
  - mtls
  - k8s
  - production
category: concept
milestones:
  - >-
    Understand what a service mesh does: automatic mTLS, traffic policies,
    request tracing
  - >-
    Know the three main options: Istio (full-featured), Linkerd (simple), Cilium
    (eBPF, no sidecar)
  - >-
    Understand the real cost: CPU overhead per pod, operational complexity,
    steep learning curve
  - Know honestly when you need a service mesh vs when you're over-engineering
---

A service mesh moves networking concerns — encryption, retries, timeouts, observability — out of application code and into infrastructure. It intercepts all service-to-service traffic and adds these capabilities automatically, without changing the applications themselves. The catch: it adds real operational complexity and resource overhead.

<!-- DEEP_DIVE -->

## How it works: the sidecar model

The traditional service mesh approach injects a proxy sidecar container into every pod. This proxy intercepts all inbound and outbound network traffic. The application talks to localhost; the sidecar handles the actual network communication.

```
Pod: [your-app container] <—localhost—> [envoy proxy sidecar]
                                                ↕
                                         cluster network
```

Because the proxy is at the kernel network level, it can intercept and transform traffic without any code changes to the application. You get mTLS, retries, circuit breaking, and request metrics for free.

The data plane (the proxies) is configured by a control plane that watches Kubernetes resources and pushes configuration to all proxies.

## What a service mesh gives you

**Automatic mTLS** — every connection between pods gets encrypted and authenticated. Both sides present certificates issued by the mesh's certificate authority. Certificates are rotated automatically. No changes required in application code.

**Request-level metrics** — latency, error rate, request rate, and response size per source/destination pair. You can answer "what percentage of requests from the order service to the inventory service are failing?" without any application instrumentation.

**Distributed tracing** — the mesh injects trace headers and propagates them automatically. Traces appear in Jaeger or Zipkin without application changes (though applications still need to propagate headers through async calls).

**Retries and timeouts** — configurable at the mesh level per route. One policy applies to all services using that route.

**Traffic splitting** — send 5% of traffic to the new version, 95% to the stable version. Shift gradually. All controlled by CRDs, not by replica count.

**Circuit breaking** — automatically stop sending requests to a service that's failing, giving it time to recover.

## The three main options

**Istio** — the most complete and most widely adopted. Extensive feature set: advanced traffic management, authorization policies, telemetry. Also the most complex. The control plane (istiod) is significant infrastructure. Configuration is verbose. Learning curve is steep.

If you need the full feature set and have a team that will invest in operating it, Istio is the most capable option.

**Linkerd** — much simpler. Written in Rust (lower resource overhead). Opinionated and minimal. Easier to install and operate. Lacks some of Istio's advanced traffic management features but covers the core use cases well.

If you want a mesh that's easier to operate and covers 90% of use cases, Linkerd is the right choice.

**Cilium** — eBPF-based. No sidecar. Uses Linux kernel eBPF programs to implement networking at the kernel level rather than through a proxy. Lower per-pod overhead. Also serves as the CNI (replacing traditional sidecar-based approaches entirely).

Requires a recent Linux kernel (5.10+). Works best on AWS, GKE, and AKS where you control the node OS. The most performant option. Increasingly the choice for new deployments.

## The real cost

**CPU and memory overhead** — every pod gets a sidecar proxy. On large clusters with many small pods, this adds up: a typical Envoy sidecar uses 50–100m CPU and 50–100Mi memory per pod at idle, more under load.

**Latency overhead** — every request goes through two proxy hops (source sidecar → destination sidecar). Well-tuned meshes add < 1ms in the p99. Poorly tuned or under-resourced meshes can add much more.

**Operational complexity** — the mesh control plane is its own distributed system. It needs to be upgraded, monitored, and debugged. When the mesh has a bug, networking for your entire cluster can be affected.

**Debugging difficulty** — when something goes wrong with network connectivity, the mesh is now a suspect. Debugging requires understanding proxy configuration, certificate issues, and mesh policies on top of Kubernetes networking.

## Honest assessment: do you need it?

A service mesh earns its cost when you need mTLS between every service for compliance, or when you have enough services that per-service observability instrumentation has become unmanageable, or when you're doing sophisticated traffic management (canary deployments, traffic splitting).

If you have 5 services with no compliance requirements, add Prometheus metrics to your apps directly, use your ingress controller for basic traffic splitting, and skip the mesh. The operational overhead doesn't pay off at small scale.

<!-- RESOURCES -->

- [Istio Documentation](https://istio.io/latest/docs/) -- type: docs, time: 30m
- [Linkerd Getting Started](https://linkerd.io/2.15/getting-started/) -- type: docs, time: 20m
- [Cilium Documentation](https://docs.cilium.io/en/stable/) -- type: docs, time: 25m
