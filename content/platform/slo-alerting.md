---
id: slo-alerting
title: SLO-Based Alerting
zone: platform
edges:
  to:
    - id: incident-roles
      question: >-
        The alert fired and it's real — the SLO is burning fast. Now what? I've
        got six people in a chat thread and nobody knows who's in charge.
      detail: >-
        I've been in incidents where everyone's talking at once, multiple people
        are making changes simultaneously, and nobody knows the current status.
        It's chaos on top of chaos. There has to be a better way to organise
        the response when things go wrong.
difficulty: 3
tags:
  - slo
  - alerting
  - burn-rate
  - sre
  - multi-window
  - prometheus
category: practice
milestones:
  - Explain why threshold alerts on raw metrics cause alert fatigue
  - Define what a burn rate is and how it differs from a raw error rate
  - Implement a multi-window burn rate alert for a service
  - Understand the tradeoff between fast burn (precision) and slow burn (coverage) alerts
---

Traditional alerting pages you when something is obviously broken — error rate above 5%, latency above 1 second. The problem: by the time a threshold alert fires, you've often already burned a significant chunk of your error budget. SLO-based alerting flips the model: instead of alerting on raw metrics, you alert on the rate at which you're consuming budget. The goal is to page you when there's still time to act, not just to tell you the damage has already happened.

<!-- DEEP_DIVE -->

## Why threshold alerts are insufficient for SLOs

A 5% error rate threshold doesn't discriminate between a 5% error rate for 2 minutes (a small blip) and a 5% error rate for 6 hours (a major incident burning through your monthly budget). Both fire the same alert. You can't prioritize between them without manually looking at how long the condition has persisted.

Worse, a 0.2% error rate that persists for 30 days will consume your entire monthly budget without ever triggering a 5% alert. The threshold-based alert misses the slow burn entirely.

## Burn rate: the right signal

The burn rate is how fast you're consuming your error budget relative to the rate that would exhaust it exactly at the end of the window.

If your error budget allows 0.1% failures over 30 days, a burn rate of 1x means you're consuming budget at exactly the right rate — you'll use up exactly 100% by day 30. A burn rate of 2x means you're consuming twice as fast — you'll exhaust the budget in 15 days. A burn rate of 10x means you'll exhaust it in 3 days.

The alerting logic becomes: alert when burn rate is high enough that, if sustained, you'll exhaust your budget before you can recover.

## Multi-window alerting: fast and slow

The canonical SLO alerting approach (from the Google SRE Workbook) uses two detection windows for each alert:

**Short window (1 hour)**: Catches fast burns. If you're burning at 14x your budget in the last hour, that's a critical incident — page immediately. This is precise but can have false positives from short spikes.

**Long window (6 hours)**: Confirms sustained burns. Cross-checking the short window against the long window reduces false positives while still catching real incidents before too much budget is consumed.

A full alerting setup has multiple tiers:

| Burn rate | Window | Severity | Budget consumed if sustained |
|-----------|--------|----------|------------------------------|
| 14.4x | 1h | Critical | 100% in 2 days |
| 6x | 6h | High | 100% in 5 days |
| 3x | 24h | Medium | 100% in 10 days |
| 1x | 3 days | Low/ticket | Budget on pace to exhaust |

## Implementation in practice

In Prometheus/Alertmanager, a burn rate alert looks roughly like:

```yaml
alert: HighErrorBudgetBurnRate
expr: |
  (
    sum(rate(http_requests_total{status=~"5.."}[1h]))
    /
    sum(rate(http_requests_total[1h]))
  ) > (14.4 * 0.001)
for: 2m
labels:
  severity: critical
```

The threshold `14.4 * 0.001` means: 14.4x burn rate on a 0.1% error budget. Adjust for your actual SLO target.

Many observability platforms (Datadog, Grafana Cloud, Google Cloud Operations) now have first-class SLO alerting that handles this math for you — you define the SLI and the SLO, and the platform manages the burn rate calculation.

<!-- RESOURCES -->

- [Alerting on SLOs - Google SRE Workbook](https://sre.google/workbook/alerting-on-slos/) -- type: book, time: 45m
- [Prometheus SLO alerting rules - Sloth](https://sloth.dev/) -- type: tool, time: 30m
- [SLO Burn Rate Alerts - Datadog Blog](https://www.datadoghq.com/blog/burn-rate-slo-alerts/) -- type: article, time: 15m
