---
id: percentiles-and-latency
title: Percentiles and Latency
zone: observability
edges:
  to:
    - id: prometheus-basics
      question: >-
        I understand what I should be measuring now. How do I actually collect
        all of this in my running service?
      detail: >-
        I know I need counters for request counts, gauges for memory, histograms
        for latency — but I've never actually wired any of this up end to end.
        Where does the data go? What collects it? How does it get from my app
        into something I can query?
difficulty: 2
tags:
  - metrics
  - percentiles
  - latency
  - p99
  - observability
category: concept
milestones:
  - Explain why p99 latency is more useful than average latency
  - Understand how the "long tail" of slow requests affects user experience
  - Read a percentile from a histogram query in Prometheus
  - Understand why averaging percentiles across instances is statistically wrong
---

Average latency is the most dangerous metric in observability. It looks like useful information, it appears on every dashboard, and it will confidently hide the fact that a meaningful fraction of your users are having a terrible experience. If 95% of your requests complete in 10ms and 5% take 2 seconds, your average comes out around 110ms — a number that says "everything is fine" while thousands of users per minute stare at a spinner.

Percentiles tell the truth. The p99 latency — the 99th percentile — means that 99% of requests completed in that time or less. If your p99 is 2.1 seconds, you know that 1 in every 100 requests is slow enough to frustrate users. The p50 (median) tells you what a typical request looks like. The p95 shows you whether things are trending toward problematic. Running p50, p95, and p99 on the same graph gives you a complete picture of your latency distribution that an average can never provide.

The reason the slow requests matter is that they don't happen to a random sample of users — they happen repeatedly to the same users, on the same endpoints, under the same conditions. If checkout is your p99 endpoint, the users experiencing slow checkout are exactly the users most actively trying to give you money. A 1% slow rate sounds trivial in aggregate but lands disproportionately on your highest-intent users.

<!-- DEEP_DIVE -->

## Why average latency lies

Here's a concrete example. Suppose your API handles 1,000 requests per minute:

- 990 requests: 10ms each
- 10 requests: 5,000ms each (5 seconds — a timeout somewhere)

Average latency: `(990 × 10 + 10 × 5000) / 1000 = 59.9ms`

A dashboard showing 60ms average looks healthy. But 1% of your users are waiting 5 seconds. If this is a search endpoint and you handle 10 million requests per day, that's 100,000 requests per day where users are timing out or giving up.

Now look at the percentiles:
- p50: 10ms (the median request is fast)
- p95: 10ms (still fast — the problem is below the surface)
- p99: 5,000ms (now you see it — the worst 1% are terrible)
- p99.9: 5,000ms (same story)

The p99 immediately tells you there's a problem that the average was hiding.

## What each percentile means

| Percentile | Reading | What it tells you |
|-----------|---------|-------------------|
| **p50** | 50% of requests are faster than this | The experience for a typical user |
| **p75** | 75% of requests are faster than this | Upper-middle of the distribution |
| **p95** | 95% of requests are faster than this | Near-worst case for most users |
| **p99** | 99% of requests are faster than this | The tail — the slowest 1% |
| **p99.9** | 99.9% of requests are faster than this | The very worst (relevant at high scale) |

At 100 requests per second, p99 represents 1 request per second that's slow. At 10,000 requests per second, p99 represents 100 requests per second — a significant problem.

## The long tail

High-scale systems often exhibit what's called a "long tail" of latency — a small percentage of requests that are dramatically slower than the rest. These can be caused by:

- **GC pauses** — a garbage collection cycle blocks all threads for tens to hundreds of milliseconds
- **Lock contention** — a slow request holds a lock, queuing others behind it
- **Cold paths** — code or data that rarely executes and isn't cached
- **External dependencies** — a database or API call that occasionally times out
- **Resource exhaustion** — thread pool full, connection pool depleted, causing queuing

The long tail matters not just for individual user experience, but because slow requests often hold resources. A request blocked waiting for a database connection holds a thread. If the p99 requests hold threads for 5 seconds each, they're consuming 500x the resources of a normal request — and at scale, they can cause cascading failures.

## Querying percentiles in PromQL

Using a Prometheus histogram (see the Histograms node for instrumentation), you compute percentiles with `histogram_quantile()`:

```promql
# p50 (median) latency over the last 5 minutes
histogram_quantile(0.50,
  rate(http_request_duration_seconds_bucket[5m])
)

# p99 latency over the last 5 minutes
histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket[5m])
)

# p99 latency, broken down by endpoint
histogram_quantile(0.99,
  sum by (endpoint, le) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)
```

The `le` label must be included in any `sum by()` that wraps a histogram — `histogram_quantile()` needs it to see the bucket boundaries.

## Why you must NOT average percentiles

This is a common and consequential mistake. If you have 3 instances of your service and each reports a p99 of 200ms, 250ms, and 300ms, the actual p99 across all instances is not the average of those three numbers (250ms). It could be anywhere in the range — you simply cannot know without the underlying data.

The mathematically correct approach is to aggregate the raw histogram buckets first, then compute the percentile:

```promql
# WRONG — averages pre-computed percentiles
avg(p99_latency_precomputed)

# RIGHT — aggregate buckets, then compute quantile
histogram_quantile(0.99,
  sum by (le) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)
```

The `sum by (le)` adds up the bucket counts across all instances, giving you a single histogram that represents the full population of requests. Then `histogram_quantile()` computes the actual p99 across all of them. This is why Histograms are preferred over Summaries — Summaries pre-compute percentiles on each instance and can't be aggregated correctly.

## Practical alerting guidance

For production services, a common alerting setup:

- **Alert on p99 latency** — catches the tail that matters for user experience
- **Graph p50, p95, p99 together** — gives you the full shape of the distribution
- **Set SLO-based thresholds** — if your SLA says "95% of requests under 200ms," alert when `histogram_quantile(0.95, ...) > 0.2`

Alerting on p50 (median) is appropriate when even typical requests being slow would be a problem. Alerting on p99 catches outliers before they become widespread.

<!-- RESOURCES -->

- [Latency SLOs Done Right](https://www.circonus.com/2018/08/latency-slos-done-right/) -- type: article, time: 12m
- [Why Percentiles Don't Work the Way You Think](https://www.percona.com/blog/2021/05/04/why-percentile-don-t-work-the-way-you-think/) -- type: article, time: 10m
- [Histograms and Summaries (Prometheus docs)](https://prometheus.io/docs/practices/histograms/) -- type: article, time: 12m
- [How NOT to Measure Latency (Gil Tene, video)](https://www.youtube.com/watch?v=lJ8ydIuPFeU) -- type: video, time: 42m
- [The Tail at Scale (Google Research)](https://research.google/pubs/the-tail-at-scale/) -- type: article, time: 20m
