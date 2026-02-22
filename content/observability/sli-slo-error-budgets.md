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
      detail: "SLOs define what you're trying to maintain. Alerting is how you find out you're failing to maintain it — before users notice or before the error budget runs out. Burn-rate alerts on your SLOs are more actionable than threshold alerts on individual metrics."
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
