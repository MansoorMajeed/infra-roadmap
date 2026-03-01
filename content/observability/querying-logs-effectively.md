---
id: querying-logs-effectively
title: Querying Logs Effectively
zone: observability
edges:
  to:
    - id: metrics-and-monitoring
      question: >-
        Logs tell me about specific events. But how do I see how my service is
        performing overall, right now?
      detail: >-
        I can dig up what happened after the fact in the logs, but I can't
        answer "is my service currently healthy?" from logs alone. Every
        question I want to ask — what's my error rate, how many requests per
        second — requires me to query and count. There must be a better tool
        for real-time performance questions.
difficulty: 1
tags:
  - logging
  - log-querying
  - loki
  - cloudwatch-logs-insights
  - observability
category: practice
milestones:
  - Write queries to filter logs by field values (service name, log level, user ID)
  - Use a correlation ID to trace a single request across multiple services in logs
  - Understand the difference between full-text search and structured field queries
  - Know when logs are the right tool vs. when metrics would answer the question better
---

Getting logs into a central store is only half the work. The other half is being able to find what you need when something goes wrong. Most people start by scrolling through the log viewer and ctrl-F-ing for keywords — the same thing they were doing on the command line. That approach hits a wall quickly. When you're dealing with thousands of log lines across dozens of services, you need to write actual queries rather than browse.

The mental model shift is from "find the line that says what I'm looking for" to "ask a question of the log data." The difference is the same as using SQL versus scrolling through a spreadsheet. The query language lets you filter by specific fields, narrow by time range, join on correlation IDs across services, and extract counts and rates — none of which is practical with manual browsing.

The investment in learning your log query language pays for itself the first time you're in an incident. Knowing how to answer "show me all errors in the payment service in the last 30 minutes, for users in the EU, grouped by error type" in under a minute is the difference between a 10-minute investigation and a 2-hour one.

<!-- DEEP_DIVE -->

## Full-text search vs. structured field queries

Log systems support two types of search, and they're used for different things.

**Full-text search** treats the entire log line as text and searches for a substring match. This is the equivalent of grep. It's useful when you don't know the exact field name, when you're searching for an error message you already know, or when your logs aren't structured.

```
# Full-text search — find any line containing this string
"connection refused"
```

**Structured field queries** filter on specific key-value pairs. This is only possible when your logs are structured (JSON). It's faster, more precise, and composable — you can combine multiple field filters.

```
# Structured query — find lines where the level field equals "error"
# AND the service field equals "payment-service"
level="error" AND service="payment-service"
```

The practical difference: full-text search for "error" will match log lines that happen to contain the word "error" anywhere — in the message, in a variable value, in a user-provided string. A structured query for `level="error"` only matches lines where the log level is actually set to error by your logging library.

When your logs are structured, always prefer field queries over full-text search. They're more precise and much faster at scale.

## Querying with Loki (LogQL)

LogQL is Loki's query language. It has two parts: a log stream selector (which selects which log streams to look at, based on labels) and an optional filter pipeline.

**Basic label filtering:**
```logql
{service="payment-service"}
```
This selects all log lines from the payment-service label. Labels in Loki are the metadata attached at ship time (service name, namespace, pod name).

**Adding a filter on log content:**
```logql
{service="payment-service"} |= "error"
```
The `|=` operator filters for lines containing the string "error". This is full-text search within the selected stream.

**Filtering on JSON fields (structured logs):**
```logql
{service="payment-service"} | json | level="error"
```
The `| json` step parses each log line as JSON and extracts the fields. After that, you can filter on any field.

**Combining filters:**
```logql
{service="payment-service"} | json | level="error" | duration_ms > 1000
```
Error logs from the payment service where the request took more than 1 second.

**Filtering by correlation ID:**
```logql
{namespace="production"} | json | request_id="req_a8f3d2c1"
```
This finds all log lines with that request ID, across every service in the production namespace — showing you the complete story of that one request.

## Querying with CloudWatch Logs Insights

CloudWatch Logs Insights uses its own SQL-like query language. The basic building blocks are `fields`, `filter`, `stats`, and `sort`.

**Find all errors in the last hour:**
```sql
fields @timestamp, @message
| filter level = "error"
| sort @timestamp desc
| limit 100
```

**Filter by service and error level:**
```sql
fields @timestamp, service, message, user_id
| filter level = "error" and service = "payment-service"
| sort @timestamp desc
```

**Trace a single request by correlation ID:**
```sql
fields @timestamp, service, level, message
| filter request_id = "req_a8f3d2c1"
| sort @timestamp asc
```

Note the `sort @timestamp asc` — when tracing a request, you want chronological order so you can see what happened first.

**Count errors by type:**
```sql
filter level = "error"
| stats count(*) as error_count by reason
| sort error_count desc
```

This gives you a breakdown of what's failing and how often, which is useful for prioritising what to fix.

## The correlation ID workflow

This is the most powerful technique for diagnosing problems in a distributed system. The steps:

1. Something breaks. You get a report: "user 9912 got an error at 14:32."
2. You don't know which service failed — it could be the API, the payment service, the notification service, any of them.
3. You search for all logs for that user around that time: `user_id="9912"` with a time filter of ±5 minutes.
4. You find a log line with a `request_id`: `"req_a8f3d2c1"`.
5. You search for that request ID across all services: `request_id="req_a8f3d2c1"`.
6. Now you see every log line that was part of that one request — from the API that received it, to the payment service that processed it, to the notification service that tried to send the email. In chronological order.
7. You can see exactly where in the chain the failure happened, what error was thrown, and what the state was at that point.

This entire investigation might take 3 minutes with good structured logs and a correlation ID. Without them, it might take hours of SSH-ing into machines and correlating timestamps manually.

## When to use logs vs. metrics

Logs and metrics answer different questions. Knowing which one to reach for saves time.

**Reach for logs when:**
- You know something specific happened and want to understand the details: what error, for which user, what was the input?
- You're tracing a single request or user session across multiple services.
- You need the exact sequence of events leading up to a failure.
- You're debugging a bug and need to see exactly what the code was doing.

**Reach for metrics when:**
- You want to know the current state of the system: error rate, request rate, latency percentiles.
- You want to compare now to an hour ago or a week ago.
- You want to know if something is trending up or down over time.
- You want to be alerted when a threshold is crossed.

The failure mode to avoid: using log queries to answer metric-shaped questions. Counting log lines to calculate your error rate is slow, expensive, and delayed. Metrics are pre-aggregated and much faster for that use case. Use each tool for what it's good at.

<!-- RESOURCES -->

- [LogQL Documentation (Grafana Loki)](https://grafana.com/docs/loki/latest/query/) -- type: article, time: 20m
- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html) -- type: article, time: 15m
- [Tutorial: Querying Logs with Loki and Grafana](https://grafana.com/tutorials/query-logs-loki/) -- type: tutorial, time: 25m
