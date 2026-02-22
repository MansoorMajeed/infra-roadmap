---
id: "platform-engineering"
title: "Platform Engineering"
zone: "platform"
edges:
  from:
    - id: "capacity-planning"
      question: "The reliability foundation is solid. How do I make it accessible to the whole engineering org?"
      detail: "Reliability engineering keeps your systems up. Platform engineering keeps your engineers productive. When every team has to learn Kubernetes, wire up their own CI/CD, manage their own secrets, and provision their own databases, most of their time is spent on undifferentiated infrastructure work — not the product."
  to:
    - id: "production-readiness"
      question: "I'm building an internal platform. How do I ensure every service that ships on it is actually ready for production?"
      detail: "A platform lowers the barrier to deployment. That's also a risk: teams can ship things faster than they can ship them well. Production readiness reviews, service maturity models, and launch checklists are how you maintain standards without being a bottleneck."
    - id: "golden-paths"
      question: "How do I actually build the standardised workflows and templates that make the platform useful?"
      detail: "A platform without golden paths is just documentation and goodwill. Golden paths are opinionated, supported, end-to-end workflows: clone this template, run this command, get a service with CI/CD, observability, secrets management, and a load balancer already wired up."
difficulty: 2
tags: ["platform-engineering", "idp", "internal-developer-platform", "developer-experience", "self-service", "dx"]
category: "concept"
milestones:
  - "Explain the difference between a platform team and a traditional ops/infra team"
  - "Identify the top three things your engineers repeatedly set up from scratch"
  - "Understand what an Internal Developer Platform (IDP) is and what Backstage provides"
  - "Describe why the platform should be treated as a product with internal customers"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
