---
id: platform-engineering
title: Platform Engineering
zone: platform
edges:
  to:
    - id: golden-paths
      question: >-
        How do I make the right way to build a service the default — not
        something teams have to discover for themselves?
      detail: >-
        Teams are still starting from scratch and making the same mistakes. I
        want something where if you follow the path we've laid out, you
        automatically get CI/CD, observability, secrets management, and a
        proper on-call setup — without having to figure it all out yourself.
    - id: service-ownership
      question: >-
        All these tools are great. But when something breaks at 3am, who's
        actually responsible?
      detail: >-
        We have great tooling now, but when something goes wrong it's still
        unclear whose problem it is. The platform team gets pulled in, the
        product team says it's infra, infra says it's the app. Nobody has clear
        ownership and it slows everything down.
difficulty: 2
tags:
  - platform-engineering
  - idp
  - internal-developer-platform
  - developer-experience
  - self-service
  - dx
category: concept
milestones:
  - >-
    Explain the difference between a platform team and a traditional ops/infra
    team
  - Identify the top three things your engineers repeatedly set up from scratch
  - >-
    Understand what an Internal Developer Platform (IDP) is and what Backstage
    provides
  - >-
    Describe why the platform should be treated as a product with internal
    customers
---

Every time a developer joins your organization, they spend weeks figuring out how to set up CI/CD, how to wire up metrics, how to configure secrets, and how to get a service into production. Every team reinvents the same boilerplate. Every new service has a slightly different observability setup. Platform engineering is the practice of building an Internal Developer Platform — the shared infrastructure, tooling, and workflows that make all of this self-service. The platform team's job is to make the right way to build a service the easy way.

<!-- DEEP_DIVE -->

## The platform team's mandate

A platform team is fundamentally different from a traditional operations or infrastructure team. Traditional infra teams are service teams: developers submit requests, infra teams fulfill them. Platform teams build products: self-service capabilities that developers use without filing tickets.

The platform team's customers are internal developers. Their product is the infrastructure that developers use to build and run services. Like any product, it needs to be designed for its users, measured by adoption and developer satisfaction, and improved continuously.

The shift in mindset: from "we manage infrastructure for teams" to "we build tools that let teams manage their own infrastructure."

## What an IDP provides

An Internal Developer Platform (IDP) is the collection of tools, workflows, and standards that a platform team builds and maintains. It typically includes:

**Service scaffolding**: a way to create a new service that comes pre-configured with CI/CD, logging, metrics, tracing, secrets management, and an on-call setup. Developers don't configure these from scratch — they inherit them by using the service template.

**Self-service environments**: developers can provision staging environments, run integration tests, and deploy to production without needing platform team involvement.

**Deployment workflows**: standardized CI/CD pipelines that handle testing, building container images, security scanning, and deploying to Kubernetes. Developers write code; the pipeline handles everything else.

**Observability out of the box**: metrics, logs, and traces automatically collected and available in a shared dashboard without any developer configuration.

**Secret management**: a standard way to store and access secrets (API keys, database passwords) that's secure, auditable, and doesn't require developers to figure out Vault configuration from scratch.

## Backstage and catalog-based platforms

Backstage (originally developed by Spotify, now CNCF) has become the dominant open-source foundation for IDPs. It provides:

**Software catalog**: a searchable inventory of all services in the organization — who owns them, what their SLOs are, where their docs live, what's their deployment status. Solves the "who owns this service?" question permanently.

**Templates (Software Templates)**: scaffolding for new services, pre-configured with organizational standards. Click through a wizard, enter service name and owner, get a fully configured repository pushed to GitHub.

**TechDocs**: documentation living with the service code, rendered in the catalog. Keeps docs and code in sync.

**Plugins**: extensible ecosystem for integrating with PagerDuty, Datadog, ArgoCD, GitHub Actions, and dozens of other tools.

## The product mindset

The failure mode of platform teams is building for themselves rather than for their users. A platform that platform engineers understand perfectly but that developers find confusing has failed. Treat your internal platform like a product:

- Talk to developers about what slows them down
- Measure time-to-first-deployment for new services
- Run developer satisfaction surveys (NPS for internal tools is real)
- Prioritize improvements based on what developers actually struggle with, not what seems technically interesting

<!-- RESOURCES -->

- [Platform Engineering on Kubernetes - O'Reilly](https://www.oreilly.com/library/view/platform-engineering-on/9781617299322/) -- type: book, time: varies
- [Backstage Documentation](https://backstage.io/docs) -- type: tool, time: 2h
- [Team Topologies - Matthew Skelton and Manuel Pais](https://teamtopologies.com/book) -- type: book, time: varies
- [Internal Developer Platform - internaldeveloperplatform.org](https://internaldeveloperplatform.org/) -- type: guide, time: 30m
