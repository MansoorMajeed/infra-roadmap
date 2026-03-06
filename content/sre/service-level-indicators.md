---
id: service-level-indicators
title: Service Level Indicators
zone: sre
edges:
  to:
    - id: service-level-objectives
      question: >-
        I've got my SLIs defined. Now how do I set a target that's actually
        meaningful — not just a number I made up?
      detail: >-
        I know I should measure error rate and latency. But what's the right
        threshold — 99%? 99.9%? 99.99%? I could just pick a high number to
        look good, but that feels dishonest. I want to understand how to arrive
        at something defensible.
difficulty: 1
tags:
  - sli
  - sre
  - reliability
  - metrics
  - user-experience
category: concept
milestones:
  - Define what makes a metric a good SLI vs. a bad one
  - List three SLIs for a typical web service (latency, error rate, availability)
  - Explain why internal metrics like CPU utilization are bad SLIs
  - Write SLIs for a real service you own
---

An SLI is the actual measurement — the number that tells you whether users are having a good experience right now. Not "is the server running?" but "are requests succeeding?" The hardest part of choosing SLIs isn't the measurement itself — it's resisting the temptation to measure what's easy to collect rather than what actually matters to users.

<!-- DEEP_DIVE -->

## What makes a good SLI

A good SLI has three properties:

1. **It reflects user experience directly.** If the SLI is good, users are having a good experience. If it degrades, users notice. CPU utilization fails this test — it can spike while users experience nothing, and can be low while users are getting errors.

2. **It's measurable at the right point.** You want to measure as close to the user as possible. Server-side latency is better than process CPU. Client-side latency measured from actual requests is better still. The further from the user you measure, the more disconnected the metric is from their actual experience.

3. **It's aggregable into a ratio.** SLIs are usually expressed as "X% of events were good." This makes them comparable across time periods and services.

## The four golden signals

Google SRE introduced the concept of the four golden signals: latency, traffic, errors, and saturation. These aren't SLIs by themselves — they're a framework for thinking about what to measure.

**Latency** — how long requests take. Critically, you care about the distribution, not just the average. A system where 50% of requests take 10ms and 50% take 10 seconds has a wonderful average and a terrible user experience. Use percentiles: P50, P95, P99.

**Traffic** — how much demand the system is handling. Requests per second, queries per second, active connections. This contextualizes everything else — a high error rate matters differently at 100 RPS vs 100,000 RPS.

**Errors** — the rate of failed requests. Both explicit failures (HTTP 500) and implicit ones (HTTP 200 with wrong data, timeouts, partial responses) count.

**Saturation** — how full the system is. Memory utilization, connection pool exhaustion, queue depth. Saturation is often a leading indicator: it degrades before errors start.

## What to avoid as SLIs

**CPU and memory utilization** — these are implementation details, not user experience signals. High CPU might mean high load and happy users. Low CPU might mean the service is completely broken and handling no traffic at all.

**Synthetic health check endpoints** — a `/health` endpoint returning 200 tells you the service can process requests to that specific endpoint. It tells you nothing about whether real user traffic is succeeding.

**Internal queue depths** — unless the queue directly backs user requests, this is an internal signal that doesn't reflect user experience.

## Writing your SLIs

For a typical web service, start with these three:

- **Availability SLI**: `count(successful_requests) / count(total_requests)` — a request is successful if the status code is 2xx or 3xx
- **Latency SLI**: `count(requests_under_threshold_ms) / count(total_requests)` — pick a threshold that reflects actual user expectations (200ms for interactive, 1s for async)
- **Error rate SLI**: `1 - count(5xx_requests) / count(total_requests)` — explicit server errors

Once you have these, you have the raw material for setting objectives.

<!-- RESOURCES -->

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) -- type: book, time: 30m
- [The Four Golden Signals - Google SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals) -- type: book, time: 15m
- [Implementing SLOs - Google SRE Workbook](https://sre.google/workbook/implementing-slos/) -- type: book, time: 45m
