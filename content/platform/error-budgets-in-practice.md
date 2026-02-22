---
id: "error-budgets-in-practice"
title: "Error Budgets in Practice"
zone: "platform"
edges:
  from:
    - id: "toil-and-automation"
      question: "Toil is under control. How do I use error budgets to make reliability decisions?"
      detail: "You learned SLOs and error budgets in the observability zone as a measurement concept. Here they become a policy tool: the error budget determines whether engineering velocity is allowed to continue or whether reliability work must take priority. It transforms a subjective argument into a data-driven decision."
    - id: "on-call-health"
      question: "On-call is sustainable. How does the error budget connect to our velocity decisions?"
      detail: "Sustainable on-call reduces the firefighting. Error budget policy prevents it from starting: when the budget is healthy, ship freely. When the budget is burning, stop new features and fix the underlying reliability issues. It's the mechanism that keeps reliability and velocity in balance."
  to:
    - id: "incident-management"
      question: "The error budget is burning. Something is seriously wrong. How do I manage a major incident?"
      detail: "Error budgets tell you when you have a reliability crisis. Incident management is how you resolve it: a structured process with defined roles, communication protocols, and a feedback loop that prevents the same incident from happening twice."
difficulty: 2
tags: ["error-budget", "slo", "sre", "reliability", "feature-velocity", "policy"]
category: "practice"
milestones:
  - "Write an error budget policy document for a service"
  - "Define what happens at 75%, 50%, and 0% remaining budget"
  - "Run an error budget review meeting with your team"
  - "Understand why the error budget belongs to the product team, not just SRE"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
