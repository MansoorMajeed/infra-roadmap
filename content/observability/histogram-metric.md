---
id: histogram-metric
title: Histograms
zone: observability
edges:
  to:
    - id: percentiles-and-latency
      question: >-
        I've got a histogram but I don't understand the buckets or why everyone
        talks about p99 instead of just average latency.
      detail: >-
        The histogram is there but I don't know how to read it. There are all
        these "le" labels and bucket counts and I don't know what any of it
        means. My average latency looks fine but users are complaining the app
        is slow — I feel like I'm missing something important about how to
        interpret this data.
difficulty: 2
tags:
  - metrics
  - histograms
  - latency
  - percentiles
  - prometheus
  - observability
category: concept
milestones:
  - Understand what histogram buckets represent and how to configure them
  - Instrument a histogram for request duration in your service
  - Use histogram_quantile() to compute p50, p95, p99 latency from a histogram
  - Understand the tradeoff between bucket count and accuracy
---

When a counter tells you "how many" and a gauge tells you "how much right now," a histogram tells you "what does the distribution look like?" It's designed for measuring things where a single number isn't enough — request latency is the classic example. You don't just want to know the average request duration; you want to know whether a few requests are ruining the experience for a subset of your users. Histograms make that question answerable.

The way a histogram works is by sorting observations into buckets. You define bucket boundaries upfront — say, 10ms, 50ms, 100ms, 500ms, 1s, 5s. Every time a request completes, Prometheus increments every bucket whose upper bound is greater than or equal to the request's duration. A 75ms request increments the 100ms, 500ms, 1s, and 5s buckets (but not the 10ms or 50ms buckets). The bucket counts are cumulative, which is why they always increase as the bucket size increases.

Three time series are created for each histogram metric: `_bucket` for each configured bucket, `_sum` for the running total of all observed values, and `_count` for the total number of observations. Using `histogram_quantile()` in PromQL, Prometheus interpolates across the bucket counts to estimate percentiles — like "90% of requests completed within X milliseconds."

<!-- DEEP_DIVE -->

## Histogram instrumentation

Here's what adding a histogram to a web service looks like:

```python
# Python — prometheus_client
from prometheus_client import Histogram
import time

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

def handle_request(method, endpoint):
    start = time.time()
    try:
        # ... handle the request ...
        pass
    finally:
        duration = time.time() - start
        REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
```

```go
// Go — prometheus/client_golang
var requestDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Help:    "HTTP request duration in seconds",
        Buckets: []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0},
    },
    []string{"method", "endpoint"},
)

func init() {
    prometheus.MustRegister(requestDuration)
}

func handleRequest(method, endpoint string, handler func()) {
    start := time.Now()
    handler()
    requestDuration.WithLabelValues(method, endpoint).Observe(time.Since(start).Seconds())
}
```

## What the /metrics output looks like

After some requests have been processed, the `/metrics` endpoint exposes something like this:

```
# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.005"} 42
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.01"} 89
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.025"} 201
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.05"} 387
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.1"} 892
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.25"} 1204
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="0.5"} 1245
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="1.0"} 1247
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="2.5"} 1249
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="5.0"} 1249
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="10.0"} 1250
http_request_duration_seconds_bucket{method="GET",endpoint="/api/users",le="+Inf"} 1250
http_request_duration_seconds_sum{method="GET",endpoint="/api/users"} 52.847
http_request_duration_seconds_count{method="GET",endpoint="/api/users"} 1250
```

The `le` label means "less than or equal to" — it's the upper bound of each bucket. The `+Inf` bucket always equals the total count. The numbers are cumulative: the 0.1s bucket count (892) includes all requests that were also in the 0.005s through 0.05s buckets.

## Querying histograms in PromQL

```promql
# p99 latency for all GET /api/users requests
histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket{method="GET",endpoint="/api/users"}[5m])
)

# p50, p95, and p99 together (run as separate queries or use recording rules)
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Average request duration (from _sum and _count)
rate(http_request_duration_seconds_sum[5m])
  /
rate(http_request_duration_seconds_count[5m])
```

Note the `rate()` wrapping the bucket metric inside `histogram_quantile()`. This is because each bucket is a counter — it only ever increases. You need `rate()` to turn it into a per-second rate before computing the quantile, so you get the p99 over the recent time window rather than over all time since restart.

## Choosing bucket boundaries

Your buckets need to span the full range of values you expect, with enough resolution to give accurate percentile estimates. If all your requests take between 10ms and 200ms but you only have buckets at 0.1s and 1s, Prometheus has to interpolate across a large range and the p99 estimate could be quite inaccurate.

A practical approach:

1. Start with Prometheus's default buckets: `.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10` (all in seconds)
2. Run in production for a few days
3. Look at where your actual distribution falls — are most values in the 0.05–0.25s range?
4. Tighten the buckets in that range for more precision, and remove buckets at extremes you're not hitting

The tradeoff is storage. Each bucket is a separate time series. 10 buckets × 5 labels × 10 endpoints = 500 time series just for one histogram. More buckets means more storage and higher cardinality. Choose enough buckets to be accurate, not the maximum possible.

## A common mistake: high-cardinality labels

Don't put unique values in histogram labels. If you label by user ID, you'll create one set of histogram buckets per user — potentially millions of time series. Label by things with bounded cardinality: HTTP method, endpoint path (normalized, not including IDs), status code. This applies to all metric types but histograms are especially painful because each label combination multiplies by the number of buckets.

<!-- RESOURCES -->

- [Prometheus Histogram type (official docs)](https://prometheus.io/docs/concepts/metric_types/#histogram) -- type: article, time: 8m
- [How does a Prometheus Histogram work?](https://www.robustperception.io/how-does-a-prometheus-histogram-work/) -- type: article, time: 10m
- [Prometheus histogram_quantile() function](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) -- type: article, time: 8m
- [Histograms and Summaries (official best practices)](https://prometheus.io/docs/practices/histograms/) -- type: article, time: 12m
- [Prometheus: Up & Running (O'Reilly)](https://www.oreilly.com/library/view/prometheus-up/9781492034131/) -- type: book, time: 360m
