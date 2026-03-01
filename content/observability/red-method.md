---
id: red-method
title: The RED Method
zone: observability
edges:
  to:
    - id: prometheus-basics
      question: >-
        RED gives me a clear framework. Now I need to actually instrument my
        service and start collecting these metrics.
      detail: >-
        I know I should track Rate, Errors, and Duration. But I've never added
        metrics to a service before. I don't know what library to use, where
        the data goes, or how anything gets from my app into a place I can
        query it.
difficulty: 1
tags:
  - metrics
  - red-method
  - rate
  - errors
  - duration
  - observability
category: concept
milestones:
  - Define Rate, Errors, and Duration and instrument all three for a service
  - Understand why these three signals are the minimum useful set for any service
  - Use RED metrics to answer "is my service healthy?" in under 30 seconds
  - Know the difference between RED (for services) and USE (for infrastructure)
---

When you're first adding observability to a service, the hardest question is: what should I actually measure? You could instrument hundreds of things. The RED method cuts through that by giving you the minimum viable set of metrics for any request-driven service: Rate, Errors, and Duration. These three signals answer the only question that matters in the first 30 seconds of an incident: is my service healthy?

Rate tells you how much traffic the service is handling — requests per second. Errors tells you how often those requests are failing — the error rate as a percentage of total requests. Duration tells you how long requests are taking, specifically the latency distribution (p99 is the most actionable). Together, they answer whether the service is busy, broken, or slow. If all three look normal, the problem is probably not in this service. If any of them is abnormal, you know where to look next.

The RED method was coined by Tom Wilkie at Grafana Labs, drawing on the Google SRE "four golden signals" (which adds Saturation as a fourth). RED is deliberately minimal — it's the floor, not the ceiling. Once you have Rate, Errors, and Duration instrumented, you can add more signals. But these three come first, and many teams find they cover the majority of their alerting needs.

<!-- DEEP_DIVE -->

## The three signals

### Rate: how busy is the service?

Rate is requests per second. It tells you how much demand the service is currently handling and lets you spot sudden drops or spikes in traffic that might indicate a problem (either in the service itself or in whatever is calling it).

In PromQL, Rate comes from a Counter:

```promql
# Total request rate across all endpoints
rate(http_requests_total[5m])

# Request rate, broken down by endpoint
sum by (endpoint) (rate(http_requests_total[5m]))
```

A sudden drop in rate when traffic should be steady often means requests are being dropped or failing before they're counted. A sudden spike might mean a retry storm or a traffic flood.

### Errors: is the service broken?

Errors is the rate of failed requests, usually expressed as a percentage of total requests. What counts as an error depends on your service — for an HTTP API, it's typically 5xx status codes. For a gRPC service, it's non-OK status codes. For a queue consumer, it might be processing failures.

```promql
# Error rate as a percentage of total requests
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
  /
sum(rate(http_requests_total[5m]))
* 100

# Absolute error rate (errors per second)
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
```

An error rate above 1% is generally worth investigating. Above 5% is an incident. The right thresholds depend on your service and your SLOs.

### Duration: is the service slow?

Duration is the latency distribution — specifically what percentile of requests complete within an acceptable time. Query the p99 for alerting; graph p50, p95, and p99 together for dashboards.

```promql
# p99 request duration
histogram_quantile(0.99,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m]))
)

# p50, p95, p99 in one graph (use multiple queries)
histogram_quantile(0.50, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
```

Duration requires a Histogram metric type — you can't compute percentiles from a counter or gauge.

## Instrumenting RED metrics in practice

For an HTTP service, you typically need two metrics:

1. **A Counter** for requests, labelled by method, endpoint, and status code — gives you Rate and Errors
2. **A Histogram** for request duration, labelled by method and endpoint — gives you Duration

```python
# Python example — both metrics for a Flask service
from prometheus_client import Counter, Histogram
import time

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# Wrap your handler
def handle_request(method, endpoint, handler):
    start = time.time()
    status_code = "200"
    try:
        result = handler()
        status_code = str(result.status_code)
        return result
    except Exception as e:
        status_code = "500"
        raise
    finally:
        duration = time.time() - start
        REQUEST_COUNT.labels(method, endpoint, status_code).inc()
        REQUEST_DURATION.labels(method, endpoint).observe(duration)
```

Many web frameworks have middleware that does this automatically — you don't always have to write it yourself. Look for Prometheus middleware for your framework (Flask-Prometheus, gin-prometheus, express-prom-bundle, etc.).

## RED vs USE: choosing the right method

RED is for **services** — anything that handles requests. Use it for your API servers, microservices, databases, and queues.

USE is for **resources** — CPU, memory, disk, network. Use it when you're asking about the health of the infrastructure running those services.

They're complementary. A typical workflow: RED metrics alert you that the service is slow (high p99 latency). USE metrics tell you why — the CPU on the host is saturated, or the disk I/O is at capacity.

| Question | Method |
|---------|--------|
| Is my API service healthy? | RED |
| Is my database healthy? | RED (for queries) + USE (for the database host) |
| Is my Kubernetes node healthy? | USE |
| Is my caching layer working? | RED |
| Is my network card overloaded? | USE |

## Building a minimal RED dashboard

A useful starting point for any service dashboard:

1. **Rate**: `sum(rate(http_requests_total[5m]))` — single stat + graph over time
2. **Error rate**: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100` — percentage, alert at 1%
3. **p50 / p95 / p99 latency**: Three lines on one graph

These three panels, visible at a glance, are enough to answer "is the service OK?" in seconds.

<!-- RESOURCES -->

- [RED Method — Tom Wilkie, Grafana Labs](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/) -- type: article, time: 10m
- [The Four Golden Signals (Google SRE Book)](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals) -- type: article, time: 15m
- [Monitoring Microservices: RED, USE, and the four golden signals](https://thenewstack.io/monitoring-microservices-red-method/) -- type: article, time: 12m
- [Building a Grafana dashboard from RED metrics](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/) -- type: article, time: 15m
