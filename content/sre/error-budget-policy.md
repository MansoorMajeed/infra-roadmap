---
id: error-budget-policy
title: Error Budget Policy
zone: sre
edges:
  to:
    - id: slo-alerting
      question: >-
        The policy is clear on paper. But how do I know the moment the budget
        starts burning — before it's too late to act?
      detail: >-
        We've agreed: when the budget drops below 50%, we stop shipping features
        and focus on reliability. But right now I only find out how much budget
        we've spent by manually checking a dashboard. I need an automatic signal
        the moment the burn rate goes high, not a surprise at the end of the month.
difficulty: 2
tags:
  - error-budget
  - slo
  - sre
  - feature-velocity
  - reliability
  - policy
category: practice
milestones:
  - Write an error budget policy document with defined thresholds (75%, 50%, 0%)
  - Understand why the error budget is a shared tool between SRE and product
  - Explain what "freezing the feature roadmap" means in practice and who decides
  - Know the difference between error budget consumption and SLO breach
---

An error budget is only useful if everyone knows what to do when it runs out. Without a policy, you have a metric on a dashboard that produces anxiety but not action. The error budget policy is the written agreement — between engineering, SRE, and product — about what happens at each stage of budget consumption. It converts a concept into a process.

<!-- DEEP_DIVE -->

## What a policy needs to say

A good error budget policy defines behavior at multiple thresholds, not just "zero." The reason: by the time the budget is at zero, it's too late to prevent the breach. You need to start changing behavior earlier.

A typical structure uses three thresholds:

**75% consumed (25% remaining)**: Warning. No immediate action required, but the team discusses it in the next standup. Review what's been consuming the budget — is it a single bad incident or a pattern of small failures?

**50% consumed (50% remaining)**: Caution. Start deprioritizing risky changes. Any deployment that might cause elevated errors should be reviewed carefully. Major migrations or infrastructure changes get postponed.

**0% remaining (budget exhausted)**: Freeze. Feature deployments stop. The team focuses exclusively on reliability improvements until the budget recovers. No new features ship until the next measurement window begins.

## The conversation with product

This policy only works if product management agrees to it before the budget runs low — not during an argument about whether to stop shipping. The most effective approach: propose the policy, explain what it means practically ("if we breach our SLO this month, we hold the release scheduled for week 4"), and get explicit sign-off. When everyone has agreed to the rules in advance, enforcing them is a mechanical process rather than a political fight.

The error budget policy is also a forcing function for product to care about reliability work. When they understand that an unstable platform means their features get held, they have a direct incentive to support engineering reliability investments.

## What "freeze" doesn't mean

A feature freeze triggered by budget exhaustion doesn't mean the team stops working. It means:

- **Reliability work continues** — fixing the root causes of budget consumption is the priority
- **Bug fixes ship** — bugs that were causing reliability problems are exactly what should be fixed
- **Infrastructure changes that improve reliability ship** — adding a circuit breaker, fixing a database index, reducing timeout values
- **New feature development pauses** — features that don't improve reliability are deprioritized until the budget recovers

The freeze is targeted, not total.

## Budget windows and rollover

Most error budget policies use a rolling 30-day window. This means the budget from 31 days ago starts returning to you as each day passes. A bad week 30 days ago is gradually forgotten by the metric. This is generally the right behavior — you don't want to be indefinitely penalized for a past incident that you've already fixed.

Some teams use quarterly budgets for strategic planning alongside monthly budgets for operational alerting. Quarterly consumption tells you whether reliability is trending in the right direction. Monthly consumption tells you whether to ship this week.

<!-- RESOURCES -->

- [Error Budget Policy - Google SRE Workbook](https://sre.google/workbook/error-budget-policy/) -- type: book, time: 20m
- [Managing Risk with Error Budgets - Google Cloud Blog](https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos) -- type: article, time: 10m
