---
id: symptom-vs-cause-alerting
title: Alert on Symptoms, Not Causes
zone: observability
edges:
  to:
    - id: distributed-tracing
      question: >-
        Alerts are cleaner now. But when one fires I still don't know how to
        find the actual cause. How do I debug across services?
      detail: >-
        I get paged, I see the symptom in the metrics, but I can't tell which
        of my five services is actually responsible. I need a way to follow a
        request through the whole system.
difficulty: 2
tags:
  - alerting
  - symptoms
  - causes
  - slo
  - observability
category: concept
milestones:
  - Understand the difference between symptom-based and cause-based alerts
  - Rewrite one cause-based alert as a symptom-based alert
  - Understand why alerting on user-visible impact reduces false positive rate
  - Know when cause-based alerts are still useful (capacity planning, early warning)
---

When your database CPU spikes to 95%, how many alerts fire? Just the one? Or does the database alert fire, plus an alert for every service that queries the database (because their latency just went up), plus an alert for the cache layer that depends on those services, plus alerts for the background jobs that are now queuing up? If you've ever been paged into a storm of 25 simultaneous alerts that all started within three seconds of each other, you've experienced the cause-based alerting problem.

Cause-based alerts watch internal system state: CPU percentage, disk fill rate, pod restart count, memory usage, queue depth. These are the things engineers tend to reach for first because they're easy to measure and they feel like they should matter. The problem is that one user-facing failure can trigger dozens of these simultaneously — because in a distributed system, one root cause ripples through many components, each of which has its own alert watching its own internal state.

Symptom-based alerts watch user-visible impact instead: error rate, request latency, availability. When your database goes slow, your symptom-based alert fires once — "API error rate is above 1%" — and stays firing until the problem is resolved. The cause could be the database, a network partition, a bad deploy, or something else entirely. The alert doesn't need to know. It just tells you that users are being affected and someone needs to investigate.

<!-- DEEP_DIVE -->

## The Difference in Practice

Here's the same failure scenario — database becomes slow — and how each alerting strategy handles it.

**Cause-based alerting:**

- `DatabaseCPUHigh` fires (database CPU > 80%)
- `APIHighLatency` fires (API p99 > 2s, because it queries the database)
- `CheckoutServiceHighLatency` fires (checkout calls the API)
- `UserServiceDegraded` fires (user service queries the database directly)
- `BackgroundJobQueueDepth` fires (jobs are backing up because they can't write)
- `CacheHitRateLow` fires (cache is expiring and refetches are slow)

Six pages, all at once, all for one root cause. The on-call engineer is now trying to figure out which of these is the actual problem versus which are downstream consequences — while more alerts are potentially still coming.

**Symptom-based alerting:**

- `HighErrorRate` fires (error rate on API service > 1% for 5 minutes)

One page. The alert tells you what users are experiencing. The investigation — checking dashboards, looking at traces, querying metrics — tells you why.

## Writing Symptom-Based Alerts

The signal to alert on is user-visible impact. For most services, that maps directly to the four golden signals.

```yaml
# Symptom-based: users are seeing errors
- alert: HighErrorRate
  expr: |
    rate(http_requests_total{status=~"5.."}[5m])
    / rate(http_requests_total[5m]) > 0.01
  for: 5m
  labels:
    severity: page
  annotations:
    summary: "Error rate above 1% for 5 minutes"
    description: "{{ $value | humanizePercentage }} of requests are failing."

# Symptom-based: users are experiencing slowness
- alert: HighLatency
  expr: |
    histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
  labels:
    severity: page
  annotations:
    summary: "p99 latency above 2 seconds for 5 minutes"
    description: "99th percentile latency is {{ $value }}s."
```

Notice what these alerts don't mention: they don't say anything about CPU, memory, database, or any other internal component. They describe what the user is experiencing. That's the key property of a good symptom-based alert.

## When Cause-Based Alerts Are Still Useful

Symptom-based alerting doesn't mean you stop watching internal metrics. It means you separate them into two categories with different destinations.

**Page on symptoms.** These require immediate human attention because a user is being affected right now.

**Ticket on causes.** These are early warning signals that something is drifting toward a problem, but users aren't feeling it yet.

Cause-based alerts that belong as tickets:

```yaml
# Disk filling up — users aren't affected yet, but they will be
- alert: DiskFilling
  expr: |
    predict_linear(node_filesystem_avail_bytes[6h], 24 * 3600) < 0
  for: 30m
  labels:
    severity: ticket
  annotations:
    summary: "Disk predicted to fill within 24 hours"

# High memory — not a user problem yet, but a precursor to one
- alert: HighMemoryUsage
  expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1
  for: 15m
  labels:
    severity: ticket
  annotations:
    summary: "Less than 10% memory available"
```

The rule is: **page on symptoms, ticket on causes.** Cause-based alerts are genuinely useful for capacity planning and early warning — they just shouldn't wake someone up.

## The Noise Reduction Effect

Beyond reducing the number of simultaneous pages during an incident, symptom-based alerts have a lower false positive rate for a structural reason: they require the problem to be visible to users before they fire.

CPU at 90% might or might not mean users are experiencing problems — CPUs spike all the time for legitimate reasons. But an error rate above 1% for five sustained minutes almost always means something real is wrong. The `for:` duration further filters out transient spikes. By the time the alert fires, you have high confidence that a human actually needs to look at it.

This is why symptom-based alerting and low alert fatigue tend to go together. When your alerts are anchored to user impact, the false positive rate drops dramatically, and the team starts trusting pages again.

## The Translation

If you're looking at an existing cause-based alert and trying to convert it, ask: what would a user experience if this internal condition got bad enough to matter?

| Cause-based alert | Symptom-based equivalent |
|---|---|
| Database CPU > 80% | API error rate > 1% OR API latency > 2s |
| Pod restarted | Service error rate elevated (crash-looping shows up here) |
| Queue depth > 10,000 | Job processing latency > 60s OR job failure rate elevated |
| Memory usage > 90% | Service returning 502s (OOM kills show up here) |
| Disk usage > 80% | Disk fill rate: ticket-level alert only |

The left column measures internal state. The right column measures user impact. For pages, you want the right column.

<!-- RESOURCES -->

- [My Philosophy on Alerting (Rob Ewaschuk, Google)](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit) -- type: article, time: 20m
- [Alerting on What Matters (Prometheus docs)](https://prometheus.io/docs/practices/alerting/) -- type: article, time: 15m
- [The Four Golden Signals (Google SRE Book)](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals) -- type: article, time: 15m
- [SLOs, SLAs, and Error Budgets (Google SRE Book)](https://sre.google/sre-book/service-level-objectives/) -- type: article, time: 20m
- [Symptoms vs Causes in Alerting (Grafana blog)](https://grafana.com/blog/2023/05/30/the-right-and-wrong-way-to-alert/) -- type: article, time: 10m
