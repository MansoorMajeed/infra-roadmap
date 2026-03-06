---
id: dependency-slos
title: Dependency SLOs
zone: sre
edges:
  to:
    - id: error-budgets
      question: >-
        My SLO now accounts for my dependencies. How does this translate into
        a budget for reliability work?
      detail: >-
        I've set a composite SLO that factors in what my dependencies can
        deliver. Now I have a target that's actually achievable. But I'm still
        not sure how this target guides day-to-day engineering decisions — how
        does it change what I work on next?
difficulty: 2
tags:
  - slo
  - dependency-slos
  - composite-slo
  - sre
  - reliability
  - service-dependencies
category: concept
milestones:
  - Explain why your service SLO cannot exceed the weakest SLO in your dependency chain
  - Calculate a composite availability given three services each at 99.9%
  - Identify all direct dependencies for a service and find their published SLOs
  - Understand what to do when a dependency's SLO is worse than yours needs to be
---

You cannot be more reliable than your dependencies. This sounds obvious, but it has a concrete mathematical implication: if your service calls five other services to process a request, and each has 99.9% availability, your composite availability is approximately 99.5%. Not 99.9%. Not even close. Your SLO needs to account for this reality — otherwise you're committing to a target that's physically impossible to hit.

<!-- DEEP_DIVE -->

## The math of dependency chains

Availability compounds multiplicatively. If service A depends on services B and C, and a request to A requires both B and C to succeed:

```
P(A succeeds) = P(B succeeds) × P(C succeeds)
              = 0.999 × 0.999
              = 0.998 (99.8%)
```

Add a third dependency at 99.9% and you're at 99.7%. Add a fourth and you're at 99.6%. Five dependencies each at 99.9% gives you approximately 99.5% — barely. If any of your dependencies is at 99% availability, the math gets painful fast.

This isn't hypothetical. A checkout service that calls auth, product catalogue, inventory, payments, and notifications has five single points of failure before it even talks to its own database. Setting a 99.9% SLO for that service without understanding the dependency chain is committing to an engineering miracle.

## What to do with this information

First, **catalog your dependencies**. For every service you own, map every outbound call. Include databases, caches, message queues, third-party APIs, internal microservices. Everything. Most engineers are surprised by how long the list is.

Second, **find the published SLOs for each dependency**. If they don't have SLOs, that's information too — they're implicitly promising nothing. Treat undocumented dependencies as lower reliability than you'd like.

Third, **set your SLO at or below the composite availability**. If your dependencies give you a ceiling of 99.5%, your SLO cannot exceed 99.5%. You can aspire to exceed your own SLO, but you can't commit to it.

## Breaking the dependency problem

If the math doesn't work — if your dependencies limit your availability to something lower than what users need — you have engineering options:

**Caching** — store dependency responses locally. Availability now depends on cache hit rate + dependency availability × cache miss rate. Caching is most effective for read-heavy dependencies with data that can tolerate some staleness.

**Graceful degradation** — when a dependency is unavailable, return a degraded response rather than failing entirely. Recommendations go away, notifications queue, non-critical features are disabled. The core flow continues.

**Circuit breakers** — detect when a dependency is failing and stop sending requests to it, instead returning errors immediately rather than waiting for timeouts. This bounds the blast radius of a flaky dependency.

**SLO negotiation with dependency teams** — if a dependency's SLO is incompatible with yours, that's a conversation to have. Sometimes the dependency team doesn't know their SLO is a blocker for yours.

## Cascade failures

The dependency problem has a nastier version: cascading failures. A slow dependency is often worse than an unavailable one. When the database is down, requests fail fast and users get errors. When the database is slow, requests queue up, connections exhaust, memory fills, and the caller goes down too — even though the original problem wasn't with the caller at all.

This is why dependency SLOs should include latency targets, not just availability. A dependency that's technically "available" but responding in 10 seconds for P99 requests is a reliability hazard for anyone who calls it.

<!-- RESOURCES -->

- [Implementing SLOs - Dependency Section](https://sre.google/workbook/implementing-slos/) -- type: book, time: 20m
- [Cascading Failures - Google SRE Book](https://sre.google/sre-book/addressing-cascading-failures/) -- type: book, time: 30m
