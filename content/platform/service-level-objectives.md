---
id: service-level-objectives
title: Service Level Objectives
zone: platform
edges:
  to:
    - id: dependency-slos
      question: >-
        My service depends on five others. If any of them are slow, my SLO
        fails. How do I account for that?
      detail: >-
        I'm setting an SLO for my checkout service, but it calls auth, payments,
        inventory, and notifications. If any of those are failing, I fail. Should
        my SLO be based on the sum of all their failure rates? I feel like I'm
        missing something fundamental here.
    - id: error-budgets
      question: >-
        I've got an SLO set. What does that actually give me beyond a number
        on a dashboard?
      detail: >-
        I have a target on paper. But I'm not sure what to do with it. Is it
        just something I monitor and feel bad about when I miss? How does having
        an SLO actually change how my team works or what we prioritise?
difficulty: 2
tags:
  - slo
  - sre
  - reliability
  - targets
  - objectives
category: practice
milestones:
  - Write an SLO for a service you own, including the SLI and target percentage
  - Explain why SLOs should be set below 100% and what that communicates
  - Understand the difference between a customer-facing SLO and an internal SLO
  - Know what it means to negotiate an SLO with a product stakeholder
---

An SLO is the target you hold yourself to. Not what you promise customers — that's the SLA. Not the raw metric — that's the SLI. The SLO is the decision: "99.5% of requests will succeed." Simple to state, harder to pick correctly. The number you choose has real engineering consequences: it determines what architecture you need, what on-call burden you accept, and how much risk you can take when shipping.

<!-- DEEP_DIVE -->

## Why 100% is the wrong answer

The first instinct is to set the highest possible target. Maximum reliability sounds like the right goal. But 100% availability is impossible — hardware fails, networks partition, deployments go wrong. If you set 100% as your SLO, you're setting yourself up to permanently miss it, which makes the metric meaningless.

More importantly, chasing near-100% reliability is extraordinarily expensive. The difference between 99.9% and 99.99% availability isn't incremental — it requires eliminating single points of failure, implementing automated failover, achieving zero-downtime deployments, building full geographic redundancy. All of that costs engineering time that could otherwise go to features.

The right SLO is the minimum reliability that keeps users happy and the business healthy. Set it lower than your instinct says — you can always tighten it later if you're comfortably exceeding it.

## How to pick a target

There are two useful inputs:

**Historical performance** — What availability are you actually delivering today? If you've been running at 99.7% for the past six months, committing to 99.95% is aspirational fantasy. Start at or slightly above your current baseline, then improve from there.

**User expectations** — What does a user experience when the service is at various reliability levels? For an internal admin tool, users might tolerate 99% — that's 7 hours of downtime per month during working hours, which is annoying but manageable. For a checkout flow, users might churn if availability drops below 99.9%. For a payment processor, anything below 99.99% is commercially unacceptable. Different services, different users, different SLOs.

## Writing an SLO

A complete SLO has four parts:

- **The indicator**: what you're measuring ("fraction of HTTP requests returning 2xx")
- **The target**: the percentage ("99.5%")
- **The window**: over what time period ("rolling 30 days")
- **The measurement method**: how you compute it ("from ingress controller access logs, excluding health check endpoints")

The window matters. A 30-day rolling window is the standard, but it means you carry the cost of a bad week for a month. Some teams use quarterly SLOs for strategic decisions and monthly SLOs for operational alerting.

## SLOs need negotiation, not just calculation

An SLO you pick in isolation has no teeth. The product team will push back when reliability work competes with feature work, and without buy-in, the SLO becomes a number on a dashboard that nobody acts on.

The right process: propose an SLO based on data, explain what it costs to achieve it, and explicitly negotiate with product management. When both sides agree, the SLO carries weight. When the budget runs out, both sides are committed to the policy.

<!-- RESOURCES -->

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) -- type: book, time: 30m
- [Implementing SLOs - Google SRE Workbook](https://sre.google/workbook/implementing-slos/) -- type: book, time: 45m
- [SLO Generator - Open Source Tool](https://github.com/google/slo-generator) -- type: tool, time: 30m
