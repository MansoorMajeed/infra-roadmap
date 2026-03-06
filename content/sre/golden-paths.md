---
id: golden-paths
title: Golden Paths and Templates
zone: sre
edges:
  to:
    - id: production-readiness
      question: >-
        Golden paths make it easy to start correctly. How do I ensure services
        stay correct as they evolve?
      detail: >-
        Golden paths set you up right at day zero. Production readiness reviews
        and service maturity models enforce standards at launch and as services
        grow. Together, they're the carrot (easy to do the right thing) and the
        stick (can't ship without meeting the bar).
difficulty: 2
tags:
  - golden-paths
  - templates
  - scaffolding
  - developer-experience
  - platform-engineering
  - backstage
category: practice
milestones:
  - Identify the golden path for creating a new service in your organisation
  - 'Build or adopt a service template with CI/CD, logging, and metrics pre-wired'
  - 'Measure adoption: what percentage of new services follow the golden path?'
  - Understand the tension between opinionated defaults and team autonomy
---

A golden path is the paved road through your infrastructure — the set of defaults, templates, and workflows that let a developer create a new service correctly without having to figure out CI/CD, observability, secrets management, and Kubernetes configuration from scratch. The term comes from the idea of the "path of least resistance": if you make the right way to do something easy, most people will do it the right way. Golden paths are how platform teams scale their influence across the entire engineering organization.

<!-- DEEP_DIVE -->

## The problem golden paths solve

Without golden paths, every team builds from scratch. Team A sets up CI/CD using their own YAML. Team B copies what they remember from a previous job. Team C asks someone from Team A to help them. Three months later: three different CI/CD configurations, three different approaches to secrets management, three different log formats, three different alert setups — none of them talking to each other in a unified dashboard.

The platform team can't maintain consistency by reviewing every team's work. They don't have the capacity. Golden paths are the alternative: build the infrastructure once, package it into a template, and let every team benefit from it.

## What a golden path includes

A good golden path gives you, for the price of filling out a form or running a CLI command:

**A repository structure**: with the right directory layout, README template, `.gitignore`, and initial code structure for your organization's primary language.

**CI/CD pipeline**: pre-configured to run tests, build a container image, scan for vulnerabilities, and deploy through your organization's deployment process. Developers don't write CI/CD — they get it.

**Observability wiring**: the application sends metrics to Prometheus (or Datadog, or CloudWatch), logs in structured JSON to the central logging system, and traces are collected by the tracing agent. This is wired in at the framework level — developers get it without configuring it.

**A Kubernetes deployment manifest**: with sensible defaults for resource limits, liveness and readiness probes, and pod disruption budgets. Developers adjust the values; they don't build the structure.

**Secrets management integration**: the service is pre-wired to read secrets from Vault (or AWS Secrets Manager, or GCP Secret Manager). Developers don't write the integration code.

**An SLO dashboard**: pre-built for the service's standard SLIs, visible in the catalog from day one.

## Opinionated defaults vs flexibility

Golden paths are opinionated. They make choices — which logging library, which tracing framework, which Kubernetes patterns — so that developers don't have to. This is both the value and the tension.

Teams that want to deviate from the golden path should be able to, but they should have to make an active choice to do so. The default is the path. The path is optimized for the platform team's ability to support it, not for maximum flexibility. A service that's on the golden path can be debugged, monitored, and operated by anyone. A service that's custom all the way down can only be operated by the people who built it.

## Measuring adoption

A golden path that nobody uses hasn't solved anything. Track adoption explicitly:
- What percentage of new services are created using the golden path template?
- What's the time-to-first-deployment for new services on the path vs off it?
- How many support tickets do teams that use the path generate vs teams that don't?

When a team goes off-path and struggles, understand why. Sometimes the golden path is missing a capability that teams need. Sometimes the path is poorly documented. Sometimes the team has a legitimate specialized requirement. The feedback loop between teams and the golden path improves the path.

<!-- RESOURCES -->

- [Spotify's Engineering Blog on Golden Paths](https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/) -- type: article, time: 15m
- [Backstage Software Templates](https://backstage.io/docs/features/software-templates/) -- type: tool, time: 30m
- [Platform Engineering on Kubernetes - O'Reilly](https://www.oreilly.com/library/view/platform-engineering-on/9781617299322/) -- type: book, time: varies
