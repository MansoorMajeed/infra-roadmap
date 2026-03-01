---
id: your-first-logs
title: Your First Logs
zone: observability
edges:
  to:
    - id: log-levels
      question: >-
        My app is printing messages everywhere. I can't tell what's important
        and what's noise. How do I control that?
      detail: >-
        I've got logs but they're all the same — every debug message, every
        request, every heartbeat, all mixed together. When something breaks I
        have to scroll through thousands of irrelevant lines to find anything
        useful.
    - id: structured-logging
      question: >-
        My logs are working but searching through plain text is painful. Is there
        a better way to format them?
      detail: >-
        Right now I'm grep-ing for things like "error" and hoping I find what I
        need. But if I want to find all errors for a specific user, or all slow
        requests over 500ms, I'm stuck manually scanning text. There has to be a
        better way.
difficulty: 1
tags:
  - logging
  - observability
  - getting-started
category: practice
milestones:
  - Add meaningful log output to a running service
  - Understand why logging to stdout is preferred over writing to files
  - Identify what information belongs in a log line
  - Recognise why unstructured text logs don't scale
---

Logs are the first thing you reach for when something goes wrong. They're a timestamped record of what your application was doing — requests it received, decisions it made, errors it hit. Before you have metrics dashboards or distributed traces, you have logs, and for a lot of early-stage services, good logs are enough to get by.

The good news is that getting started is simple: just write to stdout. Not to a file, not to a database — stdout. Your runtime (Docker, systemd, Kubernetes, whatever runs your process) will capture stdout automatically, and from there it can be forwarded anywhere. Starting with stdout keeps logging infrastructure out of your application code and puts it where it belongs: in your deployment environment.

The trap most people fall into is either logging too much or logging too little. Too little and you're flying blind — you have no record of what happened. Too much and every meaningful event is buried in noise. The goal is to log meaningful events: things that you'd actually want to know about when something goes wrong, with enough context to understand them without needing to re-run the request.

<!-- DEEP_DIVE -->

## What belongs in a log line

A log line should answer four questions at minimum: when did this happen, how severe is it, what happened, and what was the context?

**When** — a timestamp. Always include one. Without a timestamp, logs are nearly useless for incident investigation. ISO 8601 format is standard (`2024-01-15T14:32:01Z`), and always use UTC so you're not dealing with timezone arithmetic during an outage.

**How severe** — a log level. Is this normal information, a warning, or an error? Log levels are covered in detail in the next node, but even just distinguishing INFO from ERROR immediately makes logs more useful.

**What happened** — the message. This should be human-readable and specific. "Error" tells you nothing. "Failed to process payment for order 4821: card declined" tells you a lot.

**Context** — the fields that let you find related events. At minimum: which service emitted this, which request ID caused it, and what user or entity was involved. These are what let you search for "all logs related to this one request" rather than scrolling.

## Bad log lines vs. useful log lines

Here's the difference in practice. Imagine a payment service:

**Bad:**
```
Error processing payment
Request failed
Retrying...
Success
```

These lines are nearly useless in an incident. You can't tell when they happened (no timestamp), what the error was (no detail), which user's payment failed (no context), or which request you should be investigating (no request ID).

**Better:**
```
2024-01-15T14:32:01Z INFO  payment-service: received payment request order_id=4821 user_id=9912 amount=49.99
2024-01-15T14:32:02Z ERROR payment-service: card charge failed order_id=4821 user_id=9912 error="card_declined" attempt=1
2024-01-15T14:32:03Z INFO  payment-service: retry attempt 2 order_id=4821 user_id=9912
2024-01-15T14:32:04Z INFO  payment-service: payment completed order_id=4821 user_id=9912 duration_ms=3021
```

Now you can see exactly what happened, in what order, for which order and user, and how long it took. If a user calls in saying their payment failed, you can search for their user ID and find the exact event instantly.

## Why stdout, not files

In a traditional single-server world, logging to a file made sense. You'd write to `/var/log/myapp.log`, set up logrotate to prevent the disk from filling up, and SSH in to read it when needed.

In containerised environments, this approach breaks down:

- Containers are ephemeral. When a container dies, its filesystem goes with it, including any log files inside it.
- You might have 20 container replicas running the same service. Logging to files means 20 separate places to look.
- The orchestrator (Kubernetes, ECS, whatever) has built-in mechanisms to capture stdout and forward it — but not for files inside containers.

When you log to stdout, the container runtime captures it automatically. Docker does it, Kubernetes does it, systemd does it. From there, a log shipping agent running on the host can pick it up and forward it to your central log store. Your application doesn't need to know or care about any of that.

The principle: your application's job is to emit log events. Where those events go is someone else's problem — the infrastructure layer's problem.

## The two failure modes

**Too little logging.** You deploy a service with no logging at all. The first time something goes wrong, you have nothing. You restart the process and the problem goes away temporarily, but you never find out what caused it. Two weeks later it happens again.

The fix: at minimum, log the start of every significant operation and its outcome — especially failures. Log every unhandled exception. Log every external call your service makes (database, API) and whether it succeeded. You don't need to log everything, but you need to log the decisions your service makes.

**Too much logging.** You log every function entry and exit, every variable assignment, every loop iteration. In production, this produces so much output that real errors are invisible. Even if you store all of it, the cost of storing and querying millions of irrelevant lines is significant.

The fix: be deliberate about what you log. Debug-level output can be verbose, but only emit it when you need it — not in production by default. Reserve most of your logging for meaningful events: requests, responses, errors, state transitions. The signal-to-noise ratio matters as much as the signal itself.

<!-- RESOURCES -->

- [The Twelve-Factor App: Logs](https://12factor.net/logs) -- type: article, time: 5m
- [Application Logging Best Practices (Datadog)](https://www.datadoghq.com/blog/python-logging-best-practices/) -- type: article, time: 10m
- [Logging in Python: A Guide](https://realpython.com/python-logging/) -- type: tutorial, time: 20m
