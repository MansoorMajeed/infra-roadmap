---
id: dashboards
title: Dashboards and Grafana
zone: observability
edges:
  to:
    - id: what-makes-a-good-dashboard
      question: >-
        My dashboard has 40 panels and I still can't tell at a glance whether
        the system is healthy. What am I doing wrong?
      detail: >-
        I just kept adding panels whenever I thought of something useful to
        track. Now it's a wall of graphs and during incidents I'm scanning
        through all of them trying to find the one that shows the problem.
        This doesn't feel like it's helping.
    - id: alerting
      question: >-
        My dashboards look great. But I can't stare at them 24/7. How do I get
        notified when something's wrong?
      detail: >-
        Even a good dashboard is useless if nobody is looking at it. We've had
        incidents where the problem was visible the whole time — we just didn't
        happen to have the dashboard open. I need the system to come to me.
difficulty: 1
tags:
  - grafana
  - dashboards
  - visualisation
  - prometheus
  - cloudwatch
  - observability
category: practice
milestones:
  - Set up Grafana connected to your metrics source (Prometheus or CloudWatch)
  - Build a service dashboard showing the four golden signals
  - Understand when to use a time series panel vs a stat panel vs a table
  - Know what makes a dashboard useful vs noisy
---

Once you have metrics flowing into Prometheus (or CloudWatch, or any other backend), you need a way to look at them. That's where Grafana comes in. Grafana is the de facto standard for visualizing time-series metrics — it's open source, it connects to almost any data source, and it gives you a flexible panel-based canvas for building dashboards. Most teams running Prometheus use Grafana alongside it almost automatically.

A dashboard is just a collection of panels, each one running a query and rendering the result as a chart, number, or table. The value isn't in having a lot of panels — it's in having the right ones. A well-built dashboard lets you answer "is this service healthy right now?" in a few seconds, without scrolling or hunting. That's the bar to aim for.

The four golden signals — latency, traffic, errors, and saturation — are the foundation every service dashboard should start from. They were coined by Google's SRE book and they hold up because they represent the four things users actually feel. If those four signals look healthy, your service is almost certainly healthy. If one of them looks wrong, you know exactly which dimension to investigate.

<!-- DEEP_DIVE -->

## Connecting Grafana to Prometheus

After installing Grafana (it runs as a standalone server, usually on port 3000), the first thing you do is add a data source. Go to **Configuration → Data Sources → Add data source**, choose Prometheus, and point it at your Prometheus URL (e.g. `http://localhost:9090`). Grafana will test the connection and confirm it can reach Prometheus.

From that point on, every panel you create can run PromQL queries and render the results. You write the query, Grafana handles the visualization.

## Panel Types

Grafana has many panel types but you'll use four of them the vast majority of the time.

**Time series** is the standard line chart. Use it for anything that changes over time and where you care about the shape of the curve — request rate, latency percentiles, error count, CPU usage. This should be your default.

**Stat** shows a single current value, big and readable. Use it for things where the current state matters more than the history — current error rate, number of active connections, uptime. You can add color thresholds so the number turns red when it exceeds a limit.

**Gauge** is a visual fill indicator, like a fuel gauge. Use it for saturation metrics where "how full is this?" is the right mental model — disk usage percentage, memory utilization, connection pool saturation. Avoid it for metrics that can spike suddenly; the animated fill is misleading for fast-changing values.

**Table** shows multiple time series as rows with columns for different computed values (last, average, max). Use it when you want a breakdown by label — request rate per service, error count per endpoint, latency by region. Tables are great for comparing across many instances at once.

## The Four Golden Signals

Every service dashboard should start with these four panels before you add anything else.

| Signal | What it measures | Example PromQL |
|---|---|---|
| Latency | How long requests take | `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` |
| Traffic | How many requests you're handling | `rate(http_requests_total[5m])` |
| Errors | What fraction of requests are failing | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])` |
| Saturation | How full your system is | `1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))` |

If latency is high, users are experiencing slowness. If traffic dropped suddenly, something may have broken upstream (or you're no longer receiving requests for some other reason). If errors are elevated, users are seeing failures. If saturation is high, you're approaching a limit and things will get worse. These four signals cover most of what goes wrong with a service.

## Dashboard Variables

Static dashboards that only show one service or one environment get old fast. Grafana's variable system lets you add drop-downs at the top of a dashboard so you can filter all panels at once.

In **Dashboard Settings → Variables**, you can define a variable like `$service` that queries Prometheus for all label values: `label_values(http_requests_total, service)`. Grafana populates the drop-down automatically. Then in your panel queries you use `{service="$service"}` and every panel updates when you pick a different service from the drop-down.

Common variables to add:

- `$service` — filter by service name
- `$env` — filter by environment (production, staging)
- `$instance` — filter by individual host or pod
- `$interval` — control the step size for rate calculations

Variables are what transform a single hardcoded dashboard into something your whole team can use across every service.

## A Practical Starting Template

When building a new service dashboard, start with this layout:

1. A row of three stat panels at the top: current request rate, current error rate, p99 latency. These give instant status at a glance.
2. Below that, a time series panel for each golden signal — traffic, errors, latency (p50, p95, p99 on the same chart), and saturation.
3. Add variables for service and environment.
4. Stop there until you have a reason to add more.

Resist the urge to add more panels "just in case." A dashboard with six well-chosen panels that answer one clear question is more valuable than forty panels that might theoretically be useful. You can always add more later when you discover you actually need them during an incident.

<!-- RESOURCES -->

- [Grafana Dashboards Getting Started](https://grafana.com/docs/grafana/latest/getting-started/build-first-dashboard/) -- type: tutorial, time: 20m
- [The Four Golden Signals (Google SRE Book)](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals) -- type: article, time: 15m
- [Grafana Dashboard Variables](https://grafana.com/docs/grafana/latest/dashboards/variables/) -- type: article, time: 15m
- [Grafana Panel Types Overview](https://grafana.com/docs/grafana/latest/panels-visualizations/) -- type: article, time: 10m
- [Practical Monitoring (O'Reilly)](https://www.oreilly.com/library/view/practical-monitoring/9781491957349/) -- type: book, time: 300m
