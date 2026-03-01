---
id: alerting
title: Alerting
zone: observability
edges:
  to:
    - id: alert-fatigue
      question: >-
        My phone is buzzing every 10 minutes with alerts. My team has started
        ignoring them. How do I fix this?
      detail: >-
        We have so many alerts that when a real problem happens nobody is sure
        which one to look at first. Half the time someone silences their pager
        just to get some sleep. I know this is bad but I don't know how to
        actually reduce it without missing real incidents.
    - id: symptom-vs-cause-alerting
      question: >-
        When one thing breaks I get 30 alerts firing at once. I can't tell
        which is the real problem and which are just downstream symptoms.
      detail: >-
        The database goes slow and I get alerts for the database, all five
        services talking to it, the cache that depends on it, and the jobs that
        are backing up. I'm trying to debug through a storm of alerts that all
        started at the same second.
    - id: distributed-tracing
      question: >-
        An alert fired. I can see something is wrong in the metrics. How do I
        find out why?
      detail: >-
        I know something is broken but I can't tell where. My service is slow
        but it calls four other services. The metrics show a spike but not
        which hop in the chain is the problem. I feel like I need a map of what
        actually happened to a specific request.
difficulty: 2
tags:
  - alerting
  - pagerduty
  - opsgenie
  - prometheus-alertmanager
  - on-call
  - alert-fatigue
category: practice
milestones:
  - Set up alerts on your four golden signals with appropriate thresholds
  - 'Route alerts to a notification channel (Slack, PagerDuty, email)'
  - Understand the difference between alerting on causes vs symptoms
  - >-
    Experience and reduce alert fatigue by eliminating noisy, non-actionable
    alerts
---

A dashboard you don't watch catches nothing. Alerting is what transforms passive monitoring into an active system — it's the layer that notices something is wrong and comes to find you. Without it, every incident starts the same way: someone happened to look at the dashboard, or a user complained. With it, you know before the user does.

In the Prometheus ecosystem, alerting is handled by two components working together. Prometheus evaluates your alert rules on a schedule and fires alerts when conditions are met. Alertmanager receives those fired alerts and handles the delivery — routing them to the right team, deduplicating noisy bursts, grouping related alerts together, and sending them to Slack, PagerDuty, email, or wherever your team responds. You define the conditions in Prometheus; you define the routing and delivery in Alertmanager.

The difference between alerting that helps and alerting that hurts is almost entirely about quality, not quantity. An alert that fires when nothing actionable needs to happen is worse than no alert at all — it trains your team to ignore pages, and eventually a real incident gets missed in the noise. The goal is for every alert to demand a human decision, not just an acknowledgement.

<!-- DEEP_DIVE -->

## Prometheus Alert Rules

Alert rules live in YAML files that Prometheus loads (you reference them in `prometheus.yml` under `rule_files`). Each rule has a PromQL expression that evaluates to true or false, and when it's true for long enough, Prometheus fires the alert.

Here's a complete example — an alert that fires when the error rate on an HTTP service exceeds 1% for five minutes:

```yaml
groups:
  - name: api-service
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{job="api", status=~"5.."}[5m])
          /
          rate(http_requests_total{job="api"}[5m])
          > 0.01
        for: 5m
        labels:
          severity: page
          team: backend
        annotations:
          summary: "High error rate on API service"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."
          runbook: "https://wiki.example.com/runbooks/high-error-rate"
```

The key fields:

- **`expr`** — the PromQL condition. When this evaluates to true, the alert is pending. When it's been true for `for:` duration, it fires.
- **`for`** — how long the condition must hold before the alert fires. This is how you avoid flapping. Without `for:`, a single spike fires and resolves an alert in seconds. With `for: 5m`, you only get paged for sustained problems.
- **`labels`** — metadata that Alertmanager uses for routing. Severity and team are the most common.
- **`annotations`** — human-readable text sent with the alert. The `summary` is a one-line description of what happened. The `description` gives more context and can use template variables like `{{ $value }}` to include the actual metric value. The `runbook` link tells the person who gets paged exactly where to look.

