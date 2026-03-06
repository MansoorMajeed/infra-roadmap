---
id: error-budgets
title: Error Budgets
zone: sre
edges:
  to:
    - id: error-budget-policy
      question: >-
        How does the error budget change what the team actually works on — and
        how do I make that conversation with product?
      detail: >-
        I understand the concept — if we're burning budget, we should stop
        shipping features. But in practice that's a hard line to hold when
        product has quarterly commitments. How do I make this a policy instead
        of an argument every time?
    - id: slo-alerting
      question: >-
        My error budget is burning. How do I catch it fast enough to actually
        do something about it?
      detail: >-
        The budget is being consumed but I only find out when someone manually
        checks the dashboard. By the time I know about it, we've already burned
        through a chunk of our monthly allowance. I need to be notified
        automatically when the burn rate goes high.
difficulty: 2
tags:
  - error-budget
  - slo
  - sre
  - reliability
  - feature-velocity
category: concept
milestones:
  - Calculate the error budget in minutes for a 99.9% SLO over 30 days
  - Explain the budget metaphor and what it means to "spend" budget
  - Understand why the error budget belongs to both the product team and SRE
  - Describe what happens when the budget runs out and what policy that triggers
---

An error budget is the flip side of an SLO. If you've committed to 99.9% availability, then 0.1% of time is the budget you're allowed to spend on unreliability. That 0.1% is approximately 43 minutes per month. You can spend it however you like — risky deployments, experiments, technical debt — but once it's gone, you've broken your promise to users. The budget metaphor transforms reliability from a vague aspiration into a resource that teams actually manage.

<!-- DEEP_DIVE -->

## The budget metaphor

When engineers want to ship faster, reliability often suffers. When ops teams want maximum stability, feature velocity slows. Historically this tension is resolved through negotiation, politics, or whoever shouts loudest. Error budgets replace that with arithmetic.

Here's how it works: you commit to 99.9% availability over 30 days. That gives you 43 minutes of allowed downtime. Every minute of actual downtime is charged against that budget. If you've had zero incidents, you have 43 minutes of budget remaining — you can afford to take risks, deploy aggressively, ship the thing that might break. If you've already burned 30 minutes, you have 13 left — you should be cautious, maybe hold off on that risky migration.

The budget makes the tradeoff explicit. Shipping fast and breaking things spends budget. Being conservative preserves it. Both sides can see the account balance.

## How error budget consumption works in practice

Budget is consumed by any period during which your SLI is below its target. A 10-minute outage (100% failure rate) consumes 10 minutes of budget. A 24-hour period with 5% error rate (when your SLO allows 0.1% errors) consumes:

```
Bad events = total_requests × 0.05
Good events threshold = total_requests × 0.001
Excess bad events = total_requests × 0.049
Budget consumed proportional to 0.049 / 0.001 = 49x your normal budget rate
```

The precise calculation depends on your SLI definition, but the key insight is that partial failures consume budget faster than they seem. A 30-minute period with elevated errors can burn through a month's budget.

## What the budget enables

The error budget answers the question that previously had no good answer: "How do we decide when to slow down?" When the budget is healthy, the answer is: "Ship." When it's depleted, the answer is: "Stop and fix reliability." No politics, no arguments — just the budget balance.

This also gives SRE teams leverage they didn't have before. An SRE who says "this feature is too risky" can be ignored. An SRE who says "we've consumed 80% of our error budget this month and shipping this risky change will exhaust the rest — the policy says we stop" is making a data-driven argument that's much harder to dismiss.

## The shared ownership principle

The error budget doesn't belong to the SRE team. It belongs to both engineering and product. Product owns the budget because they make decisions (ship features, cut corners, move fast) that consume it. Engineering owns it because they build reliability investments that replenish it. When the budget is managed as a shared resource with shared accountability, the conversation between product and reliability shifts from adversarial to collaborative.

<!-- RESOURCES -->

- [Google SRE Book - Motivation for Error Budgets](https://sre.google/sre-book/embracing-risk/#xref_risk-management_motivation-for-error-budgets) -- type: book, time: 20m
- [Error Budget Policy - Google SRE Workbook](https://sre.google/workbook/error-budget-policy/) -- type: book, time: 20m
- [The Error Budget - Increment Magazine](https://increment.com/reliability/error-budget-approach-to-reliability/) -- type: article, time: 15m
