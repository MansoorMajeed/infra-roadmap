---
id: service-level-agreements
title: Service Level Agreements
zone: platform
edges:
  to:
    - id: service-level-objectives
      question: >-
        SLAs are what I promise externally. How do I make sure my internal
        targets are tight enough that I never break that promise?
      detail: >-
        We've committed 99.9% uptime to customers in a contract. But I don't
        know how that number was chosen or how I'd know if we're violating it.
        And now the database team wants to know what uptime I need from them —
        is that also an SLA? I'm not sure where the contract ends and the
        engineering target begins.
difficulty: 1
tags:
  - sla
  - sre
  - reliability
  - contracts
  - customer-commitments
  - internal-sla
category: concept
milestones:
  - Explain the difference between an SLA, an SLO, and an SLI
  - Understand why your SLO should be stricter than your SLA
  - Know what happens operationally when you breach an SLA
  - Identify internal team SLAs in your own organisation and whether they're written down
---

An SLA is a promise — usually written into a contract — about how reliable your service will be and what happens when it isn't. Enterprise customers ask for them. Sales teams commit to them. Legal drafts them. And then it falls to engineering to actually meet them. Understanding what SLAs actually commit you to, and how they relate to your internal engineering targets, is essential before you can make promises you can keep.

<!-- DEEP_DIVE -->

## What an SLA actually is

An SLA (Service Level Agreement) is a contract between a service provider and a customer that defines the level of service expected. It typically specifies:

- **The metric**: what's being measured ("API availability", "response time")
- **The target**: the minimum acceptable level ("99.9% uptime per calendar month")
- **The remedy**: what happens if you miss it (service credits, refunds, contract termination rights)

The remedy is what makes an SLA different from an SLO. An SLO is a target you set for yourself. An SLA is a commitment to someone else — with consequences.

## Why your SLO must be stricter than your SLA

This is the most important practical relationship between SLAs and SLOs: your internal target needs to be meaningfully higher than your external commitment.

If you commit 99.9% availability to customers in your SLA, your engineering team needs an SLO of 99.95% or better. Why? Because when you notice you're approaching the SLA breach threshold, you need time to react and recover before the breach becomes a financial and legal problem. The gap between your SLO and your SLA is your safety margin.

If your SLO equals your SLA, you'll discover you're breaching the SLA at the same moment you discover you're missing your internal target — which is already too late.

## Internal SLAs

Not all SLAs are customer-facing. Internal teams make commitments to each other too, even if they're not called SLAs. When your database team tells the checkout team "our database will be available 99.9% of the time," that's effectively an internal SLA. When the platform team says "we'll deploy your changes within one hour of a merge," that's a commitment.

The difference from external SLAs is the remedy. Missing an internal SLA usually means a conversation, a post-mortem, and pressure to improve — not financial penalties. But they should still be written down, agreed to explicitly, and tracked. Informal agreements are invisible when they're being violated.

## What actually happens when you breach an SLA

Different SLAs have different remedies, but the common pattern is service credits — if availability drops below the committed level, the customer gets a percentage of their monthly bill back. For enterprise contracts, the credits can be substantial. For SaaS businesses, repeated breaches can trigger contract termination clauses.

Beyond the financial impact, there's the trust impact. Customers who've been burned by availability breaches start building contingency plans. They reduce their dependency on you. They tell other potential customers. The damage to the relationship is usually more costly than the credit itself.

<!-- RESOURCES -->

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) -- type: book, time: 30m
- [How to Write Good SLAs - PagerDuty Blog](https://www.pagerduty.com/blog/sla-slo-sli/) -- type: article, time: 10m
