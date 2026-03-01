---
id: distributed-tracing
title: Distributed Tracing
zone: observability
edges:
  to:
    - id: opentelemetry
      question: >-
        I want to add tracing but I don't want to be locked into one vendor's
        SDK forever. Is there a standard way to instrument my code?
      detail: >-
        I've looked at Jaeger, Datadog, and Honeycomb and they all have
        different instrumentation libraries. If I pick one and later want to
        switch, I'd have to re-instrument everything. Surely there's a
        vendor-neutral way to add tracing.
    - id: trace-sampling
      question: >-
        I turned on tracing and my storage costs tripled. I can't keep a trace
        for every single request — how do I decide what to keep?
      detail: >-
        Tracing 100% of requests at any real traffic volume is clearly not
        sustainable. But if I sample randomly I might miss the slow requests
        I actually care about. How do people solve this?
    - id: correlating-signals
      question: >-
        I have logs, metrics, and traces. But during an incident I'm jumping
        between three different tools. Shouldn't these connect somehow?
      detail: >-
        I see a latency spike in Grafana, I want to find the trace for one of
        those slow requests, I want to find the logs for that trace — but each
        step requires me to manually guess. I'm copy-pasting timestamps between
        tabs. This can't be how it's supposed to work.
difficulty: 2
tags:
  - tracing
  - opentelemetry
  - jaeger
  - tempo
  - distributed-systems
  - observability
  - spans
category: practice
milestones:
  - Instrument an application with OpenTelemetry to emit spans
  - View a trace in Jaeger or Grafana Tempo
  - Identify the slowest span in a trace and the service responsible
  - 'Understand what a trace, span, and context propagation are'
---

When a request hits your API, it might touch five different services before a response comes back. If that request is slow, logs from any single service won't tell you which service caused the problem — they only show what happened inside that service. Distributed tracing solves this by following a single request across every service it touches, recording timing information for each step, and stitching them into a single timeline you can read at a glance.

The core idea is simple: a trace is the complete story of one request, end-to-end. It's made up of spans — each span represents one unit of work. A service receiving an HTTP call is a span. A database query inside that service is another span. A downstream API call is another. Spans have parent-child relationships, so you end up with a tree that mirrors the path the request actually took through your system.

When you look at that tree in a tool like Jaeger or Grafana Tempo, the view is called a waterfall. Time flows left to right, and each span appears as a horizontal bar. Narrow bars mean fast. Wide bars mean slow. If you see one bar that stretches halfway across the screen, you've found your problem. This is something logs alone can never give you — the visual, immediate answer to "which service is the bottleneck?"

<!-- DEEP_DIVE -->

## Traces and spans

A **trace** represents the full lifecycle of a single request, from the moment it enters your system to the moment the response is sent. Every trace has a unique trace ID — a random hex string like `4bf92f3577b34da6a3ce929d0e0e4736`. That ID gets passed along as the request moves through your services, connecting all the work together.

A **span** is one unit of work within a trace. Every span records:
- A name (e.g., `HTTP POST /orders`, `db.query`, `payment-service.charge`)
- A start time and duration
- A status (OK or Error)
- Optional attributes (metadata like `http.status_code`, `db.statement`, `user.id`)
- The trace ID it belongs to
- The ID of its parent span (if it has one)

Here's what a simple three-service trace looks like conceptually:

```
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736

[api-gateway]           POST /checkout          0ms → 320ms
  [order-service]         createOrder           12ms → 180ms
    [postgres]              INSERT orders        15ms → 42ms
    [payment-service]       chargeCard          50ms → 175ms
      [stripe-api]            POST /charges     55ms → 170ms
```

The api-gateway span is the root span — it has no parent. The order-service span is a child of api-gateway. The postgres and payment-service spans are children of order-service. Reading it this way, you can see immediately that `stripe-api` took 115ms, which is the bulk of the total latency.

## Parent-child relationships and the waterfall view

In a trace viewer, this tree becomes a waterfall diagram. Each span is a horizontal bar, indented to show its depth in the tree. Time is the x-axis. The widest bar is the slowest span.

```
|-- api-gateway (320ms) -----------------------------------|
    |-- order-service (168ms) -------------------|
        |-- postgres (27ms) ----|
        |-- payment-service (125ms) --------------|
            |-- stripe-api (115ms) --------------|
```

Reading a waterfall:
1. Start at the top — the root span shows total request time
2. Look for the widest bars, especially deep in the tree (they're the ones you can optimize)
3. Look for gaps — time where nothing is happening might indicate a lock, a queue wait, or unnecessary serialization
4. Look for spans that run sequentially when they could run in parallel

## Context propagation

For a trace to work, every service needs to know which trace it belongs to. This is done via **context propagation** — the trace ID is passed from service to service as an HTTP header.

The standard header is `traceparent`, defined by the W3C Trace Context specification. It looks like this:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

The fields are: `version-traceId-parentSpanId-flags`. When your order-service calls payment-service, it includes this header in the outgoing HTTP request. Payment-service reads it, creates a new span as a child of the parent span ID, and continues the trace.

Most tracing libraries handle this automatically for common HTTP clients. You declare that you want to propagate context, and the library injects and extracts the header for you.

## Tracing vs logs: what each is for

Logs and traces are complementary, not competing. They answer different questions:

| Question | Use |
|----------|-----|
| Which service caused the slowdown? | Trace (waterfall view) |
| What path did this request take? | Trace (span tree) |
| Was this an error? Where exactly did it fail? | Trace (error status + attributes) |
| What SQL query ran? What did it return? | Log (from the service) |
| What was the user's input that caused this? | Log (structured log line) |
| Did this error happen before or after a deploy? | Log + metric |

A good rule of thumb: traces show you the structure and timing of what happened. Logs show you the details of what happened inside each service. When you're debugging, you typically start with a trace to identify which service and which span is the problem, then look at logs from that service during that time window to understand why.

## A real debugging workflow

1. You get a p99 latency alert — 95th percentile response time is above your SLO.
2. You open Jaeger or Tempo and filter for traces with duration above 2 seconds.
3. You pick one slow trace and open the waterfall. The `payment-service` span is 1.8 seconds wide.
4. You expand the payment-service span and see `stripe-api` is 1.75 seconds — a timeout, probably.
5. You look at the span attributes: `http.status_code: 504`. The Stripe API timed out.
6. You check whether Stripe had an incident at that time. They did.

Without tracing, step 4 might have taken hours of log-digging across multiple services. With tracing, it took about two minutes.

<!-- RESOURCES -->

- [Distributed Tracing — OpenTelemetry docs](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) -- type: article, time: 10m
- [Jaeger: Getting Started](https://www.jaegertracing.io/docs/latest/getting-started/) -- type: tutorial, time: 20m
- [W3C Trace Context specification](https://www.w3.org/TR/trace-context/) -- type: article, time: 15m
- [Grafana Tempo: Getting Started](https://grafana.com/docs/tempo/latest/getting-started/) -- type: tutorial, time: 20m
- [Life of a Span — Lightstep blog](https://lightstep.com/blog/life-of-a-span) -- type: article, time: 8m
