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
        My logs are structured now but they're spread across 10 different
        containers and 3 services. When something breaks I have to SSH into
        each one separately and grep. There must be a way to search everything
        from one place.
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

Plain text logs work fine when you have one small service. When you have three services, a database, a message queue, and traffic from thousands of users, plain text stops scaling. The problem isn't the format itself — it's that text logs can only be searched with text search. You can grep for "error" but you can't ask "show me all requests for user 12345 that took longer than 500ms and returned an error." For that, your log lines need to be machine-parseable, not just human-readable.

Structured logging solves this by emitting logs as key-value pairs — usually JSON — rather than free-form strings. Instead of writing "Payment failed for user 9912 after 3 retries", you write a log event where `level`, `message`, `user_id`, `attempt_count`, and `duration_ms` are all separate, queryable fields. The message is still there and still readable, but now it lives alongside a set of structured fields that a log query tool can filter, aggregate, and join on.

The shift to structured logging is one of the highest-leverage things you can do early in a service's life. It costs very little upfront — swap your print statements for a logging library call — and it unlocks the ability to actually use your logs at scale rather than just grep through them.

<!-- DEEP_DIVE -->

## Plain text vs. structured: a concrete comparison

Imagine a payment service. Here's what the same event looks like as plain text versus structured JSON.

**Plain text:**
```
[2024-01-15 14:32:01] ERROR: Payment processing failed for user 9912 (order 4821): card declined after 2 attempts, took 1842ms
```

This is readable. But to find all failed payments in the last hour, you'd have to grep for "Payment processing failed" and parse the rest by hand. To find failures for a specific user, you'd grep for "user 9912". There's no reliable way to filter by duration or attempt count.

**Structured JSON:**
```json
{
  "timestamp": "2024-01-15T14:32:01Z",
  "level": "error",
  "service": "payment-service",
  "message": "Payment processing failed",
  "user_id": 9912,
  "order_id": 4821,
  "reason": "card_declined",
  "attempt_count": 2,
  "duration_ms": 1842,
  "request_id": "req_a8f3d2c1"
}
```

Now every field is independently queryable. In a log query tool you can write: `service="payment-service" level="error" duration_ms > 1000` and get exactly the results you want. You can group by `reason` to see the breakdown of failure causes. You can filter by `user_id` to see everything that happened for one specific user.

## The standard fields

Every log line your services emit should have a consistent set of base fields. Consistency is what makes logs queryable at scale — if `user_id` is called `userId` in one service and `user` in another, joining on user becomes a manual mess.

These fields should be on every log line:

| Field | Format | Example |
|-------|--------|---------|
| `timestamp` | ISO 8601, UTC | `"2024-01-15T14:32:01.412Z"` |
| `level` | lowercase string | `"error"` |
| `service` | service name | `"payment-service"` |
| `message` | human-readable string | `"Payment processing failed"` |
| `request_id` | UUID or similar | `"req_a8f3d2c1"` |

Beyond that, add context fields relevant to what's being logged: `user_id`, `order_id`, `duration_ms`, `http_status`, `error`, whatever is meaningful for the operation.

## The correlation ID pattern

One of the most valuable uses of structured logging is tracing a single request through multiple services. If a user's request hits your API, which calls a payment service, which calls a database — that single user action generates log lines in at least three places. Without a way to tie them together, debugging a failure means trying to correlate logs from different places by timestamp alone, which is imprecise and painful.

The solution is a correlation ID (also called a request ID or trace ID). At the entry point of a request, generate a unique ID and attach it to every log line for the duration of that request. When your API calls the payment service, pass the correlation ID in a header. The payment service picks it up and includes it in its own logs.

```python
import uuid
import logging

def handle_request(request):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    logger = logging.LoggerAdapter(base_logger, {"request_id": request_id})

    logger.info("Request received", extra={"path": request.path, "method": request.method})
    # ... handle the request
    # Pass request_id to downstream services via header
```

Now when something goes wrong, you take the `request_id` from the user's error report, search your log aggregation system for all lines with that ID, and see the complete story of that request across every service — in chronological order.

## Logging libraries

Don't use raw print statements or `fmt.Println` for production logging. A proper logging library handles timestamp generation, level filtering, output formatting, and structured field attachment without you having to build it yourself.

**Python — structlog:**
```python
import structlog

log = structlog.get_logger()

log.info("payment_processed",
    order_id=4821,
    user_id=9912,
    amount=49.99,
    duration_ms=312
)
```

**Go — zap or zerolog:**
```go
// zerolog
log.Info().
    Int("order_id", 4821).
    Int("user_id", 9912).
    Float64("amount", 49.99).
    Int64("duration_ms", 312).
    Msg("payment processed")
```

**Node.js — pino:**
```javascript
const logger = require('pino')()

logger.info({
  order_id: 4821,
  user_id: 9912,
  amount: 49.99,
  duration_ms: 312
}, 'payment processed')
```

Each of these outputs a JSON line per event with consistent structure. The tradeoff for readability during local development — JSON is noisy to read in a terminal — is usually handled with a pretty-printer script or a development mode that formats output differently.

## Practical tips

**Add context once, not on every call.** Most logging libraries support "bound loggers" — a logger with certain fields already attached. Bind `request_id` and `user_id` at the start of a request, then use that bound logger throughout. You won't forget to include them on individual log calls.

**Log errors with their full context, not just the message.** `log.Error("failed")` is useless. Include the error object, relevant IDs, and whatever the system was doing when it failed.

**Keep message strings static.** Put dynamic values in fields, not embedded in the message string. `log.Info("user logged in", user_id=9912)` is better than `log.Info(f"user {9912} logged in")` — the latter makes it impossible to group or search by message text.

<!-- RESOURCES -->

- [structlog Documentation (Python)](https://www.structlog.org/en/stable/) -- type: article, time: 20m
- [zerolog — Zero Allocation JSON Logger (Go)](https://github.com/rs/zerolog) -- type: article, time: 10m
- [pino — Node.js Logger](https://getpino.io/) -- type: article, time: 10m
- [Structured Logging Best Practices (Datadog)](https://www.datadoghq.com/blog/engineering/logs-performance-best-practices/) -- type: article, time: 12m
