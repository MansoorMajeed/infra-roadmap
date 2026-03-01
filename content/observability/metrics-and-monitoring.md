---
id: metrics-and-monitoring
title: Metrics and Monitoring
zone: observability
edges:
  to:
    - id: metric-types-overview
      question: >-
        I keep seeing counters, gauges, and histograms mentioned. What's the
        difference and which one should I use?
      detail: >-
        I just want to track things but apparently the type matters. I tried
        using a counter for memory usage and got nonsense. I need to understand
        what each type is actually for before I instrument anything else.
    - id: red-method
      question: >-
        I know I should track metrics but I have no idea which ones matter for
        my service. Where do I even start?
      detail: >-
        I could instrument a hundred different things. I have no idea which
        ones will tell me whether my service is healthy or not. I need a
        framework for deciding what to measure.
    - id: use-method
      question: >-
        My service looks fine but the host it runs on seems stressed. What
        should I be measuring at the infrastructure level?
      detail: >-
        The app metrics look normal but the server is clearly struggling — CPU
        spikes, something is saturating. I don't know what to actually measure
        to understand whether the machine itself is the problem.
    - id: prometheus-basics
      question: OK I understand what metrics are. How do I actually collect and store them?
      detail: >-
        The concept makes sense. But I don't know how metrics get from my app
        into something I can query. Do I push them somewhere? Does something
        pull them? What's the standard way to do this?
difficulty: 1
tags:
  - metrics
  - prometheus
  - cloudwatch
  - four-golden-signals
  - monitoring
  - observability
category: practice
milestones:
  - >-
    Instrument your application to expose the four golden signals: latency,
    traffic, errors, saturation
  - Collect metrics with Prometheus or CloudWatch
  - 'Understand the difference between counters, gauges, and histograms'
  - Explain why p99 latency is more informative than average latency
---

Metrics are numerical measurements recorded over time. Every 15 seconds (or whatever interval you configure), your monitoring system records a number — the current CPU usage, the total number of requests handled, the amount of memory in use — and stores it with a timestamp. That's it. Metrics are simple, compact, and cheap to store compared to logs.

Logs are different. When something happens — a request comes in, an error is thrown, a user logs in — you write a line of text describing that event. Logs are great for understanding what happened in detail, but they're the wrong tool for performance questions. If you want to know your average request rate over the last hour, you'd have to scan every log line, parse each one, count the requests, and divide. With metrics, that question is a single query against pre-aggregated numbers. Metrics are designed for the kinds of questions you ask constantly during normal operations and during incidents.

The key distinction: logs are individual events, metrics are aggregated measurements. A log entry says "this specific request took 230ms." A metric says "the 99th percentile of all request durations over the last 5 minutes was 450ms." You need both — logs to diagnose what went wrong in a specific case, metrics to know that something is wrong at all and to understand the scope of the problem. The typical workflow is: metrics alert you, logs help you investigate.

<!-- DEEP_DIVE -->

## What metrics actually are

A metric is a time series: a sequence of (timestamp, value) pairs associated with a name and a set of labels. For example:

```
http_requests_total{method="GET", status="200"} 104732  @ 1709000000
http_requests_total{method="GET", status="200"} 104891  @ 1709000015
http_requests_total{method="GET", status="200"} 105043  @ 1709000030
```

The name tells you what you're measuring. The labels let you slice the data — you can query for just POST requests, or just 5xx errors, without needing separate metric names for each combination. The value is the measurement at that moment. And the timestamp tells you when.

This structure is stored in a **time series database (TSDB)**. Unlike a regular database, a TSDB is optimised for writing many data points rapidly and reading ranges of data over time. Prometheus, InfluxDB, and Graphite are examples. Cloud providers have their own: CloudWatch (AWS), Cloud Monitoring (GCP), Azure Monitor. They all work on the same fundamental idea — names, labels, values, timestamps.

## Why logs aren't enough for performance monitoring

Imagine your service is handling 500 requests per second. Over an hour, that's 1.8 million log lines just for request logs. Asking "what was the p99 latency over the last hour?" against that data means parsing 1.8 million lines in real time. Even if you can do it, you'll be doing it again in 5 minutes when the next person checks.

Metrics pre-aggregate this. Instead of storing each individual request duration, you record a distribution every 15 seconds. The data you store is tiny. The query is fast. And it works the same whether you're handling 10 requests per second or 10,000.

This doesn't mean logs are useless — they're essential. But their job is different. Metrics tell you something is wrong. Logs tell you why.

## The four golden signals

Google's Site Reliability Engineering book describes four signals that, together, cover most of what you need to know about a service's health:

| Signal | What it answers | Example metric |
|--------|----------------|----------------|
| **Latency** | How long are requests taking? | p99 request duration |
| **Traffic** | How much demand is there? | Requests per second |
| **Errors** | How often are requests failing? | Error rate (%) |
| **Saturation** | How full is the system? | CPU %, queue depth |

If you're just starting out, instrument these four things and you'll have dramatically better visibility than most teams running purely on logs. The RED and USE methods (linked from this node) give you more structured frameworks for thinking about which specific metrics to collect.

## Metrics vs logs vs traces

These three are sometimes called "the three pillars of observability." They're complementary, not competing:

- **Metrics** — aggregate numbers over time. Fast to query. Great for alerting and dashboards.
- **Logs** — structured or unstructured event records. Great for debugging specific incidents.
- **Traces** — records of a single request's journey through distributed services. Great for understanding latency in microservices.

Most teams start with metrics and logs, then add tracing as their systems become more complex. Don't feel like you need all three from day one.

<!-- RESOURCES -->

- [Metrics, Logs and Traces: The Golden Triangle of Observability](https://grafana.com/blog/2016/01/05/logs-and-metrics-and-graphs-oh-my/) -- type: article, time: 10m
- [The Four Golden Signals (SRE Book)](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals) -- type: article, time: 15m
- [An introduction to metrics, monitoring, and alerting (DigitalOcean)](https://www.digitalocean.com/community/tutorials/an-introduction-to-metrics-monitoring-and-alerting) -- type: article, time: 20m
- [Monitoring and Observability (Cindy Sridharan)](https://copyconstruct.medium.com/monitoring-and-observability-8417d1952e1c) -- type: article, time: 20m
