---
id: correlating-signals
title: Correlating Logs, Metrics, and Traces
zone: observability
edges:
  to:
    - id: continuous-profiling
      question: >-
        The trace shows my service is slow, the logs are clean, the metrics
        look normal — but something is eating CPU. I have no idea what code is
        causing it.
      detail: >-
        I've gone through all three signals and none of them tell me WHY it's
        slow. I can see THAT it's slow and roughly WHERE in the call graph it
        happens, but I can't see what specific function or line of code is
        actually the problem. Is there a deeper level of visibility I'm missing?
    - id: observability-cardinality
      question: >-
        My observability stack is working but it's getting really expensive. I
        added one new label and my metric count exploded. What's happening?
      detail: >-
        I added user_id as a label to a counter metric and Prometheus slowed to
        a crawl and my storage costs went through the roof. I don't understand
        how one label could do that. I feel like I'm doing observability wrong
        and I don't know what the right constraints are.
difficulty: 2
tags:
  - observability
  - correlation
  - logs
  - metrics
  - tracing
  - exemplars
category: practice
milestones:
  - Add trace IDs to structured log lines so you can jump from trace to logs
  - Use exemplars in Prometheus to link a metric data point to a specific trace
  - Navigate from a metric spike to a trace to the relevant logs in a single flow
  - Understand what trace context propagation is and why it enables correlation
---

Metrics, logs, and traces are all describing the same system, but without correlation they're three isolated islands of information. During an incident you see a latency spike in Grafana, you want to find a trace from one of those slow requests, and then you want to find the logs for that specific trace — and each step requires you to guess. You copy a timestamp, switch tabs, filter by that timestamp, and hope something lines up. It works, but it's slow and fragile.

The key to fixing this is the trace ID. Every request that gets traced has a unique trace ID. If you embed that trace ID in every log line your service emits while processing that request, you can jump from trace to logs in one click. If you attach trace IDs to specific metric data points (called exemplars), you can jump from a spike on a Grafana graph directly to a trace from that exact moment. The signals stay separate, but they're connected by a common key.

This isn't just a nice-to-have for debugging. During a high-pressure incident, the difference between "I can navigate from alert to trace to logs in 30 seconds" and "I'm manually searching for relevant data" is often the difference between a 10-minute outage and a 2-hour one.

<!-- DEEP_DIVE -->

## Trace IDs in logs: the foundation

The first and most important correlation to set up is trace ID in logs. When your service handles a request, it has a trace context (from incoming headers or one it created itself). You want that trace ID included on every log line emitted during that request.

With OpenTelemetry and structured logging, you can pull the trace context and inject it automatically. Here's an example in Python using structlog:

```python
import structlog
from opentelemetry import trace

def add_trace_context(logger, method, event_dict):
    span = trace.get_current_span()
    if span.is_recording():
        ctx = span.get_span_context()
        event_dict["trace_id"] = format(ctx.trace_id, "032x")
        event_dict["span_id"] = format(ctx.span_id, "016x")
    return event_dict

structlog.configure(
    processors=[
        add_trace_context,
        structlog.processors.JSONRenderer(),
    ]
)
```

Now every log line looks like this:

```json
{
  "timestamp": "2024-01-15T14:32:01.234Z",
  "level": "info",
  "message": "Order created",
  "order_id": "ord_abc123",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7"
}
```

When you're looking at a trace in Jaeger and you want the logs for that request, you copy the trace ID and search your log tool (Loki, Elasticsearch, CloudWatch) for `trace_id = "4bf92f3577..."`. You get exactly the log lines from that request.

## Exemplars: from metrics to traces

Exemplars solve a different problem. A metric like `http_request_duration_seconds` is an aggregate — it summarizes thousands of requests into a histogram. When you see a p99 spike at 14:32, you know something was slow, but you don't know which request, and the metric itself has no pointer to any trace.

An exemplar is a specific data point attached to a metric sample that says "this particular observation came from this trace." In Prometheus, exemplars look like this in the metrics endpoint:

