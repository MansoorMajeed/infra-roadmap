---
id: "you-cant-debug-what-you-cant-see"
title: "You Can't Debug What You Can't See"
zone: "observability"
edges:
  from:
    - id: "gitops-with-argocd"
      zone: "kubernetes"
      question: "My cluster is running and deployments are automated with GitOps. How do I know if everything is actually healthy?"
      detail: "You can deploy to Kubernetes with confidence. But 'deployed' and 'healthy' are different things. A rollout can succeed while a memory leak quietly grows, an error rate ticks up, or a downstream dependency starts timing out. Observability is how you find out before your users do."
  to:
    - id: "structured-logging"
      question: "What's the first thing I should instrument?"
      detail: "Logs are the most immediate signal — every application already produces them. But raw text logs from dozens of servers are nearly impossible to search or correlate. Structured logging is the foundation: machine-readable logs you can query, filter, and connect across services."
difficulty: 1
tags: ["observability", "logging", "metrics", "tracing", "three-pillars", "debugging"]
category: "concept"
milestones:
  - "Explain the three pillars of observability: logs, metrics, and traces"
  - "Describe what each pillar answers: what happened, how is it performing, why is it slow"
  - "Understand why you need all three — no single signal tells the full story"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
