---
id: "alerting"
title: "Alerting"
zone: "observability"
edges:
  from:
    - id: "dashboards"
      question: "My dashboards show me everything. How do I get woken up when something's actually wrong?"
      detail: "You can't watch dashboards 24/7. Alerts do it for you — they evaluate conditions continuously and fire when something breaks a threshold. The hard part isn't the tooling; it's knowing which conditions are worth waking someone up for."
    - id: "sli-slo-error-budgets"
      question: "I have SLOs and error budgets. How do I alert on them?"
      detail: "Alerting on raw metrics (CPU > 80%) generates noise. Alerting on SLO burn rate generates signal: 'you're burning through your error budget 14x faster than normal — act now.' Error-budget burn rate alerts are the most actionable kind."
  to:
    - id: "distributed-tracing"
      question: "An alert fired. I can see something is wrong in the metrics. How do I find out why?"
      detail: "Metrics tell you something is broken. Logs tell you what happened. But in a distributed system with a request hopping across five services, finding the one slow database query causing a latency spike requires traces — a record of exactly where each request spent its time."
    - id: "on-call-and-runbooks"
      question: "Alerts are firing. But who responds? How do they know what to do?"
      detail: "An alert without a responder and a runbook is just noise. On-call rotation, escalation policies, and runbooks are the human side of alerting — they're what turn a fired alert into a resolved incident."
difficulty: 2
tags: ["alerting", "pagerduty", "opsgenie", "prometheus-alertmanager", "on-call", "alert-fatigue"]
category: "practice"
milestones:
  - "Set up alerts on your four golden signals with appropriate thresholds"
  - "Route alerts to a notification channel (Slack, PagerDuty, email)"
  - "Understand the difference between alerting on causes vs symptoms"
  - "Experience and reduce alert fatigue by eliminating noisy, non-actionable alerts"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
