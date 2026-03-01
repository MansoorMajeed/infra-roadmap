---
id: what-makes-a-good-dashboard
title: What Makes a Good Dashboard
zone: observability
edges:
  to:
    - id: alerting
      question: >-
        My dashboards are clean now. But I still need someone to be watching
        them to catch a problem. How do I make the system tell me?
      detail: >-
        Even a perfect dashboard is useless if nobody is looking at it. We've
        had incidents where the problem was visible in the dashboard the whole
        time — we just didn't happen to have it open. I need the system to come
        to me when something is wrong, not the other way around.
difficulty: 1
tags:
  - dashboards
  - grafana
  - observability
  - golden-signals
  - visualisation
category: practice
milestones:
  - Build a service dashboard that answers "is this healthy?" in under 5 seconds
  - Understand the four golden signals and why they belong on every service dashboard
  - Know when to use time series vs stat panels vs tables
  - Identify and remove panels that look useful but don't drive decisions
---

Most dashboards get built the same way: someone opens Grafana, starts adding panels, and doesn't stop until they feel covered. The result is a 40-panel wall of graphs that's technically comprehensive and practically useless. During an incident, you're scanning through it hoping something jumps out. That's the opposite of what a dashboard should do.

A good dashboard answers a specific question. "Is this service healthy right now?" or "What's happening during this deployment?" are good questions. "Show me everything I might ever want to know about this service" is not. When you start with a question, you know exactly which panels belong and which ones are noise. When you don't, you keep adding panels until it feels like enough — and it never does.

The test for whether a dashboard is good is simple: hand it to someone who didn't build it and hasn't been staring at it all week. Can they tell in five seconds whether things are OK? If they have to scroll, read panel titles carefully, and cross-reference multiple graphs to form an opinion, the dashboard has failed. Good dashboards make the answer obvious.

<!-- DEEP_DIVE -->

## Start With the Four Golden Signals

Before you add any service-specific panels, put the four golden signals on the dashboard: latency, traffic, errors, saturation. These four metrics cover the vast majority of ways a service can fail from a user's perspective. If all four look normal, your service is almost certainly fine. If one looks wrong, you know which dimension to investigate.

Put them at the top where they're the first thing you see. Three stat panels (current error rate, current request rate, current p99 latency) in a row give you an instant status check without reading a single graph. Below those, time series panels for each signal give you the trend and the history.

This structure means someone can open the dashboard, look at the top row, and immediately know whether they need to keep reading. That's the five-second test passing.

## The Five-Second Test

A useful practice before publishing any dashboard: close your eyes, open the dashboard, and time how long it takes to answer your core question. If it takes more than five seconds — if you find yourself reading labels, adjusting time ranges, or hunting through panels — something needs to change.

Common reasons a dashboard fails the five-second test:

- **No visual hierarchy.** Everything is the same size and importance. The most important signals should be the biggest and highest on the page.
- **Too many panels.** When everything is shown, nothing stands out. Ten panels that cover the right things beats forty panels that cover everything.
- **No color thresholds.** If a number is bad, it should look bad. Configure stat panels to turn red above a threshold so bad values are immediately visible without reading the number carefully.
- **Inconsistent time ranges.** If one panel shows the last hour and another shows the last day, you can't visually compare them. Set a dashboard-level default time range and leave it there.

## Organizing Panels

Group related panels together using Grafana rows. A row creates a collapsible section with a label. A typical service dashboard might have:

- **Health** — the four golden signals at a glance
- **Latency** — p50, p95, p99, broken down by endpoint
- **Traffic** — request rate by endpoint, broken down by status code
- **Infrastructure** — CPU, memory, disk for the underlying hosts or pods

This way someone doing a quick health check reads the top section and stops. Someone debugging a latency issue expands the Latency row. The dashboard serves multiple purposes without being overwhelming at first glance.

## Choosing the Right Panel Type

The panel type should match how you think about the metric.

Use a **time series** (line chart) when the shape of the curve matters — you want to see spikes, gradual trends, the moment something changed. Latency percentiles, request rate over time, error count per minute.

Use a **stat panel** (single big number) when the current value is what matters, not the history. The current error rate, current number of connections, whether a health check is passing. Add color thresholds so the number changes color at bad values.

Use a **gauge** when "how full is this?" is the right mental model. Disk usage percentage, memory utilization, connection pool capacity. Good for saturation metrics.

Use a **table** when you want to compare the same metric across many instances at once. Request rate per service, error count per endpoint. Tables let you spot which one is the outlier.

## What to Cut

Every panel on a dashboard has a cost: it takes up space, it adds visual noise, and it gives the eye one more thing to process. Before adding a panel, ask: when would I use this? If the honest answer is "I'd look at it if I happened to notice it looked weird," that's not a panel that should exist on this dashboard — that's a panel that belongs in a separate exploratory dashboard or not at all.

When auditing existing dashboards, look for panels that:

- Show a metric that's never been the deciding factor in an incident
- Show information already visible in a different panel
- Have no threshold or baseline, so you can't tell what "bad" looks like
- Are checked during deployments but never at any other time (move them to a deployment dashboard)

The goal isn't minimalism for its own sake. It's clarity. Every panel that stays should have a clear reason to exist: it's part of the health check, or it's part of debugging a specific known failure mode.

## Annotations for Context

Grafana can overlay deployment markers on your time series charts as vertical lines. These are called annotations. Connect Grafana to your CI/CD pipeline to emit an annotation event every time a deployment happens, and suddenly your time series charts show you exactly when deployments occurred relative to any spike or drop.

This is one of the highest-leverage things you can add to a dashboard. The most common question during an incident is "did this correlate with a deployment?" Annotations answer it instantly without checking multiple systems.

<!-- RESOURCES -->

- [The Four Golden Signals (Google SRE Book)](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals) -- type: article, time: 15m
- [Grafana Best Practices for Dashboards](https://grafana.com/docs/grafana/latest/best-practices/best-practices-for-creating-dashboards/) -- type: article, time: 15m
- [Grafana Annotations](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/) -- type: article, time: 10m
- [Practical Monitoring (O'Reilly)](https://www.oreilly.com/library/view/practical-monitoring/9781491957349/) -- type: book, time: 300m
- [How to Design Useful Dashboards (Grafana Labs blog)](https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-might-need/) -- type: article, time: 15m
