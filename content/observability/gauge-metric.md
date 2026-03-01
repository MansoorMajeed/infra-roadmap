---
id: gauge-metric
title: Gauges
zone: observability
edges:
  to:
    - id: prometheus-basics
      question: >-
        I get gauges. How do I actually instrument my service to expose all of
        these metrics?
      detail: >-
        I know what I want to measure now — counters for events, gauges for
        current state. But I've never actually added metrics to a real service.
        Where does the data even go and what reads it?
difficulty: 1
tags:
  - metrics
  - gauges
  - prometheus
  - observability
category: concept
milestones:
  - Understand that a gauge can go up and down and represents a current state
  - Know when to use a gauge vs a counter
  - Instrument a gauge for active connections, queue depth, and memory usage
  - Understand why averaging gauges over time can be misleading
---

A gauge represents the current value of something. It can go up, go down, or stay the same — whatever the real value is right now. Memory usage, number of active HTTP connections, the depth of a job queue, the current temperature of a server, the number of goroutines running — anything where you want to know the present state is a gauge.

Unlike counters, you read gauge values directly. If a gauge reads 847, that means there are 847 of whatever you're measuring right now. You don't need to apply `rate()` or any other transformation to make the value meaningful. This makes gauges simpler to query but also simpler to misuse — because what you get back is a snapshot, and snapshots can mislead you.

The sampling problem is real: Prometheus scrapes your metrics every 15 seconds by default. If your memory usage spikes to 90% for 3 seconds between scrapes, you'll never see it. The gauge will show the values at each scrape point, and a brief spike between two scrapes is invisible. This matters most for values that change rapidly and where peaks are dangerous.

<!-- DEEP_DIVE -->

## How gauges work

A gauge can be set to an absolute value, incremented, or decremented. Your code updates it directly to reflect the current state:

```python
# Python — prometheus_client library
from prometheus_client import Gauge

MEMORY_USAGE = Gauge(
    'process_memory_bytes',
    'Current memory usage in bytes'
)

ACTIVE_CONNECTIONS = Gauge(
    'http_active_connections',
    'Number of currently active HTTP connections'
)

# Set to an absolute value
MEMORY_USAGE.set(process_memory_bytes())

# Increment when a connection opens
def on_connection_open():
    ACTIVE_CONNECTIONS.inc()

# Decrement when a connection closes
def on_connection_close():
    ACTIVE_CONNECTIONS.dec()
```

```go
// Go — prometheus/client_golang
var activeConnections = prometheus.NewGauge(prometheus.GaugeOpts{
    Name: "http_active_connections",
    Help: "Number of currently active HTTP connections",
})

func init() {
    prometheus.MustRegister(activeConnections)
}

func handleConnect() {
    activeConnections.Inc()
    defer activeConnections.Dec()
    // ... handle connection ...
}
```

## Querying gauges in PromQL

Gauge queries are simpler than counter queries because you're working with real values, not rates. You can query the current value, compute averages over time, find the maximum, or compare to a threshold:

```promql
# Current memory usage across all instances
process_memory_bytes

# Average memory usage over the last 5 minutes (smooths noise)
avg_over_time(process_memory_bytes[5m])

# Maximum memory across all instances of a service
max(process_memory_bytes{service="api"})

# Alert: queue depth has been above 100 for 10 minutes
job_queue_depth > 100

# Memory usage as a percentage of a 2GB limit
process_memory_bytes / (2 * 1024 * 1024 * 1024) * 100
```

## Common gauge use cases

| What to measure | Metric name pattern | Notes |
|----------------|---------------------|-------|
| Memory usage | `process_memory_bytes` | Set from OS stats periodically |
| Active HTTP connections | `http_active_connections` | Inc on connect, dec on close |
| Job queue depth | `queue_depth` | Set from queue API |
| Cache hit ratio | `cache_hit_ratio` | Recompute and set periodically |
| CPU temperature | `hardware_cpu_temp_celsius` | Set from host metrics exporter |
| Number of open file descriptors | `process_open_fds` | Often auto-exported by client libs |

Many infrastructure gauges — CPU usage, memory, disk — are collected by Prometheus exporters (like `node_exporter`) rather than instrumented in your application code. You don't need to write code to track host memory; you just run node_exporter on the host and Prometheus scrapes it.

## The gotcha: gauges and missed peaks

Imagine your job queue spikes to 10,000 items and drains back to 0 in 8 seconds. With a 15-second scrape interval, it's possible Prometheus captured 0 items at scrape N, and 0 items at scrape N+1, completely missing the spike. The gauge would show a flat line.

This isn't unique to Prometheus — any polling-based monitoring system has this property. A few ways to deal with it:

- **Reduce the scrape interval** for critical gauges (but this increases storage cost)
- **Track the maximum with a separate metric**: keep a gauge that records the max value seen since last scrape and reset it after each scrape
- **Accept the limitation**: for most gauges, the scrape interval is fine. A 15-second peak in queue depth that then drains might not be actionable anyway

For truly latency-sensitive detection (sub-second anomalies), you generally need a different approach than scrape-based metrics entirely.

## Gauge vs counter: the decision

If you're unsure which to use:

- Can the value decrease? → **Gauge**
- Does the value represent a current state or level? → **Gauge**
- Are you counting events that accumulate over time? → **Counter**
- Would it make sense to ask "how fast is this changing per second"? → **Counter**

Active connections is a gauge (it goes down when connections close). Total connections ever made is a counter (it only ever goes up). Both metrics are useful and they answer different questions.

<!-- RESOURCES -->

- [Prometheus Gauge type (official docs)](https://prometheus.io/docs/concepts/metric_types/#gauge) -- type: article, time: 5m
- [Prometheus: Up & Running (O'Reilly)](https://www.oreilly.com/library/view/prometheus-up/9781492034131/) -- type: book, time: 360m
- [Choosing the right Prometheus metric type](https://prometheus.io/docs/practices/instrumentation/#counter-vs-gauge-summary-vs-histogram) -- type: article, time: 10m
- [node_exporter — host and OS metrics for Prometheus](https://github.com/prometheus/node_exporter) -- type: article, time: 10m
