---
id: counter-metric
title: Counters
zone: observability
edges:
  to:
    - id: prometheus-basics
      question: >-
        I understand counters now. How do I actually start collecting metrics
        from my running service?
      detail: >-
        I know I should use a counter for request counts and error counts. But
        I don't know how to actually wire this up. Where does the data go? What
        collects it? I've never instrumented a service before.
difficulty: 1
tags:
  - metrics
  - counters
  - prometheus
  - observability
category: concept
milestones:
  - Understand that counters only ever increase and reset to zero on restart
  - Know that you query counters with rate() or increase(), not the raw value
  - Instrument a counter for request count and error count in your service
  - Understand why a raw counter value is meaningless without rate()
---

A counter is a metric that only ever goes up. It starts at zero when your process starts, and increments every time the thing you're tracking happens. Total requests handled, total errors thrown, total bytes written to disk — anything you're counting over the lifetime of the process is a counter. If the process restarts, the counter resets to zero and starts climbing again.

The critical thing to understand about counters: you almost never care about the raw value. A counter that reads `1,847,293` tells you that 1.8 million requests have been handled since the process last started. That number by itself is nearly useless — you don't know if that was over the last 5 minutes or the last 5 months. What you actually want to know is the rate: how many requests per second is the service handling right now? That's what `rate()` gives you.

The single most common counter mistake is using one for something that can decrease — memory usage, queue depth, active connections. These values go down as well as up, so a counter makes no semantic sense for them. If memory drops after garbage collection, a counter can't represent that. Use a gauge for anything that can go down.

<!-- DEEP_DIVE -->

## How counters work

When your process starts, the counter is zero. Every time the event occurs, you call `inc()` (or `add(n)` for batch operations). The value climbs monotonically. On restart it resets to zero and starts over. Prometheus knows how to handle this reset — when it sees a counter drop (because the process restarted), it treats the new series as starting fresh.

Here's what counter instrumentation looks like in Python and Go:

```python
# Python — prometheus_client library
from prometheus_client import Counter

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'status_code']
)

def handle_request(method, status_code):
    # ... handle the request ...
    REQUEST_COUNT.labels(method=method, status_code=status_code).inc()
```

```go
// Go — prometheus/client_golang library
var requestCount = prometheus.NewCounterVec(
    prometheus.CounterOpts{
        Name: "http_requests_total",
        Help: "Total number of HTTP requests",
    },
    []string{"method", "status_code"},
)

func init() {
    prometheus.MustRegister(requestCount)
}

func handleRequest(method, statusCode string) {
    // ... handle the request ...
    requestCount.WithLabelValues(method, statusCode).Inc()
}
```

## Querying counters with PromQL

**Never query the raw counter value in a dashboard or alert.** It's just the total since last restart — a number without context.

Instead, use `rate()` to calculate events per second over a time window:

```promql
# Requests per second, averaged over the last 5 minutes
rate(http_requests_total[5m])

# Only POST requests
rate(http_requests_total{method="POST"}[5m])

# Error rate as a percentage of total requests
rate(http_requests_total{status_code=~"5.."}[5m])
  /
rate(http_requests_total[5m])
* 100
```

Use `increase()` when you want the total increase over a window rather than the per-second rate:

```promql
# Total requests in the last hour (useful for billing, capacity planning)
increase(http_requests_total[1h])
```

The window you pass to `rate()` (the `[5m]` part) matters. A short window (1m) is more reactive and shows rapid changes, but is noisier. A longer window (15m) smooths out spikes but is slower to respond. For alerting, 5 minutes is a common starting point.

## The scrape interval and `rate()` window relationship

Prometheus scrapes metrics at a fixed interval (default 15 seconds). The window you pass to `rate()` must be at least 2x the scrape interval, or Prometheus may not have enough data points to compute the rate accurately. With a 15-second scrape interval, use at minimum `[30s]` — but `[5m]` is usually more appropriate for production alerting, since it filters out momentary spikes.

## Common counter mistakes

**Using a counter for something that decreases.** Memory, queue depth, active connections — these need a gauge. If you try to use a counter for memory and it goes from 512MB to 300MB, the counter would need to go backwards, which it can't. You'd either get a bogus value or an error.

**Querying the raw counter in alerts.** An alert like `http_requests_total > 1000000` will fire once and never reset. You almost certainly want `rate(http_requests_total[5m]) > 100` instead (more than 100 requests per second for 5 minutes).

**Too-wide or too-narrow rate windows.** `rate(http_requests_total[1s])` will produce almost no data because there's likely less than one scrape per second. `rate(http_requests_total[1h])` won't catch a traffic spike that lasted only a few minutes.

<!-- RESOURCES -->

- [Prometheus Counter type (official docs)](https://prometheus.io/docs/concepts/metric_types/#counter) -- type: article, time: 5m
- [How does a Prometheus Counter work?](https://www.robustperception.io/how-does-a-prometheus-counter-work/) -- type: article, time: 8m
- [rate() vs increase() in Prometheus](https://www.robustperception.io/rate-then-sum-never-sum-then-rate/) -- type: article, time: 10m
- [Prometheus: Up & Running (O'Reilly)](https://www.oreilly.com/library/view/prometheus-up/9781492034131/) -- type: book, time: 360m
