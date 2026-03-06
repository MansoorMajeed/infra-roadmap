---
id: what-is-observability
title: What Is Observability?
zone: observability
edges:
  to:
    - id: your-first-logs
      question: OK I get it — logs, metrics, traces. But where do I actually start?
      detail: >-
        I've seen people mention logs, metrics, and traces but I don't know
        where to actually begin. Do I try to set up all three at once? If I
        only have time for one right now, which gives me the most value? I
        don't want to spend a week on the wrong thing.
    - id: metrics-and-monitoring
      question: >-
        I already know how logging works. How do I measure what my systems
        are actually doing over time?
      detail: >-
        I've set up logging before — I know about log levels, structured
        logs, aggregation. What I don't have is numbers — request rates,
        error percentages, latency. I want graphs that show me whether things
        are getting better or worse, not just a wall of text to search through.
difficulty: 1
tags:
  - observability
  - three-pillars
  - logs
  - metrics
  - tracing
  - concept
category: concept
milestones:
  - Explain what observability means and how it differs from monitoring
  - Name the three pillars and describe what question each one answers
  - Understand why all three pillars are needed — no single signal tells the full story
  - Identify which pillar helps with what during a real incident
---

Observability is the ability to understand the internal state of a system by looking at its external outputs. The word comes from control theory, but for SREs and developers it means something concrete: given that something has gone wrong, can you figure out what and why, purely from the signals your system is emitting? If the answer is yes, your system is observable. If the answer is "I need to SSH in and look around," it isn't.

The word gets thrown around a lot, but the underlying idea is straightforward. Observability is built on three types of signals, commonly called the three pillars: logs, metrics, and traces. Each one answers a different kind of question. Logs tell you *what happened*. Metrics tell you *how your system is performing over time*. Traces tell you *why a specific request was slow or failed*. You need all three because no single signal gives you the full picture.

Observability is often confused with monitoring, but they're different things that work together. Monitoring is about watching for known failure conditions and alerting when they're breached — error rate over 5%, disk over 90%. Observability is about being able to investigate what you don't already know to look for. Monitoring gets you the alert. Observability lets you diagnose what's actually wrong.

<!-- DEEP_DIVE -->

## The three pillars

### Logs: what happened

Logs are timestamped records of discrete events. Every time something happens in your application — a request came in, a query ran, an error was thrown, a user logged in — a log line records it. Logs are the most intuitive signal because they're just text you can read.

The strength of logs is specificity. A log line can tell you exactly what happened at exactly what time, for exactly which user, with exactly what input data. When something goes wrong, logs are where you look to understand the concrete sequence of events.

The weakness of logs is volume. A busy service might emit millions of log lines per hour, and making sense of that requires good tooling. Searching through raw logs for a needle in a haystack is painful without a proper query interface.

### Metrics: how is it performing

Metrics are numeric measurements recorded over time. Things like: how many requests per second is my service handling, what percentage of those requests are returning errors, how long is the p99 response time, how much memory is the process using. Metrics are aggregated — you're not storing one row per event, you're storing summaries over time intervals.

The strength of metrics is efficiency and dashboards. Because they're numbers, you can graph them, set alert thresholds on them, and answer "is this getting better or worse over time?" in seconds. Metrics are what power the dashboards on the big screen at an SRE team's wall.

The weakness of metrics is that they're lossy. When your error rate spikes to 12%, metrics tell you that. They don't tell you which users, which endpoint, what error message, or what the request looked like. To dig into the details, you need logs or traces.

### Traces: why is it slow

A trace is a record of a single request as it travels through your system — from the moment it hits your API, through every service call, database query, and cache lookup, until the response goes back. Each step is recorded as a "span," and the spans are assembled into a tree that shows exactly where time was spent.

Traces exist because modern systems are distributed. A slow request might be caused by a slow database query in service B, which is called by service A, which is called by your API. Without tracing, all you know is "this request took 4 seconds." With tracing, you can see that 3.8 of those seconds were spent waiting for a specific SQL query in a specific service.

The weakness of traces is setup cost. Tracing requires instrumenting your code — either manually or with an auto-instrumentation library — and running trace collection infrastructure. It's the most powerful of the three pillars and also the most expensive to set up.

## Why you need all three

It's tempting to think you can get away with one or two. You can't, at least not at any real scale. Here's why.

Imagine your error rate spikes (metrics alert you). You look at the metrics dashboard — error rate is 15%, up from 0.5% baseline. OK, something is wrong. But metrics don't tell you what. So you go to logs. You filter to errors and see a wave of `database: connection refused` messages. Now you know the what. But why is the database refusing connections? Is it overloaded? Did a connection pool exhaust? This is where traces would show you what's filling the connection pool — some set of requests that's holding connections open too long.

Each pillar narrows the problem down further. Metrics say something is wrong. Logs say what is wrong. Traces say why it's wrong and where in the call chain to look.

## Monitoring vs. observability

Monitoring is a subset of what observability enables. Monitoring means: I know in advance what failure modes look like, and I've set up alerts for them. Observability means: I can investigate failure modes I didn't anticipate.

Both matter. You need monitoring because you can't sit and watch dashboards all day — you need to be alerted when things go wrong. But you need observability because your monitoring will never cover every possible failure mode. Novel problems need investigation, and investigation requires being able to ask questions of your running system without having thought of the question in advance.

The practical way to think about it: monitoring is your smoke detector, observability is your ability to figure out where the fire is.

<!-- RESOURCES -->

- [Observability vs. Monitoring (Datadog)](https://www.datadoghq.com/knowledge-center/observability/) -- type: article, time: 10m
- [Logs vs Metrics vs Traces (Honeycomb)](https://www.honeycomb.io/blog/metrics-logs-and-traces-oh-my) -- type: article, time: 12m
- [What Is OpenTelemetry? (CNCF)](https://opentelemetry.io/docs/what-is-opentelemetry/) -- type: article, time: 8m
- [Observability Engineering (O'Reilly)](https://www.oreilly.com/library/view/observability-engineering/9781492076438/) -- type: book, time: 360m
