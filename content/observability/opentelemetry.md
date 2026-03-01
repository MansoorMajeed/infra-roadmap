---
id: opentelemetry
title: OpenTelemetry
zone: observability
edges:
  to:
    - id: correlating-signals
      question: >-
        I've instrumented with OTel. Now how do I actually use traces alongside
        my logs and metrics when debugging?
      detail: >-
        I can see traces in Jaeger but when I want to find the logs that
        correspond to a specific trace, I'm manually guessing based on
        timestamps. And getting from a metric spike to the trace for requests
        that happened then feels impossible. Shouldn't these tools talk to each
        other?
difficulty: 2
tags:
  - opentelemetry
  - otel
  - tracing
  - instrumentation
  - observability
  - vendor-neutral
category: practice
milestones:
  - Instrument a service with the OpenTelemetry SDK to emit traces
  - Understand what auto-instrumentation does and when manual spans are needed
  - Configure an OTel collector to export to a backend (Jaeger, Tempo, etc.)
  - Understand why OTel matters for avoiding vendor lock-in
---

Before OpenTelemetry, every observability vendor shipped their own instrumentation SDK. If you wanted traces, you'd install Jaeger's library, wrap your code in Jaeger-specific calls, and configure Jaeger-specific exporters. If you later wanted to switch to Datadog or Honeycomb, you'd have to rip out every trace call in your entire codebase and replace it with the new vendor's API. For a large application, that could be weeks of work.

OpenTelemetry (usually called OTel) solves this by separating the instrumentation from the backend. You write your tracing code once against the OTel API, and then you configure where the data goes — Jaeger, Tempo, Datadog, Honeycomb, or anything else — without touching your application code. OTel is vendor-neutral and backed by the CNCF, which means it's not going away, and all the major observability vendors support it natively.

OTel also covers all three observability signals — traces, metrics, and logs — under a single unified standard. You don't need three different SDKs from three different vendors. One instrumentation library, one collector, one configuration, and you get all your telemetry flowing to wherever you want it.

<!-- DEEP_DIVE -->

## The three components of OpenTelemetry

OTel is built from three distinct parts that are worth understanding separately:

**The API** is what you call in your application code. It defines the interfaces for creating spans, recording metrics, and emitting logs. The key property of the API is that it's a no-op by default — if you don't attach an SDK, calling the API does nothing and has zero overhead. This means libraries can instrument themselves with OTel without forcing a dependency on any specific SDK.

**The SDK** is the implementation of the API. It's what actually creates spans, samples traces, and hands data to exporters. You install the SDK in your application and configure it at startup. The SDK is where you set things like the service name, the sampling rate, and which exporter to use.

**The Collector** is an optional but highly recommended standalone process that receives telemetry from your services, optionally processes it (filtering, batching, enriching), and exports it to your backend. Instead of having each service talk directly to your backend, services send to the Collector, and the Collector manages the backend connection. This is important for production: it decouples your application from your observability infrastructure and lets you change backends without redeploying your services.

## Auto-instrumentation

The fastest way to get traces is auto-instrumentation. OTel provides agents for most languages that instrument common frameworks automatically — HTTP servers, HTTP clients, database drivers, message queue clients — without you writing a single line of tracing code.

For Python, you install the agent and run your app through it:

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install

# Run your Flask/Django/FastAPI app with auto-instrumentation
opentelemetry-instrument python app.py
```

For Java, you attach a Java agent:

```bash
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=my-service \
     -Dotel.exporter.otlp.endpoint=http://collector:4317 \
     -jar myapp.jar
```

Auto-instrumentation gives you spans for every HTTP request your service handles, every outbound HTTP call it makes, and every database query it executes. For many applications, this is enough to get useful traces immediately.

## Manual spans

Auto-instrumentation covers the edges of your service — requests in and out, database calls. But it can't instrument your business logic. If you want to see how long it takes to process an order or validate a payment, you need manual spans.

Here's an example in Python:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id: str):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)

        # validate the order
        with tracer.start_as_current_span("validate_order"):
            result = validate(order_id)

        if not result.valid:
            span.set_status(trace.StatusCode.ERROR, "Validation failed")
            return

        # charge the customer
        with tracer.start_as_current_span("charge_customer"):
            charge(order_id)
```

This creates a parent `process_order` span with two child spans: `validate_order` and `charge_customer`. In your trace viewer, you'll see exactly how long each step takes, and if any step errors, it'll be flagged.

Good candidates for manual spans:
- Any significant business logic operation
- External API calls not covered by auto-instrumentation
- Expensive computations you want to track
- Cache hits/misses

## Configuring the OTel Collector

The Collector is configured with a YAML file that defines three things: receivers (how data comes in), processors (what to do with it), and exporters (where it goes).

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1000

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

Your services send to `otel-collector:4317` (gRPC) or `otel-collector:4318` (HTTP). The Collector batches the data and forwards it to Jaeger for traces and Prometheus for metrics. If you later decide to switch from Jaeger to Grafana Tempo, you change the exporter config in one place — your application code doesn't change at all.

## The vendor lock-in argument in practice

Here's a concrete example of what OTel saves you from. Without OTel, you might instrument your Go service with the Jaeger client:

```go
// Jaeger-specific code — tied to Jaeger forever
tracer, closer, err := jaeger.NewTracer("my-service", sampler, reporter)
defer closer.Close()

span := tracer.StartSpan("my-operation")
defer span.Finish()
```

With OTel, the same code uses the vendor-neutral API:

```go
// OTel code — works with any backend
tracer := otel.Tracer("my-service")
ctx, span := tracer.Start(ctx, "my-operation")
defer span.End()
```

The OTel version doesn't know or care whether data goes to Jaeger, Tempo, Datadog, or anywhere else. That decision lives entirely in the Collector configuration, outside your application.

<!-- RESOURCES -->

- [OpenTelemetry Getting Started](https://opentelemetry.io/docs/getting-started/) -- type: tutorial, time: 30m
- [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/) -- type: article, time: 20m
- [Auto-instrumentation in OpenTelemetry (Python)](https://opentelemetry.io/docs/zero-code/python/) -- type: tutorial, time: 15m
- [OpenTelemetry Demo Application](https://opentelemetry.io/docs/demo/) -- type: tutorial, time: 45m
- [Why OpenTelemetry? — CNCF blog](https://www.cncf.io/blog/2021/08/06/what-is-opentelemetry-and-why-is-it-the-future-of-instrumentation/) -- type: article, time: 10m
