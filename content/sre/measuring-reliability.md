---
id: measuring-reliability
title: Measuring Reliability
zone: sre
edges:
  to:
    - id: service-level-agreements
      question: >-
        I keep seeing 'SLA' in contracts and dashboards — what does it actually
        commit us to, and who holds us to it?
      detail: >-
        Our enterprise customers keep asking about our SLA. Legal drafted some
        numbers but I'm not sure we can actually meet them, and I don't know how
        they relate to what I measure internally. And when internal teams promise
        each other things — is that also an SLA?
    - id: service-level-indicators
      question: >-
        How do I decide what to actually measure? My dashboards have a hundred
        graphs but none of them clearly answer 'is the service OK?'
      detail: >-
        I have CPU, memory, request count, error rate, database connections — but
        when someone asks 'is the service healthy?' I'm still guessing. I want to
        find the handful of measurements that actually reflect whether users are
        having a good experience, not just whether the machines are running.
    - id: critical-user-journeys
      question: >-
        I want to measure reliability from my users' perspective, not just
        whether my servers are up.
      detail: >-
        My pods are all green but users are complaining. I think I'm measuring
        the wrong things — infrastructure health instead of whether users can
        actually complete what they came to do. How do I define and measure
        reliability from their point of view?
difficulty: 1
tags:
  - reliability
  - sre
  - sli
  - slo
  - observability
  - measurement
category: concept
milestones:
  - Explain why raw infrastructure metrics are poor proxies for user experience
  - Understand what SLAs, SLIs, and SLOs are and how they relate to each other
  - Know the difference between availability, reliability, and durability
  - Calculate allowed downtime for common SLO targets (99%, 99.9%, 99.99%)
---

You have alerts. You have dashboards. But when someone asks "how reliable is this service?", the honest answer is "I'm not sure." You know when it's obviously broken. You don't know if it's trending better or worse. There's no shared definition of "working well enough" that developers, ops, and product stakeholders all agree on. Before you can improve reliability, you need a way to measure it that everyone understands — and that actually reflects what users experience.

<!-- DEEP_DIVE -->

## Why uptime isn't enough

"Five nines" sounds impressive until you ask: five nines of what, exactly? Uptime means the service is responding to something. It doesn't tell you whether users are actually getting what they need. A service can be "up" while half of all requests fail with 500 errors. A service can be "up" while every response takes 30 seconds to arrive. From a monitoring dashboard perspective: green. From a user perspective: completely broken.

The problem with uptime as a metric is that it's measured from the inside — "is the process running?" — not from the outside — "are users successfully completing what they came to do?" A service that's 100% up but 50% slow isn't 100% reliable.

## The SRE measurement model

SRE introduces three concepts that work together:

**Service Level Indicators (SLIs)** are the metrics you actually measure. Not "is the service up?" but "what fraction of requests succeeded in under 200ms?" SLIs are chosen to reflect what users actually care about.

**Service Level Objectives (SLOs)** are the targets you set for those indicators. "99.9% of requests should succeed" or "95% of requests should complete in under 200ms." These are internal targets — the standard you hold yourself to.

**Service Level Agreements (SLAs)** are contracts with customers about what happens when you miss those targets. SLAs have consequences: refunds, credits, contract penalties. Not every service needs an SLA, but every service should have SLOs.

## The math that makes it concrete

Some quick numbers that are worth having in your head:

| SLO target | Allowed downtime per month |
|-----------|--------------------------|
| 99% | ~7.3 hours |
| 99.5% | ~3.6 hours |
| 99.9% | ~43 minutes |
| 99.99% | ~4.3 minutes |

The difference between 99.9% and 99.99% is enormous operationally. Achieving that extra 9 requires fundamentally different architecture: no single points of failure, automated failover, zero-downtime deployments. That's why picking your SLO matters — it defines what you need to build.

## Three branches from here

SLAs, SLIs, and Critical User Journeys are distinct enough that each deserves separate attention. SLAs connect to your relationship with customers and what you're contractually committing to. SLIs connect to what you measure and how. CUJs reveal which user actions matter most — and often show you've been measuring the wrong things entirely. All three paths converge on setting objectives that actually guide engineering decisions.

<!-- RESOURCES -->

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) -- type: book, time: 30m
- [The Art of SLOs - Google SRE Workbook](https://sre.google/workbook/art-of-slos/) -- type: book, time: 45m
- [SLO vs SLA vs SLI - Atlassian](https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli) -- type: article, time: 10m
