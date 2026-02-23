---
id: "sli-slo-error-budgets"
title: "SLIs, SLOs, and Error Budgets"
zone: "observability"
edges:
  from:
    - id: "metrics-and-monitoring"
      question: "I have metrics. But how do I define what 'healthy' actually means?"
      detail: "Collecting metrics is table stakes. The hard question is: what level of reliability is acceptable? SLIs measure what users experience. SLOs set a target for that experience. Error budgets tell you how much room you have left to take risks — and when to stop shipping features and focus on stability."
  to:
    - id: "alerting"
      question: "I know what I'm measuring and what my targets are. How do I get paged when I'm breaching them?"
      detail: "I've defined my SLOs but right now I'm just manually checking dashboards to see if I'm on track. I need to be notified automatically when things are going wrong — not find out hours later by staring at a graph."
difficulty: 2
tags: ["sli", "slo", "sla", "error-budget", "reliability", "site-reliability-engineering"]
category: "concept"
milestones:
  - "Define an SLI for your service (e.g. 'the fraction of requests completing in under 500ms')"
  - "Set an SLO for that SLI (e.g. '99% of requests over a 30-day window')"
  - "Calculate your error budget from the SLO"
  - "Understand the difference between an SLI, SLO, and SLA"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
