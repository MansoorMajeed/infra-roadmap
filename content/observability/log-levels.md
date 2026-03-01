---
id: log-levels
title: Log Levels
zone: observability
edges:
  to:
    - id: structured-logging
      question: >-
        I've got log levels set up. But searching through plain text is still
        painful. Is there a better format?
      detail: >-
        I'm using debug and error now but even filtered to just errors, each
        line is just a sentence — I can't filter by field or join on a request
        ID. The right level is there but the message itself is impossible to
        parse programmatically.
difficulty: 1
tags:
  - logging
  - log-levels
  - observability
category: practice
milestones:
  - Understand what each log level means and when to use it
  - Configure your service to log at info by default and debug only when needed
  - Understand why debug-everywhere destroys signal-to-noise ratio
  - Know which level should cause an alert vs which is just informational
---

Every logging library gives you levels — DEBUG, INFO, WARN, ERROR — but most people either ignore them (logging everything at the same level) or misuse them (calling everything an ERROR). Getting this right is one of the cheapest observability improvements you can make, because log levels are the primary mechanism for controlling signal-to-noise ratio. When everything is at the same level, your logs are noise. When levels are used correctly, you can filter to just errors and see exactly what's broken.

The mental model is simple: the level tells you how much attention this event deserves. DEBUG is for detailed internal state you'd only want when actively diagnosing a specific problem. INFO is for normal, noteworthy events. WARN is for unexpected things that were handled gracefully. ERROR is for things that went wrong and shouldn't have. Anything you'd want to be woken up about at 2am belongs at ERROR, possibly higher.

The rule of thumb for production is: run at INFO, flip to DEBUG only when actively investigating. DEBUG in production all the time means your real errors are buried under thousands of lines of normal operation detail. A spike of ERRORs should jump out immediately when you look at your logs — and it can't, if the errors are swimming in a sea of DEBUG output.

<!-- DEEP_DIVE -->

## The four main levels

### DEBUG

Debug logs are internal, verbose, for developers. They record the kind of detail you'd want when you're sitting at your desk trying to understand why something is misbehaving: function arguments, loop iteration counts, intermediate variable values, database query parameters.

```
DEBUG: Fetching user from cache key=user:9912
DEBUG: Cache miss, querying database user_id=9912
DEBUG: Query returned in 4ms rows=1
DEBUG: Building user object from row id=9912 email=alice@example.com
```

This is useful when you're debugging a problem. It's noise when you're not. The rule: never leave DEBUG logging on in production continuously. The volume will bury your real signals and the storage costs add up fast.

### INFO

Info logs record normal, noteworthy events — things that are worth knowing happened, but not alarming. Request received, job started, job completed, user logged in, payment processed.

```
INFO: Payment processed order_id=4821 user_id=9912 amount=49.99 duration_ms=312
INFO: User session created user_id=9912 ip=203.0.113.45
INFO: Scheduled job started job=daily-report
INFO: Scheduled job completed job=daily-report records_processed=14291 duration_ms=8420
```

INFO is your default production log level. It gives you an audit trail of what your system was doing without overwhelming you with detail.

### WARN

WARN is the most commonly misused level. People either never use it or use it for things that are genuinely errors. The correct definition: WARN is for something unexpected that happened, but the system handled it and continued operating normally.

Good candidates for WARN:
- A retry succeeded on the second attempt (the first attempt failed, but we recovered)
- Falling back to a slower path because the faster one is unavailable
- A deprecated API endpoint is being called (it works, but it shouldn't be)
- A request took longer than expected but succeeded

```
WARN: Payment gateway timed out, retrying order_id=4821 attempt=1
INFO: Payment gateway retry succeeded order_id=4821 attempt=2
WARN: Deprecated endpoint called /api/v1/users client_ip=203.0.113.45
```

WARN says: "I noticed something, dealt with it, and you should probably know." It's not necessarily a problem right now, but it might be a sign of something worth looking into.

### ERROR

ERROR means something went wrong that shouldn't have. A request failed. An operation that was expected to succeed didn't. Data that should be valid isn't. An external dependency returned an unexpected response.

```
ERROR: Payment failed order_id=4821 user_id=9912 reason="card_declined" error="stripe: card was declined"
ERROR: Database query failed query="SELECT * FROM orders WHERE id=?" error="connection refused" duration_ms=5001
ERROR: Unhandled exception in request handler path=/api/checkout method=POST error="NullPointerException at PaymentService.java:142"
```

ERRORs should be relatively rare in a healthy system. If you're generating hundreds of ERRORs per minute during normal operation, either something is actually broken, or things that should be WARN or INFO are being logged at ERROR. Both problems are worth fixing.

## The signal-to-noise problem in practice

Imagine your service is emitting 10,000 log lines per minute: 9,900 at DEBUG and 100 at INFO. Buried somewhere in those 10,000 lines are 3 ERROR lines. Someone has to find those 3 lines.

Now flip to INFO level (suppress DEBUG), and you're emitting 103 lines per minute — 100 INFO and 3 ERROR. The errors are immediately visible.

This is why "log everything at DEBUG in production" is such a bad practice. It doesn't add safety — it removes it. The errors are there, they're just invisible.

## Configuring log levels

Most logging libraries read the log level from an environment variable or config file at startup. You never want to hardcode a level in your application — that would require a redeploy to change it.

**Python (standard library):**
```python
import logging
import os

log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, log_level))
```

**Go (with slog):**
```go
level := slog.LevelInfo
if os.Getenv("LOG_LEVEL") == "DEBUG" {
    level = slog.LevelDebug
}
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
```

**Node.js (with pino):**
```javascript
const pino = require('pino')
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
```

The pattern is the same everywhere: default to INFO, allow override via environment variable. When you need to debug a production issue, set `LOG_LEVEL=DEBUG` for a specific service instance, capture what you need, then set it back.

## Which level should trigger an alert?

Not all levels are equally alertworthy. A general rule:

| Level | Alert? | Why |
|-------|--------|-----|
| DEBUG | No | Never in production; pure noise |
| INFO | No | Normal operation |
| WARN | Maybe | Worth a dashboard, alert only if rate spikes significantly |
| ERROR | Yes | Failures shouldn't be happening; alert when error rate exceeds threshold |

Alerts on raw ERROR counts are often noisy. A better approach is to alert on error rate — ERRORs as a percentage of total requests. A single error in 10,000 requests is very different from 500 errors in 1,000 requests.

<!-- RESOURCES -->

- [Log Levels Explained (Loggly)](https://www.loggly.com/blog/logging-levels/) -- type: article, time: 8m
- [Python Logging HOWTO (official docs)](https://docs.python.org/3/howto/logging.html) -- type: article, time: 15m
- [Structured Logging with Go slog](https://pkg.go.dev/log/slog) -- type: article, time: 10m
