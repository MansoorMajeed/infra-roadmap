---
id: prometheus-basics
title: Prometheus Basics
zone: observability
edges:
  to:
    - id: dashboards
      question: >-
        I've got Prometheus scraping my metrics. Now I want to actually look at
        them visually — not just run queries in a terminal.
      detail: >-
        PromQL queries in a terminal are fine for one-off checks but useless
        during an incident. I want a screen I can pull up that shows me at a
        glance whether things are getting worse or better — something I can
        share with the team.
difficulty: 2
tags:
  - prometheus
  - promql
  - scraping
  - metrics
  - observability
category: practice
milestones:
  - Run Prometheus locally and configure it to scrape a service
  - Instrument an application with the Prometheus client library
  - Write basic PromQL queries (rate, sum, histogram_quantile)
  - Understand the pull model and why it differs from a push-based approach
  - Configure scrape intervals and understand their effect on data resolution
---

Prometheus is the de facto standard for metrics collection in cloud-native environments. It works on a pull model: rather than having your service push metrics to a central server, Prometheus periodically fetches metrics from your services on a schedule — every 15 seconds by default. Your service exposes a plain-text HTTP endpoint at `/metrics`, and Prometheus scrapes it, parses the output, and stores the values in its built-in time-series database.

The pull model has real advantages. If a service stops responding, Prometheus knows it immediately — the scrape fails. With a push model, a dead service just stops sending data and you have to detect the silence. The pull model also means Prometheus controls the scrape interval, so you get consistent timing across all your services without coordinating anything on the service side. The downside is that services behind firewalls or in short-lived environments (like batch jobs) need special treatment — Prometheus has a Pushgateway for those cases.

Every metric in Prometheus is a combination of a name, a set of labels (key-value pairs), and a value. The same metric can have many time series if it has multiple label combinations — `http_requests_total{method="GET", status="200"}` is a different time series from `http_requests_total{method="POST", status="500"}`. This label system is what makes Prometheus so flexible for slicing and dicing data during an investigation.

<!-- DEEP_DIVE -->

## The data model

Prometheus stores time series identified by a metric name and a set of labels:

```
<metric_name>{<label_name>=<label_value>, ...} <value> [<timestamp>]
```

For example:
```
http_requests_total{method="GET", endpoint="/api/users", status="200"} 14832
http_requests_total{method="POST", endpoint="/api/users", status="201"} 3241
http_requests_total{method="GET", endpoint="/api/users", status="500"} 47
```

Each unique combination of labels is a separate time series. Prometheus appends (timestamp, value) pairs to each series as it scrapes.

## Exposing a /metrics endpoint

Your service needs to expose metrics at an HTTP endpoint. The Prometheus client libraries handle all of this — you just register metrics and call them in your code:

```python
# Python — minimal Flask service with Prometheus metrics
from flask import Flask
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time

app = Flask(__name__)

REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'Request duration',
                              buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0])

@app.route('/api/hello')
def hello():
    start = time.time()
    REQUEST_COUNT.labels(method='GET', status='200').inc()
    REQUEST_DURATION.observe(time.time() - start)
    return 'Hello, world!'

@app.route('/metrics')
def metrics():
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}
```

```go
// Go — minimal HTTP server with Prometheus metrics
package main

import (
    "net/http"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
    // Your own metrics registration happens here (see Counter/Gauge/Histogram nodes)

    // Expose /metrics endpoint — promhttp handles everything
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":8080", nil)
}
```

The `/metrics` output is plain text that Prometheus parses:

```
# HELP http_requests_total Total requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1432
http_requests_total{method="GET",status="500"} 7
# HELP http_request_duration_seconds Request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 342
http_request_duration_seconds_bucket{le="0.01"} 891
...
```

## Configuring Prometheus to scrape your service

Prometheus is configured via a YAML file:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s      # How often to scrape — default is 15s
  evaluation_interval: 15s  # How often to evaluate alerting rules

scrape_configs:
  # Scrape Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Scrape your service
  - job_name: 'my-api'
    static_configs:
      - targets: ['my-api-host:8080']
    metrics_path: '/metrics'  # Default — can omit if you use /metrics

  # Scrape host metrics via node_exporter
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
```

Run Prometheus with Docker for local development:

```bash
docker run -d \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

Then open `http://localhost:9090` to access the Prometheus UI and run PromQL queries.

## Essential PromQL queries

PromQL is the query language for Prometheus. A few patterns you'll use constantly:

```promql
# Instant vector — current value of a metric
http_requests_total

# Filter by label
http_requests_total{method="GET", status=~"2.."}  # regex match on status

# Rate — per-second rate of a counter over 5 minutes
rate(http_requests_total[5m])

# Sum across all label combinations
sum(rate(http_requests_total[5m]))

# Sum, grouped by a label
sum by (method) (rate(http_requests_total[5m]))

# Error rate as a percentage
sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
sum(rate(http_requests_total[5m]))
* 100

# p99 latency from a histogram
histogram_quantile(0.99,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m]))
)

# Current memory usage across all instances
process_resident_memory_bytes
```

The Prometheus UI at `:9090/graph` lets you run and visualise these queries immediately.

## Storage and retention

Prometheus stores all data locally in a built-in time-series database (TSDB). Default retention is 15 days. You can increase this with `--storage.tsdb.retention.time=30d`, but local storage isn't designed for multi-year retention.

For longer-term storage, Prometheus supports **remote write** — shipping data to an external system as it's collected:

```yaml
# prometheus.yml
remote_write:
  - url: "https://your-thanos-or-mimir-endpoint/api/v1/push"
```

Common remote storage systems:
- **Thanos** — open source, adds object storage (S3, GCS) for cheap long-term retention
- **Grafana Mimir** — horizontally scalable, managed or self-hosted
- **Cortex** — original open-source scalable Prometheus backend

For most teams starting out, local storage with 30–90 days of retention is fine. Add remote write when you need longer retention or when you have more data than a single Prometheus instance can handle.

## The client libraries

| Language | Library |
|----------|---------|
| Go | `github.com/prometheus/client_golang` |
| Python | `prometheus_client` (pip) |
| Node.js | `prom-client` (npm) |
| Java | `io.prometheus:simpleclient` |
| Ruby | `prometheus-client` |
| Rust | `prometheus` crate |

All of these expose the same concepts — Counter, Gauge, Histogram — and handle the `/metrics` endpoint formatting automatically. The Go library is the most complete and closest to the Prometheus internals.

<!-- RESOURCES -->

- [Prometheus Getting Started (official docs)](https://prometheus.io/docs/prometheus/latest/getting_started/) -- type: tutorial, time: 30m
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/) -- type: article, time: 20m
- [Prometheus: Up & Running (O'Reilly)](https://www.oreilly.com/library/view/prometheus-up/9781492034131/) -- type: book, time: 360m
- [prom-client (Node.js)](https://github.com/siimon/prom-client) -- type: article, time: 10m
- [Practical introduction to PromQL](https://grafana.com/blog/2020/02/04/introduction-to-promql-the-prometheus-query-language/) -- type: article, time: 20m
- [Thanos — scalable, highly available Prometheus](https://thanos.io/tip/thanos/getting-started.md/) -- type: article, time: 20m
