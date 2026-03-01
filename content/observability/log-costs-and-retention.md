---
id: log-costs-and-retention
title: Log Costs and Retention
zone: observability
edges:
  to:
    - id: metrics-and-monitoring
      question: >-
        Log costs are under control now. But I still can't answer "is my
        service healthy right now" without querying and counting. What's the
        right tool for that?
      detail: >-
        I've pruned the noisy logs and set up retention policies so I'm not
        storing everything forever. But even with clean logs, I'm still
        reaching for metrics every time I want a real-time answer about
        performance. Logs and metrics feel like they answer different questions.
difficulty: 2
tags:
  - logging
  - cost
  - retention
  - sampling
  - observability
category: practice
milestones:
  - Set up log retention policies so you're not paying to store logs you never query
  - Understand the difference between sampling, filtering, and dropping logs
  - Identify which log streams are high-volume and low-value
  - Implement log-level filtering at the agent level to reduce ingestion volume
---

Logs are one of the easiest infrastructure costs to let spiral out of control. The problem is that logging feels free at first — you add a library, set it to INFO, ship everything to CloudWatch or Loki, and move on. Then three months later you look at your bill and half of it is log ingestion and storage. You're storing 90 days of every debug message from every service, most of which you've never queried and never will.

The core tension is that comprehensive logs have real value for debugging, and cheap logs mean less visibility. Every cost-cutting measure in logging is a tradeoff between money saved and information you might not have when you need it. The goal isn't to log as little as possible — it's to log the right things, keep them for the right duration, and drop the rest.

The good news is that the highest-value logs (errors, warnings, important business events) are also low volume. The high-volume stuff (debug output, health checks, routine request logs) is where most of the cost lives, and most of it has very low value after 24–48 hours. Once you understand that asymmetry, the strategy becomes obvious: keep the expensive-to-lose logs longer, drop or sample the cheap-to-lose logs aggressively.

<!-- DEEP_DIVE -->

## What drives log costs

Log costs come from three places:

**Ingestion volume** — how many bytes per second you're shipping to the log store. This is the most direct cost lever. Every byte you ship gets charged for. Managed services like CloudWatch Logs charge around $0.50–$1.00 per GB ingested. A busy service emitting verbose DEBUG logs can generate gigabytes per hour easily.

**Storage duration** — how long you keep logs before they expire. If you keep 90 days of logs, you're paying for 90 days of storage. Most log stores charge per GB-month. If your ingestion rate is 100 GB/day and you keep 90 days, you're storing 9,000 GB at any given time. At $0.03/GB/month that's $270/month just for storage, on top of ingestion.

**Query costs** — some systems (notably CloudWatch Logs Insights) charge per GB scanned when you run a query. The bigger and longer your log data, the more expensive every query becomes. This creates an incentive to keep less data — but it also means you should be specific in your queries rather than scanning everything.

## The main cost reduction strategies

### Filter at the agent, before ingestion

The most effective cost reduction is to drop logs before they ever reach the central store. If a log line is never ingested, it's never charged for. Fluent Bit and Fluentd both support filter rules that can drop lines matching certain criteria.

**Drop DEBUG logs before shipping:**

In Fluent Bit, you can drop lines based on field values:
```ini
[FILTER]
    Name   grep
    Match  *
    Exclude level debug
```

This drops any log line where the `level` field equals "debug" before it's forwarded to the log store. Your applications can still emit debug logs (useful for local development), but they'll never reach the central store in production.

**Drop noisy health check logs:**

Load balancers and Kubernetes liveness probes typically hit a `/health` or `/ping` endpoint every 10 seconds. At scale, this generates tens of thousands of 200 OK log lines per hour. They're never interesting.

```ini
[FILTER]
    Name   grep
    Match  *
    Exclude path /health
```

**Drop logs from verbose third-party libraries:**

Many libraries emit detailed debug output that you can't control at the application level. Filter them out at the agent:
```ini
[FILTER]
    Name   grep
    Match  *
    Exclude logger_name "com.amazonaws.http.AmazonHttpClient"
```

### Sampling high-volume low-value streams

