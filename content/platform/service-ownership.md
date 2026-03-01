---
id: service-ownership
title: Service Ownership
zone: platform
edges:
  to:
    - id: production-readiness
      question: >-
        Ownership is assigned. But how do I make sure 'owning' a service means
        something consistent across teams?
      detail: >-
        Every team says they own their service, but what that means varies
        wildly. Some have runbooks and a real on-call rotation. Others just have
        a name in a spreadsheet. I need a standard for what being
        production-ready actually requires.
difficulty: 2
tags:
  - service-ownership
  - platform-engineering
  - on-call
  - team-topologies
  - sre
  - responsibility
category: concept
milestones:
  - Define what service ownership means in your organization
  - Assign clear on-call owners to all production services
  - Understand the "you build it, you run it" model and its tradeoffs
  - Establish an ownership transfer process for when teams hand off services
---

When something breaks at 3 AM, who's responsible? In many organizations, the honest answer is "unclear." The platform team blames the product team. The product team blames infrastructure. Nobody has definitive ownership. Service ownership is the practice of assigning clear, named accountability for every production service — not just for on-call response, but for reliability, SLOs, operational health, and long-term maintenance. Without it, accountability is diffuse and nothing gets fixed properly.

<!-- DEEP_DIVE -->

## "You build it, you run it"

The most influential ownership model in modern software development came from Werner Vogels, Amazon's CTO: "You build it, you run it." Developers who build a service are responsible for running it in production. They carry the pager. They respond to incidents. They feel the pain of the operational decisions they made during development.

This model produces better software because the people making architectural decisions experience the consequences. A developer who has been paged at 3 AM because a connection pool wasn't sized correctly will never misconfigure that pool again. A team that deploys bad code and deals with the incident learns much faster than one that hands code over the wall.

The "you build it, you run it" model requires platform teams to make this possible without crushing developers. If every developer has to be a database expert and a Kubernetes expert and an observability expert, the model fails. The platform team exists to absorb that complexity.

## What ownership means in practice

Service ownership is more than having a name in a spreadsheet. A team that "owns" a service should be accountable for:

**Reliability**: the service meets its SLO. When it doesn't, the owning team is responsible for fixing the underlying cause, not just patching the symptom.

**On-call**: there's a functioning rotation for the service. When an alert fires, someone from the team responds within the defined SLA. Not the platform team, not whoever happens to be online — the owning team.

**Runbooks**: documentation exists for common failure modes. The on-call engineer can handle incidents using the runbook without needing to call the person who built the service.

**Capacity**: the owning team monitors and manages the service's capacity. They know when it will need to scale and take action before it hits limits.

**Dependencies**: the team knows what the service depends on, what happens when those dependencies fail, and has notified the dependency teams of their SLO requirements.

## Service catalog as the foundation

You can't manage service ownership without a service catalog — a central, authoritative list of every production service, its owner, and key metadata. This is the first thing to build.

Minimum catalog fields:
- Service name and ID
- Owning team
- Primary and secondary on-call contacts
- Links to: runbook, SLO dashboard, deployment pipeline, repository
- Criticality (used to prioritize during incidents)

Many organizations use Backstage for this. Others use a simple spreadsheet or Notion database. The format matters less than the discipline of keeping it current.

## Ownership transfers

Services outlive team assignments. Teams restructure, responsibilities shift, projects are handed off. Without an explicit transfer process, ownership becomes ambiguous: the old team thinks they've handed it off; the new team thinks the old team still owns it.

A service ownership transfer requires:
- An explicit handoff meeting where the new team is briefed on the service
- Updated catalog entry (new team, new contacts)
- On-call rotation updated in the alerting system
- Runbooks reviewed and updated
- A defined period of parallel coverage where both teams are available for questions

<!-- RESOURCES -->

- [Team Topologies - Matthew Skelton and Manuel Pais](https://teamtopologies.com/book) -- type: book, time: varies
- [You Build It, You Run It - Werner Vogels](https://queue.acm.org/detail.cfm?id=1142065) -- type: article, time: 15m
- [Service Ownership at Scale - Atlassian Blog](https://www.atlassian.com/incident-management/devops/you-build-it-you-run-it) -- type: article, time: 10m
