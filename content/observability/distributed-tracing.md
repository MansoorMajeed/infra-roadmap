---
id: "distributed-tracing"
title: "Distributed Tracing"
zone: "observability"
edges:
  from:
    - id: "alerting"
      question: "Something's slow. Metrics show latency is up. How do I find the actual bottleneck?"
      detail: "A latency spike in a monolith is a profiling problem. In a distributed system — request touching an API gateway, three microservices, a cache, and a database — you need to know where the time went. Distributed tracing records the full journey of a request so you can see exactly which hop is slow."
    - id: "on-call-and-runbooks"
      question: "I'm on-call and I've checked the runbook. It says look at the traces. What is a trace?"
      detail: "A trace is a record of everything that happened while processing a single request — every service it touched, every database query it made, every downstream call it triggered, and how long each one took. It's the map of a request's journey through your system."
  to:
    - id: "iam-and-least-privilege"
      question: "I can observe my system. Now how do I secure it?"
      detail: "Observability tells you what your system is doing. Security tells you what it's allowed to do. IAM, least privilege, secrets management, and network security are the other half of this zone — and with a well-instrumented system, you can observe your security posture too."
difficulty: 2
tags: ["tracing", "opentelemetry", "jaeger", "tempo", "distributed-systems", "observability", "spans"]
category: "practice"
milestones:
  - "Instrument an application with OpenTelemetry to emit spans"
  - "View a trace in Jaeger or Grafana Tempo"
  - "Identify the slowest span in a trace and the service responsible"
  - "Understand what a trace, span, and context propagation are"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