Sampling means: instead of shipping every log line, ship 1 in N. For streams that are high volume but low value — like successful routine requests — sampling lets you keep a representative sample without the full cost.

The key principle: never sample errors. Errors are low volume and high value. You want every error. Sampling makes sense for the high-volume streams: successful INFO logs from very busy endpoints, health check confirmations, routine database query logs.

Fluent Bit doesn't have native probabilistic sampling, but you can implement it with a Lua filter:

```ini
[FILTER]
    Name    lua
    Match   kube.access-log.*
    script  sampling.lua
    call    sample_logs
```

```lua
-- sampling.lua: keep 10% of access logs
function sample_logs(tag, timestamp, record)
    if math.random() < 0.9 then
        return -1, 0, 0  -- drop
    end
    return 0, timestamp, record  -- keep
end
```

This keeps 10% of access log entries — enough to see patterns and diagnose issues, without the full cost.

### Shorter retention for low-value streams

Not all logs need to be kept for the same duration. The right retention period depends on how likely you are to need a log after a given amount of time.

**Error and WARN logs** — you might need these weeks later when a customer files a support ticket, or when you're trying to understand a pattern. 30–90 days is reasonable.

**INFO logs** — useful for recent incident investigations, rarely needed after more than a week or two. 7–14 days for most workloads.

**Debug logs** — if you're shipping any debug logs at all, they should have very short retention. 1–3 days at most. If you haven't used a debug log line within 48 hours, you're almost certainly never going to.

**Audit logs** — logs related to user actions, access events, security-relevant operations. These often have compliance requirements. 1–7 years depending on your industry and jurisdiction.

In CloudWatch Logs, retention is set per log group:
```bash
aws logs put-retention-policy \
  --log-group-name /app/payment-service/info \
  --retention-in-days 14

aws logs put-retention-policy \
  --log-group-name /app/payment-service/error \
  --retention-in-days 90
```

In Loki, retention is configured at the backend level and can be applied per tenant or per stream selector.

## Identifying where your costs actually come from

Before optimising, find out where the volume is. Most log management systems have a usage page or a query you can run to see which log streams are highest volume.

In CloudWatch:
```sql
-- Top log groups by size (run in Log Insights)
stats sum(bytes) as total_bytes by log_group
| sort total_bytes desc
| limit 20
```

In Loki (via LogQL metric query in Grafana):
```logql
sum by (service) (rate({namespace="production"}[5m]))
```

You'll almost always find that 80% of your log volume comes from 20% of your services — often the ones you think about least. A high-traffic API logging every request at INFO, or a misconfigured service emitting debug output continuously.

## The tradeoffs: what you give up

Every cost reduction is a tradeoff. Be explicit about what you're accepting:

| Action | Cost saved | Visibility lost |
|--------|-----------|----------------|
| Drop DEBUG at agent | High | Can't see internal debug detail after the fact; must add ad-hoc debug logging and redeploy |
| Sample INFO logs | Medium | May miss some specific events; patterns are still visible |
| Reduce INFO retention from 30 to 7 days | Medium | Can't investigate incidents older than 7 days |
| Drop health check logs | Low | Can't query health check patterns, but this is almost never needed |

The goal is to make these tradeoffs deliberately — knowing what you're giving up — rather than accidentally cutting something you'll regret later. ERRORs should almost never be sampled or given short retention. That's the data you actually need when things go wrong.

<!-- RESOURCES -->

- [Controlling AWS CloudWatch Logs Costs (AWS)](https://aws.amazon.com/blogs/mt/best-practices-for-centralizing-logs-with-amazon-cloudwatch-logs/) -- type: article, time: 15m
- [Reducing Loki Log Ingestion Costs (Grafana Labs)](https://grafana.com/docs/loki/latest/operations/storage/retention/) -- type: article, time: 15m
- [Log Sampling Strategies (Datadog)](https://www.datadoghq.com/blog/log-sampling/) -- type: article, time: 10m
- [Fluent Bit Filtering Documentation](https://docs.fluentbit.io/manual/pipeline/filters) -- type: article, time: 20m
