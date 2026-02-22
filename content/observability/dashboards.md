---
id: "dashboards"
title: "Dashboards and Grafana"
zone: "observability"
edges:
  from:
    - id: "metrics-and-monitoring"
      question: "I'm collecting metrics. How do I turn them into something I can actually look at?"
      detail: "Raw metric data in Prometheus or CloudWatch is queryable but not readable at a glance. Grafana turns metric queries into panels, panels into dashboards, and dashboards into a shared view of system health that your whole team can use."
  to:
    - id: "alerting"
      question: "My dashboards look great. But I can't stare at them 24/7. How do I get notified when something's wrong?"
      detail: "Dashboards require someone to look at them. Alerts are dashboards that look at themselves — they evaluate conditions continuously and notify you when something breaks. Good dashboards and good alerts go together: the dashboard helps you diagnose, the alert tells you to look."
difficulty: 1
tags: ["grafana", "dashboards", "visualisation", "prometheus", "cloudwatch", "observability"]
category: "practice"
milestones:
  - "Set up Grafana connected to your metrics source (Prometheus or CloudWatch)"
  - "Build a service dashboard showing the four golden signals"
  - "Understand when to use a time series panel vs a stat panel vs a table"
  - "Know what makes a dashboard useful vs noisy"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
