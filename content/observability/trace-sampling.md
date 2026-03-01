---
id: trace-sampling
title: Trace Sampling
zone: observability
edges:
  to:
    - id: correlating-signals
      question: >-
        Sampling is configured. Now how do I actually use the traces I have
        alongside my logs and metrics?
      detail: >-
        I'm keeping a sensible subset of traces now. But when I'm debugging I
        still have to jump between my trace tool, my log tool, and Grafana
        separately. I'm copy-pasting timestamps and hoping the right data lines
        up. There has to be a way to actually connect them.
difficulty: 2
tags:
  - tracing
  - sampling
  - head-sampling
  - tail-sampling
  - observability
  - cost
category: concept
milestones:
  - Understand why tracing 100% of requests is impractical at scale
  - Know the difference between head-based and tail-based sampling
  - Configure a sampling rate in your tracing setup
  - Understand why tail sampling is better for catching errors but harder to implement
---

A service handling 1,000 requests per second generates 1,000 traces per second. If each trace is 10KB of data, that's 10MB per second, 864GB per day — for a single service. Add more services, more spans per trace, and you're looking at terabytes of trace data daily. Storing all of it is impractical and, honestly, unnecessary: the 999th request that looked exactly like the first 998 doesn't teach you anything new.

Sampling means keeping only a representative subset of traces. Done right, you keep enough traces to diagnose problems without drowning in data. Done poorly, you might discard the exact trace that would have explained your 3am incident. The challenge is that you don't always know which traces are interesting until after they're complete — and by then, the decision about whether to keep them might already have been made.

There are two fundamentally different approaches to this problem, and understanding the tradeoff between them is important before you configure anything.

<!-- DEEP_DIVE -->

## Head-based sampling

In head-based sampling, the decision to keep or discard a trace is made at the very beginning — when the root span starts. Your API gateway or first service flips a coin and decides "yes, trace this request" or "no, skip it." That decision is propagated to every downstream service as part of the trace context, so the whole system either traces the request or doesn't.

Head-based sampling is simple to implement and has essentially zero overhead for discarded requests — you're not collecting data you're going to throw away. The standard way to configure it in OTel is a `TraceIdRatioBased` sampler:

```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# Sample 10% of traces
sampler = TraceIdRatioBased(0.10)
```

The fatal flaw: the decision happens before anything has gone wrong. If you sample 10% of requests and 1% of those requests hit an error, you're keeping 10% of your errors — meaning you miss 90% of error traces. The one request that took 5 seconds and failed in a confusing way? There's a 90% chance you dropped it.

## Tail-based sampling

In tail-based sampling, you buffer all spans from a trace until the trace is complete, then decide whether to keep it based on what actually happened. This means you can apply intelligent rules: keep 100% of traces that contain an error, keep 100% of traces over 2 seconds, and sample 5% of everything else.

The result is far better signal. You never miss an error trace. You never miss a slow trace. You shed volume from the boring, fast, successful requests that don't need investigating.

The cost is complexity. You need a component that can buffer and hold all spans, correlate them by trace ID, wait for the trace to complete, and then make the sampling decision. The OTel Collector's `tail_sampling` processor does this:

```yaml
processors:
  tail_sampling:
    decision_wait: 10s       # wait up to 10s for all spans to arrive
    num_traces: 50000        # max traces to hold in memory at once
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow-traces
        type: latency
        latency: {threshold_ms: 1000}
      - name: everything-else
        type: probabilistic
        probabilistic: {sampling_percentage: 5}
```

This config keeps all errors, all traces over 1 second, and 5% of everything else. In practice this reduces volume dramatically while preserving almost all the traces that matter.

The catch: tail sampling requires all spans for a given trace to arrive at the same Collector instance, because the Collector needs to see the complete trace to make the decision. In a horizontally scaled Collector deployment, you need to route spans by trace ID to ensure they land in the same place. The `loadbalancingexporter` in OTel handles this.

## A practical starting point

If you're just getting started with sampling:

1. **Start with head-based sampling at 10%** — it's easy to configure and immediately reduces your storage costs by 10x. You'll miss some errors, but you'll understand your baseline.

2. **Add 100% error sampling as soon as you can** — even with head-based sampling, many SDKs let you override the sampling decision after the fact if the trace completed with an error.

3. **Move to tail-based sampling when you have the infrastructure for it** — this is the approach production systems with meaningful traffic use.

A common production setup:

| Scenario | Keep |
|----------|------|
| Request returned 5xx | 100% |
| Request duration > 2s | 100% |
| Request returned 4xx | 20% |
| Everything else | 5% |

## The trade-off you're always making

Sampling is a compression of reality. A 5% sample rate means 1-in-20 requests appears in your tracing tool. If you're debugging a bug that affects 0.1% of requests, you might need to trigger hundreds of requests before a trace from the affected path lands in your 5% sample.

The way to think about this: sampling is appropriate for understanding patterns (what does normal look like? where is the p99 hotspot?). For debugging specific bugs, especially rare ones, you sometimes need to temporarily increase your sample rate or add targeted 100% sampling for specific endpoints.

Tail-based sampling with intelligent policies mostly solves this for errors and slowness — the cases you care most about. But for debugging a subtle correctness bug (not an error, not slow, just wrong output for certain inputs), you may still need to trace 100% of requests temporarily.

<!-- RESOURCES -->

- [Sampling — OpenTelemetry docs](https://opentelemetry.io/docs/concepts/sampling/) -- type: article, time: 10m
- [OTel Collector tail_sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor) -- type: article, time: 15m
- [Trace Sampling Strategies — Honeycomb](https://www.honeycomb.io/blog/trace-sampling-strategies/) -- type: article, time: 12m
- [Head vs Tail Sampling — Grafana docs](https://grafana.com/docs/tempo/latest/operations/tempo_cli/#tail-sampling) -- type: article, time: 10m
