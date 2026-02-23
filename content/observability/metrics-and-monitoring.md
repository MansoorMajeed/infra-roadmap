---
id: "metrics-and-monitoring"
title: "Metrics and Monitoring"
zone: "observability"
edges:
  from:
    - id: "log-aggregation"
      question: "Logs show me what happened. What shows me how the system is performing right now?"
      detail: "Logs are events — discrete records of what occurred. Metrics are measurements — numbers sampled over time. Request rate, error rate, latency p99, CPU usage, memory pressure. Metrics are what you put on dashboards and alert on."
  to:
    - id: "dashboards"
      question: "I'm collecting metrics. How do I visualise them usefully?"
      detail: "I've got metrics being collected but it's just numbers in a terminal query. I want something I can actually look at during an incident — something that shows me at a glance whether things are getting worse or better."
    - id: "sli-slo-error-budgets"
      question: "I have metrics. But which ones actually matter? How do I define 'the system is healthy'?"
      detail: "Collecting metrics is easy. Knowing which metrics reflect whether users are having a good experience is harder. Service Level Indicators (SLIs) and Service Level Objectives (SLOs) give you a principled framework for measuring reliability — and error budgets tell you when you're burning through it."
difficulty: 1
tags: ["metrics", "prometheus", "cloudwatch", "four-golden-signals", "monitoring", "observability"]
category: "practice"
milestones:
  - "Instrument your application to expose the four golden signals: latency, traffic, errors, saturation"
  - "Collect metrics with Prometheus or CloudWatch"
  - "Understand the difference between counters, gauges, and histograms"
  - "Explain why p99 latency is more informative than average latency"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