```
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.5"} 24054 # {trace_id="4bf92f3577b34da6a3ce929d0e0e4736"} 0.32 1705324321.234
http_request_duration_seconds_bucket{le="1.0"} 33444 # {trace_id="4bf92f3577b34da6a3ce929d0e0e4736"} 0.32 1705324321.234
```

The `# {...}` part is the exemplar: it records that one specific observation of 0.32 seconds was associated with trace ID `4bf92f3577...`. In Grafana, when you view a histogram panel, you can enable exemplar display and see dots on the graph. Clicking a dot opens the corresponding trace directly.

To emit exemplars from your service, you need to add trace context when recording metrics. With the Prometheus Python client:

```python
from prometheus_client import Histogram
from opentelemetry import trace

REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency')

def handle_request(request):
    start = time.time()
    response = process(request)
    duration = time.time() - start

    # Get current trace context
    span = trace.get_current_span()
    ctx = span.get_span_context()
    exemplar = {"trace_id": format(ctx.trace_id, "032x")}

    REQUEST_LATENCY.observe(duration, exemplar=exemplar)
    return response
```

Prometheus must be configured to accept and store exemplars (`--enable-feature=exemplar-storage`), and Grafana needs to be told which Tempo/Jaeger datasource to use for trace lookups.

## The full correlated workflow

With both pieces in place, your incident investigation flow becomes:

1. **Alert fires** — p99 latency above 2 seconds for the past 5 minutes.
2. **Open Grafana dashboard** — you see the spike on the latency histogram. Exemplars are enabled, so you see orange dots at the peak of the spike.
3. **Click an exemplar dot** — Grafana opens the trace for that specific slow request in Tempo/Jaeger.
4. **Read the trace** — you see the `payment-service` span took 1.8 seconds. You want to know why.
5. **Click "Logs for this trace"** — Grafana Explore opens Loki filtered by that trace ID. You see a log line: `"Payment gateway timeout after 1800ms"` with the gateway's error response.
6. **Root cause found** — the payment gateway had elevated latency. Total investigation time: under 2 minutes.

Compare this to the same investigation without correlation: you'd be guessing timestamps, searching for relevant logs, trying to identify which request among thousands was the slow one, and probably ending up at the same answer 20 minutes later.

## Grafana's derived fields

If you're using Grafana with Loki for logs, derived fields let you turn the trace ID in a log line into a clickable link to Tempo or Jaeger. Configure them in the Loki datasource settings:

```
Name:     traceID
Regex:    "trace_id":"(\w+)"
URL:      http://tempo:3200/trace/$${__value.raw}
```

Now whenever Grafana renders a log line with a `trace_id` field, the value becomes a hyperlink. Click it and the trace opens in Tempo. No copy-pasting required.

## What you need in your stack

| Component | What it provides |
|-----------|-----------------|
| Structured logging with trace ID | Logs → Trace lookup |
| OTel trace context propagation | Trace IDs flow through all services |
| Prometheus exemplars | Metric spike → Trace |
| Grafana derived fields | Log line → Trace (clickable) |
| Grafana datasource linking | All signals navigable from Explore |

You don't need all of this on day one. Start with trace IDs in logs — it's one function and it immediately makes debugging faster. Add exemplars later when your dashboards are mature enough to use them.

<!-- RESOURCES -->

- [Correlate logs and traces with Grafana](https://grafana.com/docs/grafana/latest/explore/logs-integration/) -- type: tutorial, time: 20m
- [Exemplars in Prometheus](https://prometheus.io/docs/prometheus/latest/feature_flags/#exemplars-storage) -- type: article, time: 10m
- [Trace context in logs — OpenTelemetry docs](https://opentelemetry.io/docs/specs/otel/logs/data-model/#trace-context-fields) -- type: article, time: 8m
- [Grafana Tempo: Linking with Loki](https://grafana.com/docs/tempo/latest/getting-started/tempo-in-grafana/) -- type: tutorial, time: 25m
- [Three Pillars of Observability — Charity Majors](https://charity.wtf/2019/02/05/logs-vs-structured-events/) -- type: article, time: 15m
