---
id: reliability-roadmap
title: Reliability Roadmap
zone: sre
edges:
  to:
    - id: dora-metrics
      question: >-
        I have a reliability plan. But how do I measure whether the whole
        engineering org is actually getting better over time?
      detail: >-
        I can track whether individual services improve against their SLOs. But
        I want to know if we're actually improving as an org — are we deploying
        more safely, recovering faster, breaking things less often? I've heard
        about DORA metrics doing this but I don't know how to apply them.
    - id: chaos-engineering
      question: >-
        I've fixed the known problems. But I keep getting surprised by failures
        I didn't predict. How do I find the unknown ones?
      detail: >-
        Every time we fix one thing, the next incident is something completely
        different that we never considered. I want to stop only discovering
        weaknesses when users hit them. Is there a way to find them on purpose
        before that happens?
difficulty: 2
tags:
  - reliability
  - roadmap
  - planning
  - sre
  - post-mortem
  - prioritization
category: practice
milestones:
  - Convert post-mortem action items into properly scoped engineering tasks
  - Prioritize reliability work using error budget consumption data
  - Communicate a reliability investment plan to product stakeholders
  - Build a quarterly reliability review process into your team's rhythm
---

You've fixed the most obvious problems. Incidents are handled better, on-call is more sustainable, there are SLOs on the critical services. Now the question is: how do you make reliability improvement a systematic, ongoing practice rather than a series of reactive fixes? The reliability roadmap is how you translate post-mortem action items, error budget data, and engineering judgment into a prioritized plan that competes on equal footing with feature work.

<!-- DEEP_DIVE -->

## Why reliability work gets deprioritized

Reliability work has a structural disadvantage in product organizations. Feature work produces visible, demonstrable value: a new feature ships, users see it, product celebrates it. Reliability work prevents things from happening — things that, because they didn't happen, nobody notices. The value is invisible until it becomes counterfactual: "we would have had a major outage, but we didn't, because of this investment."

This makes reliability work easy to defer. There's always a feature that seems more urgent. The post-mortem action items stay in the backlog for months, then quarters. The next incident reveals the same underlying weakness that the post-mortem identified nine months ago.

The error budget is your primary tool for changing this dynamic. When the budget is depleting, the argument for reliability investment has quantitative backing.

## Building the reliability roadmap

A reliability roadmap is a time-ordered list of reliability investments, prioritized by expected impact, with clear owners and milestones.

**Step 1: Gather inputs.** Sources of reliability work:
- Post-mortem action items (with severity and recurrence rate)
- Error budget analysis (which failure modes are consuming the most budget?)
- On-call data (which alerts are most frequent? which incidents take longest to resolve?)
- Known technical debt that affects reliability
- Capacity concerns (what will break when traffic doubles?)

**Step 2: Estimate impact.** For each item, ask: "If we fix this, how much error budget do we recover per month?" This is often approximate, but it forces prioritization. A fix that recovers 20% of monthly budget should rank above a fix that recovers 2%.

**Step 3: Communicate with stakeholders.** A reliability roadmap isn't just for the engineering team. Product and engineering leadership should see it and understand the tradeoffs. "If we don't fix the connection pool exhaustion issue, we'll continue burning 30% of our error budget from that single failure mode" is a concrete, compelling argument.

**Step 4: Reserve capacity.** The roadmap only works if there's sprint allocation to execute it. Aim for 20% of engineering capacity on reliability work as a default. Adjust based on error budget consumption.

## Quarterly reliability reviews

Build a quarterly reliability review into your team's rhythm. This is a 60-90 minute meeting with the full team and a product stakeholder. The agenda:

1. Error budget consumption over the quarter: how much did we spend, on what?
2. Reliability investments completed: what did we do, and did it have measurable impact?
3. Incidents and post-mortems: what patterns emerged? What surprised us?
4. Roadmap for next quarter: what reliability investments are we committing to?

The quarterly review is where the reliability roadmap gets updated, socialized, and defended. It creates accountability — commitments made in the review are reviewed in the next one.

## The relationship with DORA metrics

Error budget and SLO data tell you how reliable your services are right now. DORA metrics tell you something different: how efficiently is the engineering organization delivering change, and how reliably is it doing so? The two measurement frameworks complement each other — SLOs answer "are we reliable?" while DORA answers "are we improving?"

<!-- RESOURCES -->

- [Google SRE Workbook - Setting Up a Reliability Practice](https://sre.google/workbook/reaching-beyond-your-first-sre-team/) -- type: book, time: 30m
- [Prioritizing Reliability Work - Google SRE Workbook](https://sre.google/workbook/error-budget-policy/) -- type: book, time: 20m
