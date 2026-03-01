---
id: load-testing
title: Load Testing
zone: platform
edges:
  to:
    - id: platform-engineering
      question: >-
        Load tests are passing. How do I make sure every new service our teams
        build starts with this level of rigour?
      detail: >-
        I've validated our capacity assumptions — I know where we break and
        I've fixed the bottlenecks. But there are fifteen other services that
        have never been load tested. I can't do this for every team manually.
        How do I make it a default rather than something I have to chase people
        to do?
difficulty: 2
tags:
  - load-testing
  - performance
  - capacity
  - sre
  - reliability
  - k6
  - locust
category: practice
milestones:
  - Write a load test that simulates realistic traffic patterns for a service you own
  - Identify the bottleneck — which resource hits its limit first under load
  - Run a soak test to find memory leaks or resource exhaustion over time
  - Know the difference between load testing, stress testing, and spike testing
---

The only way to know how your system behaves under load is to put it under load. Capacity estimates made from reading code or doing back-of-the-envelope math are invariably wrong in ways you don't expect. Load testing generates synthetic traffic against your system and lets you observe exactly what breaks, at what scale, and why — before real users discover the answer for you.

<!-- DEEP_DIVE -->

## Types of load tests

**Load test**: ramp traffic up to your expected peak and hold it there. Confirm the system handles normal high-traffic operation without degradation. This is the most common starting point.

**Stress test**: keep increasing traffic beyond normal peak until something breaks. This identifies your system's actual ceiling and which resource hits it first. The goal is to find the limit, not to prove the system handles expected load.

**Spike test**: jump from baseline traffic to peak instantly, rather than ramping gradually. Real traffic often has this shape — a marketing email goes out and traffic doubles in 60 seconds. This tests your auto-scaling and your cold-start latency.

**Soak test**: run at moderate load for many hours. This finds problems that only manifest over time: memory leaks, connection pool exhaustion, log accumulation, cache eviction issues, database fragmentation.

## Choosing a tool

**k6** — the current industry-standard choice for most teams. Scripts are written in JavaScript. Excellent for API and HTTP load testing. Has cloud execution (k6 Cloud) for running large tests from distributed locations. Open-source, widely documented.

**Locust** — Python-based. Good if your team is more comfortable with Python. Easy to express complex, stateful user journeys. Requires more setup for distributed execution.

**Artillery** — YAML-based configuration with JavaScript extensions. Good for quick tests. Excellent documentation.

**Gatling** — Scala-based (can be configured in Java/Kotlin). Excellent reporting. Popular in JVM shops.

For most teams starting out, k6 is the right choice: low barrier to entry, great documentation, active community, and it scales from simple smoke tests to complex production simulations.

## Writing a realistic test

The hardest part of load testing is making the traffic realistic. Blasting your homepage with 1,000 concurrent requests is not the same as 1,000 concurrent users doing what real users do.

Realistic test characteristics:
- **Realistic traffic distribution**: most requests should be the most common user actions, not just the most interesting ones
- **Realistic user behavior**: include think time (pauses between actions), not just back-to-back requests
- **Realistic data variety**: use realistic data, not the same test credentials on every request
- **Realistic request size**: POST requests with real payloads, not empty bodies

```javascript
// k6 example: basic load test
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // ramp up
    { duration: '5m', target: 100 },  // hold
    { duration: '2m', target: 0 },    // ramp down
  ],
};

export default function () {
  const response = http.get('https://your-service/api/products');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1); // think time
}
```

## What to observe during a test

Monitor these during the load test:
- **Error rate**: does it increase as load increases? At what traffic level?
- **Latency percentiles (P50, P95, P99)**: not just average — the tail matters
- **Resource utilization**: which resource hits its limit first (CPU, memory, DB connections)?
- **Auto-scaling events**: are new instances launching fast enough to handle the ramp?
- **Downstream dependencies**: are you pushing a bottleneck into a dependency?

<!-- RESOURCES -->

- [k6 Documentation](https://k6.io/docs/) -- type: tool, time: 1h
- [Load Testing Guide - k6 Blog](https://k6.io/blog/load-testing-guide/) -- type: article, time: 20m
- [Google SRE Book - Testing for Reliability](https://sre.google/sre-book/testing-reliability/) -- type: book, time: 20m
