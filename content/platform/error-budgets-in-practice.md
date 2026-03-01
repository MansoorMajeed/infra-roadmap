---
id: error-budgets-in-practice
title: Error Budgets in Practice
zone: platform
edges:
  to:
    - id: reliability-roadmap
      question: >-
        I have a pile of reliability problems to fix. How do I prioritize them
        and make sure they don't just get deprioritized forever?
      detail: >-
        The post-mortem generated eight action items and the error budget
        analysis flagged five more. I don't know which ones matter most, how to
        frame them for planning, or how to stop them from getting pushed to the
        bottom of the backlog every sprint.
difficulty: 2
tags:
  - error-budget
  - slo
  - sre
  - reliability
  - feature-velocity
  - policy
category: practice
milestones:
  - Write an error budget policy document for a service
  - 'Define what happens at 75%, 50%, and 0% remaining budget'
  - Run an error budget review meeting with your team
  - 'Understand why the error budget belongs to the product team, not just SRE'
---

Understanding error budgets conceptually is one thing. Using them to make actual engineering decisions is another. The budget becomes real when it starts changing what your team works on — when it causes a product conversation, when it stops a risky deployment, when it gives reliability work the priority it needs to actually happen. This node is about turning the theory into a practice your team lives by.

<!-- DEEP_DIVE -->

## Running an error budget review

The budget is only useful if someone looks at it regularly. A monthly error budget review (30 minutes, the whole team including a product stakeholder) should answer three questions:

1. **How much budget did we consume this month, and what consumed it?** Break it down by incident or failure mode. Was it a single bad deployment? Slow infrastructure? Dependency failures? Pattern recognition across months is where the real insights come from.

2. **What's our burn rate trajectory?** Are we improving month-over-month? Is consumption concentrated in a few incidents or spread across many small failures?

3. **What reliability work did we complete, and did it have measurable impact?** Close the loop between engineering investment and measured outcomes.

## Translating incidents into budget terms

When a post-mortem produces action items, not all of them are equally valuable. Budget-aware prioritization asks: "How much of our budget would be recovered if this were fixed?"

An incident that burned 30 minutes of a 43-minute monthly budget is a high-priority item. A bug that causes 1 in 10,000 requests to fail is low-priority unless your request volume is enormous. Frame the reliability work in budget terms and the prioritization becomes data-driven rather than political.

## When budget runs out mid-month

This is the moment the policy either means something or it doesn't. When the budget hits zero:

- Check whether the error budget policy has been signed off by product. If not, have that conversation now — but know you're doing it under pressure, which is the worst time.
- Notify product stakeholders that the feature freeze is in effect per the agreed policy.
- Shift the team's focus to reliability work: fixing the root causes of budget consumption, improving observability, reducing technical debt that caused the incidents.
- Track recovery: when does the 30-day window reset enough that budget starts returning?

The temptation is to treat the budget exhaustion as a one-time anomaly and keep shipping anyway. This is exactly when the policy must hold, or it never will.

## Reliability backlog management

Post-mortems and error budget reviews generate reliability work. That work needs to live somewhere real — in the same backlog that feature work lives in, with real sprint allocation.

A common pattern: reserve 20% of each sprint for reliability work. This isn't heroism — it's a policy. When reliability work is on the backlog alongside features, it competes for attention. When it's siloed into a "reliability sprint" that happens "someday," it never happens.

The error budget gives you the evidence to defend that 20%. When a stakeholder asks why you're fixing infrastructure instead of shipping, the answer is: "We burned 65% of our error budget last month. The policy we agreed on says we invest in reliability until the budget recovers."

<!-- RESOURCES -->

- [Error Budget Policy - Google SRE Workbook](https://sre.google/workbook/error-budget-policy/) -- type: book, time: 20m
- [Implementing SLOs - Google SRE Workbook](https://sre.google/workbook/implementing-slos/) -- type: book, time: 45m
