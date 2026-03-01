---
id: observability-cardinality
title: Observability Cardinality
zone: observability
edges:
  to:
    - id: chaos-engineering
      zone: platform
      question: >-
        I've got solid observability now. But I only know it works because of
        the last incident. How do I verify it before the next emergency?
      detail: >-
        Everything looks good in theory — dashboards, alerts, runbooks. But
        the last real outage revealed that half our alerts were wrong and our
        runbooks were stale. I want to find those gaps before the next 3am page,
        not during it.
difficulty: 3
tags:
  - metrics
  - cardinality
  - prometheus
  - cost
  - observability
  - labels
category: concept
milestones:
  - Understand what metric cardinality means and what drives it
  - Identify which labels in your current setup create high-cardinality problems
  - Know which label values are safe (service, method) vs dangerous (user_id, request_id)
  - Use Prometheus TSDB analysis tools to find cardinality offenders
---

In Prometheus, every unique combination of metric name and label values creates a separate time series. A metric called `http_requests_total` with labels `method` and `status_code` might have series for `{method="GET", status_code="200"}`, `{method="GET", status_code="404"}`, `{method="POST", status_code="200"}`, and so on. With a few bounded values per label, this is manageable — maybe a dozen series. But labels with high cardinality multiply that count explosively.

Cardinality is the number of unique values a label can take. Adding a label with 10 possible values multiplies your series count by 10. Adding `user_id` as a label on a counter metric, with 500,000 active users, creates 500,000 time series for that one metric. Prometheus has to keep all active time series in memory. At high enough cardinality, Prometheus runs out of memory, scraping falls behind, queries time out, and your entire observability stack grinds to a halt.

This is one of the most common ways people accidentally break their own observability infrastructure. The good news is the rules are simple once you know them, and the fix is usually removing the offending label — not deleting the metric entirely.

<!-- DEEP_DIVE -->

## How time series multiply

Start with a single metric: `http_requests_total`. No labels. That's one time series.

Add a `method` label with 4 values (GET, POST, PUT, DELETE): 4 time series.

Add a `status_code` label with 10 common values (200, 201, 301, 400, 401, 403, 404, 500, 502, 503): 40 time series.

Add a `service` label for your 8 microservices: 320 time series.

Still fine. 320 time series is nothing to Prometheus.

Now add `user_id` with 100,000 active users: 32,000,000 time series. Prometheus is on fire.

Each time series is an independent stream of data that Prometheus must track: store in memory, write to disk, index, and query. The math compounds fast because it's multiplicative, not additive.

## Safe labels vs dangerous labels

The rule is simple: a label is safe if its possible values are **bounded and small**. A label is dangerous if its values can grow without limit.

**Safe labels (bounded values):**

| Label | Why it's safe |
|-------|---------------|
| `service` | You have tens of services, not millions |
| `method` | HTTP methods are a fixed set |
| `status_code` | HTTP status codes are a fixed set |
| `environment` | `production`, `staging`, `dev` — handful of values |
| `region` | `us-east-1`, `eu-west-1` — handful of values |
| `error_type` | Bounded error classifications |

**Dangerous labels (unbounded values):**

| Label | Why it's dangerous |
|-------|-------------------|
| `user_id` | Grows with your user base |
| `request_id` | Unique per request — infinite |
| `session_id` | Unique per session — infinite |
| `IP address` | Unbounded |
| `URL path` | If it includes IDs (e.g., `/users/12345`) |
| `SQL query` | Unique per query text |

The canonical example that catches people: tracking latency per endpoint and including the dynamic part of the path in the label. `/api/users/{id}` becomes `/api/users/12345`, `/api/users/67890`, etc. Each unique ID creates a new time series. You want the label to be `/api/users/{id}` (the route pattern), not `/api/users/12345` (the actual path).

## The per-request data problem

The instinct to add `user_id` as a metric label comes from a real need: you want to know how a specific user's requests are performing. The mistake is reaching for metrics to answer that question.

Metrics are aggregate data — they summarize across many requests. The right tool for per-request data is **traces and logs**:

- "How many requests did user 12345 make?" — metrics, but with `user_id` on a counter (this will explode)
- "Which requests by user 12345 were slow, and why?" — traces and logs
- "What is the p99 latency for user 12345 over the last hour?" — traces (query trace data for that user)

When you find yourself wanting to add a high-cardinality label, it's almost always a signal that you should be looking at a trace or log, not a metric.

## Finding the offenders: TSDB analysis

If your Prometheus is already struggling with high cardinality, you can use the built-in TSDB analysis tool to find which metrics and labels are responsible.

**Via the HTTP API:**

```bash
# List the top metrics by series count
curl http://prometheus:9090/api/v1/status/tsdb | \
  jq '.data.seriesCountByMetricName | sort_by(.count) | reverse | .[0:20]'
```

**Via the CLI (on the Prometheus server):**

```bash
prometheus-tsdb analyze --db /prometheus/data
```

This outputs something like:

```
Block (2h):
  Highest cardinality labels:
    user_id       4,823,441 series
    request_id    1,293,882 series
    trace_id        842,193 series
  Highest cardinality metric names:
    http_requests_total{user_id=...}   4,823,441
    rpc_calls_total{request_id=...}    1,293,882
```

This immediately tells you which label is the culprit. In most cases the fix is to remove that label from the metric. The data you wanted from that label should come from traces or logs instead.

## Keeping URL labels safe

If you're labeling metrics with endpoint paths, make sure you're using the route pattern, not the actual URL. Most HTTP frameworks provide a route pattern variable.

In Python with FastAPI and the Prometheus client:

```python
# Dangerous — uses the actual request path
# path = request.url.path  # → "/users/12345", "/users/67890", etc.

# Safe — uses the route pattern
# In FastAPI, request.scope["path"] after routing gives the pattern
path = request.scope.get("route").path  # → "/users/{user_id}"

REQUEST_COUNT.labels(method=request.method, path=path, status=response.status_code).inc()
```

The middleware approach is usually easier — most Prometheus instrumentation libraries for web frameworks do this correctly by default if you use them properly.

## Practical cardinality budget

A rough guideline for a healthy Prometheus setup:

- Under 1 million active time series: comfortable
- 1–10 million: manageable with adequate memory (plan for ~2–3 bytes per sample, ~thousands of bytes per series)
- Over 10 million: you need to fix the cardinality or shard Prometheus

Before adding any new label to an existing metric, ask: "How many unique values can this label take? In 6 months? In 2 years?" If the answer isn't bounded and small, put that data in traces or logs instead.

<!-- RESOURCES -->

- [Cardinality is Key — Prometheus blog](https://www.robustperception.io/cardinality-is-key/) -- type: article, time: 10m
- [Prometheus TSDB: Understanding the storage](https://prometheus.io/docs/prometheus/latest/storage/) -- type: article, time: 15m
- [High Cardinality in Prometheus — Grafana blog](https://grafana.com/blog/2022/02/15/what-are-cardinality-spikes-and-why-do-they-matter/) -- type: article, time: 12m
- [Prometheus Best Practices: Labels](https://prometheus.io/docs/practices/instrumentation/#labels) -- type: article, time: 8m
- [Thanos and VictoriaMetrics for scaling Prometheus](https://victoriametrics.com/blog/cardinality-explorer/) -- type: article, time: 15m
