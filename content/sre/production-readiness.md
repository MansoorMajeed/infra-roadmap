---
id: production-readiness
title: Production Readiness
zone: sre
edges:
  to: []
difficulty: 2
tags:
  - production-readiness
  - prd
  - service-maturity
  - launch-checklist
  - sre
  - reliability
category: practice
milestones:
  - Write a production readiness checklist for your organisation
  - Review a real service against the checklist and identify gaps
  - >-
    Define service maturity levels (e.g. alpha, beta, production) and what each
    requires
  - Run a production readiness review before a major launch
---

A new service is ready for production when it meets a defined set of criteria — not when it passes its first deployment, not when it "looks good," but when it can be demonstrably shown to satisfy a standard that your organization has agreed on. Production readiness is the practice of making that standard explicit, reviewing services against it before they launch, and using it to continuously improve existing services. It's the organizational answer to "how do we know we're ready?"

<!-- DEEP_DIVE -->

## Why production readiness reviews exist

Without a standard, "production ready" means whatever the deploying engineer decided it means on the day they shipped. Some services launch with comprehensive monitoring and runbooks. Others go live with no alerting and no clear owner. The difference isn't malice — it's the absence of a defined bar.

A Production Readiness Review (PRR) is a structured assessment of whether a service meets that bar before it handles real user traffic. Google SRE introduced the practice as a way for SRE teams to decide whether to accept support responsibility for a new service. But the practice has value even without a dedicated SRE function: it forces teams to think through operational concerns before deployment rather than after the first incident.

## What a production readiness checklist covers

A good PRR checklist covers the key failure modes and operational requirements:

**Observability**
- Are there dashboards showing the key SLIs (latency, error rate, availability)?
- Are logs structured and searchable?
- Is distributed tracing instrumented?
- Are metrics labeled with enough context to diagnose issues?

**Alerting and on-call**
- Is there an on-call rotation assigned to this service?
- Are alerts defined for the SLOs?
- Do all alerts have associated runbooks?
- Has the on-call team been briefed on the service?

**SLOs**
- Is there a defined SLO for the service?
- Is it being measured and dashboarded?
- Is there an error budget policy in place?

**Reliability**
- Is the service deployed with redundancy (multi-instance)?
- Does the service handle dependency failures gracefully (timeouts, circuit breakers)?
- Has a load test validated capacity assumptions?
- Is there a rollback procedure documented and tested?

**Operations**
- Are there runbooks for the most common failure modes?
- Is the deployment process automated and reproducible?
- Is there an incident response playbook?

**Security**
- Are secrets managed through a secrets manager (not hardcoded or in environment variables)?
- Is authentication and authorization implemented correctly?
- Has the service been reviewed for OWASP top 10 vulnerabilities?

## Service maturity levels

Rather than a binary ready/not-ready, some organizations define maturity levels:

**Alpha / Internal**: service is functional, being used internally, observability and alerting are incomplete. Not customer-facing.

**Beta**: service is customer-facing but with explicit limitations. SLOs are defined but commitments are relaxed. On-call exists but may be shared.

**Production**: full PRR passed. SLOs are enforced. On-call is dedicated. All checklist items are met.

**Mature**: the service has operated in production for enough time to have well-calibrated SLOs, tested runbooks, and demonstrated reliability.

## Making it stick

A PRR only works if it has organizational teeth. If teams can skip it or if the bar is never enforced, it becomes a checkbox exercise. Two practices that help:

**Gate deployment or customer access**: services don't become customer-facing until they've passed the PRR. This can be enforced via feature flags, deployment approvals, or explicit sign-off.

**Make it a collaboration, not an audit**: the PRR should be a conversation between the service team and the SRE or platform team. The goal is to help the service team meet the bar, not catch them failing. Framed correctly, teams want to do PRRs because they've seen what happens to services that skip them.

<!-- RESOURCES -->

- [Google SRE Book - Production Readiness Review](https://sre.google/workbook/service-introduction/) -- type: book, time: 20m
- [Production Readiness Checklist - GitHub Awesome Lists](https://github.com/mtdvio/going-to-production) -- type: reference, time: 30m
