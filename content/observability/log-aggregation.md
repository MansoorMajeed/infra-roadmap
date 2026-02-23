---
id: log-aggregation
title: Centralised Log Aggregation
zone: observability
edges:
  to:
    - id: metrics-and-monitoring
      question: >-
        Logs tell me what happened. What tells me how the system is performing
        right now?
      detail: >-
        Logs are great for debugging specific events. But for understanding
        system-wide behaviour — request rates, error rates, latency percentiles
        — you need metrics. Metrics are numerical measurements sampled over
        time, and they're the foundation of dashboards and alerting.
difficulty: 1
tags:
  - logging
  - log-aggregation
  - cloudwatch
  - loki
  - elk
  - opensearch
  - fluentd
  - observability
category: practice
milestones:
  - >-
    Ship logs from an application to a central store (CloudWatch Logs, Loki, or
    equivalent)
  - >-
    Write a query to find all error logs from a specific service in the last
    hour
  - >-
    Filter logs by correlation ID to trace a single request across multiple
    services
  - Understand the cost implications of log retention and volume
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
