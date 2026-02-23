---
id: service-mesh-problems
title: Problems a Service Mesh Solves
zone: kubernetes-production
edges:
  to:
    - id: service-mesh-intro
      question: Those problems sound familiar. What actually solves them?
      detail: >-
        I'm seeing all of these problems — unencrypted inter-service traffic, no
        request-level metrics, no automatic retries. I'm adding logic to each
        service individually to deal with it. There has to be a way to handle
        this at the infrastructure level instead.
difficulty: 2
tags:
  - kubernetes
  - service-mesh
  - mtls
  - observability
  - traffic
  - security
  - k8s
  - production
category: concept
milestones:
  - >-
    Know what happens when two services talk over plain HTTP inside a cluster —
    and why that's a problem
  - Understand what mTLS is and why implementing it in every app is impractical
  - >-
    Know why request-level visibility (latency, error rate per route) is hard to
    get without instrumentation
  - >-
    Understand what a service mesh offloads so your application code doesn't
    have to
---

When services communicate over plain HTTP inside a Kubernetes cluster, you're operating without encryption, without identity verification between services, and without meaningful visibility into what's happening at the request level. These aren't theoretical concerns — they become operational problems as your service count grows.

<!-- DEEP_DIVE -->

## The unencrypted inter-service problem

Inside a Kubernetes cluster, service-to-service traffic travels over the cluster network unencrypted by default. Any pod that can observe network traffic — through a misconfiguration, a compromised pod, or a shared node — can read the payloads of requests between services.

For many internal services this is acceptable. For services that carry credentials, personal data, or payment information, it isn't.

The solution is mTLS (mutual TLS): both sides of a connection present certificates, verify each other's identity, and encrypt the channel. But implementing mTLS in every service means:
- Certificate management in every service
- Certificate rotation in every service
- Handling TLS negotiation failures in every service
- Consistent configuration across every language and framework

Most teams don't do this consistently. They add it to services where they remember to, and leave it out elsewhere.

## The observability gap

When a request from the frontend fails after passing through authentication → API gateway → order service → inventory service → database, which service is responsible? The frontend gets a 500 error. That's all you know.

With standard metrics and logs:
- You can see error rates per service
- You can see log output per service
- You cannot see the request as it traveled through the chain

Distributed tracing solves this (trace IDs propagated through request headers), but it requires every service to instrument and propagate trace headers correctly. In practice, one service in the chain that doesn't propagate trace IDs breaks the entire trace.

## Retry and timeout logic, duplicated everywhere

Service A calls Service B. Service B times out. Service A should retry with backoff. But Service A also calls Service C. The same retry logic is duplicated. And Service C has dependencies too.

This logic ends up implemented differently in every service, in every language, with different defaults and different failure modes. A service that was built by a team that didn't think about timeouts introduces a timeout-less connection that hangs indefinitely, creating cascading failures.

## Traffic shifting for canary deployments

You want to roll out a new version of the payment service to 5% of traffic first. With standard Kubernetes Services, you control this by replica count: 1 pod of the new version out of 20 pods total = 5% of traffic. It's imprecise and couples rollout percentage to pod count.

A proper canary deployment sends exactly 5% of requests to the new version regardless of replica count. Doing this without additional infrastructure requires logic in the ingress controller or the calling services — neither of which is designed for this.

## The signal that you need a service mesh

You need a service mesh when you find yourself solving these problems repeatedly:
- Adding mTLS to services one at a time and never finishing
- Building retry/timeout configurations in every service
- Flying blind during incidents because you don't know which hop is failing
- Wanting canary deployments but not being able to implement them cleanly

At small scale (3–5 services, internal-only traffic, low compliance requirements), plain HTTP plus basic logging is fine. The mesh adds operational complexity — it earns that cost when the alternative problems are more expensive.

<!-- RESOURCES -->

- [Kubernetes Docs - Connecting Applications with Services](https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/) -- type: docs, time: 15m
