---
id: metric-types-overview
title: Types of Metrics
zone: observability
edges:
  to:
    - id: counter-metric
      question: >-
        I want to track how many requests my service has handled. What type of
        metric do I use?
      detail: >-
        I want to count things — requests, errors, cache hits. I keep seeing
        the word "counter" but I don't really know what it means or how it
        differs from just storing a number somewhere.
    - id: gauge-metric
      question: >-
        I need to track things that go up and down — like memory usage or the
        number of active connections. Is there a metric type for that?
      detail: >-
        A counter keeps going up forever which doesn't make sense for memory or
        queue depth. I need something that reflects the current value right now,
        whatever that is.
    - id: histogram-metric
      question: >-
        I need to measure how long my requests are taking, especially the slow
        ones. How do I track a distribution instead of just a single value?
      detail: >-
        I want to know what percentage of my requests are slow — not just the
        average. Average latency hides the outliers. I've seen p99 mentioned
        everywhere but I don't know what kind of metric enables that.
difficulty: 1
tags:
  - metrics
  - counters
  - gauges
  - histograms
  - prometheus
  - observability
category: concept
milestones:
  - Name the four metric types in Prometheus and what each one is for
  - Choose the correct metric type for a given use case
  - Understand why using the wrong type produces misleading data
---

Prometheus defines four metric types: Counter, Gauge, Histogram, and Summary. Each one is designed to answer a different category of question about your system. Picking the right type isn't just a matter of style — the type determines what operations make sense on the data, and using the wrong one gives you numbers that look plausible but are fundamentally misleading.

The key insight is that the type tells you how the value behaves over time and what you can do with it. A counter only ever goes up, so the interesting question is always "how fast is it increasing?" A gauge can go in any direction, so you read it directly. A histogram records a distribution of observations, which is what you need when a single number isn't enough to describe what's happening. The fourth type, Summary, is older and less commonly used in new instrumentation — Histograms are generally preferred because they can be aggregated across instances.

Before you add a single metric to your service, you should understand which type fits what you're measuring. The wrong choice is surprisingly easy to make and surprisingly hard to notice — bad metric types produce data that looks fine until you're mid-incident and realise the numbers don't mean what you thought they did.

<!-- DEEP_DIVE -->

## The four types at a glance

| Type | Behaviour | Typical use | Key PromQL function |
|------|-----------|-------------|---------------------|
| **Counter** | Only increases, resets on restart | Total requests, total errors, bytes sent | `rate()`, `increase()` |
| **Gauge** | Can go up or down | Memory usage, active connections, queue depth | Direct query |
| **Histogram** | Samples observations into buckets | Request duration, response size | `histogram_quantile()` |
| **Summary** | Pre-computes quantiles client-side | Same as histogram, but with limitations | Direct query of pre-computed values |

## Why the type matters so much

Consider memory usage. Memory can be 512MB now, drop to 300MB after garbage collection, then climb to 600MB an hour later. If you tracked this as a counter, the value would just keep increasing forever, even as real memory usage fluctuated. The counter would tell you "6.2 million megabytes of memory have been used since the process started" — a number that is technically accurate and completely useless.

The opposite mistake: using a gauge for request counts. Gauges can go up or down. If you store "number of requests" as a gauge and your monitoring system samples it every 15 seconds, you'd store the instantaneous count at each sample. But what does "count" even mean at a moment in time? You'd lose the ability to accurately calculate rate, because you're not capturing the true cumulative total — you're capturing snapshots of some counter variable in your code.

Histograms are worth special attention. If you want to know that your p99 latency is under 200ms, you need a distribution — a single measurement like "average latency is 45ms" cannot tell you that. Histograms are specifically designed to capture distributions of observations so you can answer percentile questions later.

## Summary vs Histogram

You'll see both mentioned in documentation. The short version: use Histograms. Summaries pre-compute percentiles on the client side, which means you can't aggregate them across multiple service instances (you can't average percentiles — the math doesn't work). Histograms ship raw bucket data to Prometheus and let you compute percentiles at query time across the full population of requests, even across 50 instances.

The only advantage of Summary is slightly higher accuracy for the computed quantiles. In practice, correctly configured histogram buckets give you accuracy that's more than good enough, and the ability to aggregate across instances is almost always worth it.

## Choosing the right type

Ask yourself: what question am I trying to answer?

- "How many times did X happen since the service started?" → **Counter**
- "What is the current state of X right now?" → **Gauge**
- "What does the distribution of X look like? What's my p99?" → **Histogram**

If you're unsure, lean toward Histogram for anything that varies — it's the most flexible type and lets you answer questions you haven't thought of yet.

<!-- RESOURCES -->

- [Prometheus Metric Types (official docs)](https://prometheus.io/docs/concepts/metric_types/) -- type: article, time: 10m
- [Prometheus: Up & Running (O'Reilly)](https://www.oreilly.com/library/view/prometheus-up/9781492034131/) -- type: book, time: 360m
- [How Prometheus Metric Types Work](https://grafana.com/blog/2022/03/01/how-prometheus-metric-types-work/) -- type: article, time: 12m