## What Makes a Good Alert

A well-written alert has five properties:

1. **A clear name** that describes the condition, not the metric. `HighErrorRate` not `HttpRequestsTotalFiring`.
2. **Appropriate severity** so the routing and response can scale with urgency.
3. **A summary** that tells you what happened in one sentence.
4. **A description** that tells you what to check first, ideally with the actual value included.
5. **A runbook link** that takes the responder directly to documented steps.

The runbook is the most underrated part. When you're woken at 3am, you don't want to reconstruct from memory what this alert means and what to do about it. The runbook is the answer to "what do I actually do when this fires?"

## Severity Levels: Page vs Ticket vs Info

Not every problem should wake someone up. Calibrating severity is one of the most important things you'll do when setting up alerting.

**Page** (wake someone up, interrupt whatever they're doing): user-facing impact is happening right now. Error rate elevated. p99 latency above SLO. Service returning 503s. Something a user would notice in the next five minutes if left alone.

**Ticket** (address during business hours): something is wrong but not immediately user-facing. Disk at 70% and filling. A non-critical background job is failing. A replica is behind but the primary is fine. These should create tickets automatically, not pages.

**Info / warning**: trends worth knowing about. Traffic dropped 20% from yesterday's baseline. A certificate expires in 30 days. These go to a Slack channel someone checks during the day, not to anyone's phone.

The question to ask for any alert: if this fires at 3am, is it worth waking someone up? If the honest answer is "probably not," make it a ticket.

## Alertmanager: Routing and Delivery

Alertmanager receives fired alerts from Prometheus and decides what to do with them. Its main jobs are routing (which team gets this alert?), grouping (bundle related alerts into one notification), and inhibition (suppress downstream alerts when a higher-level one fires).

A basic Alertmanager config:

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/...'

route:
  receiver: slack-general
  group_by: [alertname, job]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: page
      receiver: pagerduty-backend
    - match:
        severity: ticket
      receiver: slack-tickets

receivers:
  - name: slack-general
    slack_configs:
      - channel: '#alerts'

  - name: pagerduty-backend
    pagerduty_configs:
      - service_key: '<key>'

  - name: slack-tickets
    slack_configs:
      - channel: '#ops-tickets'
```

The `route` block is a tree. Alertmanager walks the tree for each incoming alert, matching against labels, and sends it to the first matching receiver. `group_by` controls which alerts are bundled into one notification — if 20 alerts fire at once with the same `alertname` and `job`, they arrive as one message rather than 20.

`group_wait` (how long to wait before sending the first notification for a new group) and `repeat_interval` (how long before re-notifying if an alert is still firing) are important to tune so you don't get spammed but also don't miss that something is still broken hours later.

## A Starting Set of Alerts

If you're not sure where to start, write alerts for the four golden signals first:

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
  for: 5m
  labels:
    severity: page

- alert: HighLatency
  expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
  labels:
    severity: page

- alert: LowTraffic
  expr: rate(http_requests_total[10m]) < 10
  for: 10m
  labels:
    severity: ticket

- alert: HighSaturation
  expr: 1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) > 0.9
  for: 10m
  labels:
    severity: ticket
```

Start here. Add more only when you discover through real incidents that you're missing something. The most common mistake is adding alerts before you understand what normal looks like.

<!-- RESOURCES -->

- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) -- type: article, time: 20m
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/) -- type: article, time: 20m
- [My Philosophy on Alerting (Rob Ewaschuk, Google)](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit) -- type: article, time: 20m
- [Alerting on What Matters (Prometheus docs)](https://prometheus.io/docs/practices/alerting/) -- type: article, time: 15m
- [PagerDuty Incident Response Guide](https://response.pagerduty.com/) -- type: article, time: 30m
