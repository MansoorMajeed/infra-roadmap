---
id: structured-logging
title: Structured Logging
zone: observability
edges:
  to:
    - id: log-aggregation
      question: >-
        My services emit structured logs. How do I collect and search them all
        in one place?
      detail: >-
        Structured logs are only useful if you can query them. Logs scattered
        across dozens of instances and containers are still unsearchable. Log
        aggregation centralises everything into one place — a single query can
        span every service, every instance, every deployment.
difficulty: 1
tags:
  - logging
  - structured-logging
  - json
  - correlation-id
  - request-tracing
  - observability
category: practice
milestones:
  - Switch your application from print/printf to a structured logging library
  - 'Emit logs as JSON with consistent fields: timestamp, level, service, message'
  - >-
    Add a correlation ID to every log line so you can trace a request across
    services
  - >-
    Understand what log levels are for and why DEBUG logs shouldn't run in
    production
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
