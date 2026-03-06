---
id: graceful-degradation
title: Graceful Degradation
zone: sre
edges:
  to:
    - id: capacity-planning
      question: >-
        My services now degrade gracefully instead of falling over completely.
        How do I make sure we can actually handle real growth too?
      detail: >-
        Graceful degradation means we survive individual failures — a dependency
        goes down and we serve partial results instead of hard errors. But I'm
        now thinking about a different kind of stress: not a dependency failing,
        but traffic that just keeps growing. I need to know we can absorb that
        before it becomes an incident.
difficulty: 3
tags:
  - graceful-degradation
  - resilience
  - reliability
  - sre
  - circuit-breakers
  - fallbacks
  - partial-failure
category: practice
milestones:
  - Identify which of your service's features can be disabled without breaking core functionality
  - Implement circuit breakers for at least one external dependency
  - Test that your service serves degraded responses when a dependency is unavailable
  - Understand the difference between failing fast and gracefully degrading
---

When a dependency fails, you have two choices: fail completely and serve users an error, or degrade gracefully and serve users something reduced but functional. The difference in user experience is enormous. Graceful degradation is the practice of designing services to handle partial failure — shedding features, serving cached data, returning reduced results — rather than crashing entirely when something in the dependency chain breaks.

<!-- DEEP_DIVE -->

## The failure modes that matter

There are two types of dependency failure that graceful degradation addresses:

**Hard failures**: the dependency is completely unavailable. HTTP connection refused. DNS doesn't resolve. No response at all.

**Soft failures**: the dependency is responding, but slowly. Timeouts. Elevated error rates. High latency. These are often worse than hard failures because they cause callers to queue up waiting, eventually exhausting their own connection pools and thread capacity.

Graceful degradation needs to handle both.

## Circuit breakers

A circuit breaker is the primary pattern for handling dependency failures. Named after electrical circuit breakers, the concept is the same: when failure is detected, "open" the circuit to stop requests flowing to the failing dependency, instead returning errors immediately.

The circuit breaker has three states:

**Closed** (normal): requests flow through normally. Failures are counted.

**Open** (failing): when failure rate exceeds a threshold, the circuit opens. Requests to the dependency are short-circuited — they fail immediately without attempting the call. This bounds the blast radius: a slow downstream doesn't cause callers to pile up.

**Half-open** (recovering): after a timeout, a small number of test requests are let through. If they succeed, the circuit closes. If they fail, it opens again.

Libraries: Resilience4j (Java/Kotlin), Hystrix (deprecated but influential), Polly (.NET), Python's circuit-breaker libraries, and most service meshes (Istio, Linkerd) implement circuit breaking at the infrastructure level.

## Timeouts everywhere

Every network call must have a timeout. Without a timeout, a slow dependency will hold your threads or goroutines indefinitely, eventually exhausting them. A service that can't reach its database should time out and fail after 500ms, not after 30 seconds.

The right timeout value depends on the SLO you're trying to meet and the expected response time of the dependency. For interactive user requests, timeouts should be aggressive — if a call hasn't returned in 1-2 seconds, your user is already frustrated. For async background work, timeouts can be more generous.

Always set timeouts at two levels: connection timeout (how long to wait to establish a connection) and read timeout (how long to wait for a response). Missing either one leaves a gap.

## Feature degradation

When a dependency is unavailable, the question is: what can the service still do without it?

- **Recommendation service down?** Show no recommendations rather than blocking the page load.
- **Search index degraded?** Fall back to basic SQL search or return cached recent results.
- **Notification service unavailable?** Queue notifications for later delivery rather than failing the user's action.
- **Personalization service down?** Show default content rather than a blank page.

This requires deliberately designing each dependency as optional or gracefully degradable, not treating all dependencies as required for all operations.

## Cache as a fallback

For read-heavy dependencies, a stale cache is often better than no data. If the product catalogue API is down, serving yesterday's product data is better than serving a 500 error to every user who visits a product page.

Implement "stale-while-revalidate" caching: serve the cached response immediately, then attempt to refresh in the background. If the refresh fails, keep serving the stale data until it's too old to be useful.

<!-- RESOURCES -->

- [Release It! - Michael Nygard](https://pragprog.com/titles/mnee2/release-it-second-edition/) -- type: book, time: varies
- [Circuit Breaker Pattern - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html) -- type: article, time: 15m
- [Resilience4j Documentation](https://resilience4j.readme.io/docs/circuitbreaker) -- type: tool, time: 30m
