---
id: post-mortems
title: Blameless Post-Mortems
zone: platform
edges:
  to:
    - id: error-budgets-in-practice
      question: >-
        The post-mortem is done. But now I have to explain to the product team
        why we need to slow down on features.
      detail: >-
        The action items are written and everyone nodded in the meeting. But
        half of them are reliability investments that compete directly with the
        feature roadmap, and product is pushing back. How do I make this a data
        conversation instead of a political one?
difficulty: 2
tags:
  - post-mortem
  - blameless
  - sre
  - incident-review
  - learning
  - reliability
category: practice
milestones:
  - >-
    Write a post-mortem for a real or simulated incident using a standard
    template
  - Identify contributing factors without assigning individual blame
  - >-
    Generate action items with owners and deadlines — not vague 'we should
    improve X'
  - Run a post-mortem review meeting and publish the document internally
---

A post-mortem is a structured review of an incident whose purpose is to understand what happened well enough to prevent the next one. The word "blameless" is crucial: the goal is to understand why the system and the process failed, not to identify who made a mistake. This distinction sounds simple but is genuinely hard to maintain under organizational pressure, especially after expensive incidents. Getting post-mortems right is one of the highest-leverage practices in reliability engineering.

<!-- DEEP_DIVE -->

## Why blameless?

When individuals are blamed for incidents, two things happen: they stop admitting mistakes, and they stop sharing information. Both make the system less safe. A culture where engineers fear consequences for mistakes is a culture that produces less reliable systems — because you can't fix problems you can't talk about.

The blameless approach, pioneered by organizations like Etsy, Airbnb, and Google, treats incidents as symptoms of system-level failures rather than individual failures. The right question isn't "who caused the outage?" but "what series of conditions made it possible for this error to have this impact?" An engineer who made a mistake is almost always acting rationally given the information and tools available to them. The system created the conditions for the mistake.

This doesn't mean no accountability. It means accountability is directed at fixing the system, not punishing the individual.

## The post-mortem template

A good post-mortem document answers these questions:

**Summary**: What happened, when, what was the user impact, and what was the resolution? One paragraph. This should be readable by non-technical stakeholders.

**Timeline**: Timestamped events from the start of the incident to resolution. Pulled from the scribe's log during the incident. Include detection, declaration, key diagnostic events, resolution.

**Root cause**: What was the underlying cause? Not just the proximate cause (the deployment that broke things) but the contributing causes (why was that config change possible, why wasn't it caught in testing, why did it reach production, why did it take 40 minutes to diagnose).

**Contributing factors**: The system conditions that allowed the root cause to have the impact it did. Lack of monitoring. Incomplete testing. Unclear ownership. Complex deployment process. These are the things to fix.

**Action items**: Specific, scoped, assigned engineering tasks that address the contributing factors. Not "improve monitoring" (vague, unassignable) but "Add alert when connection pool utilization exceeds 80% (owner: X, due: Y date)."

**What went well**: Deliberately include what worked. Good incident coordination, fast detection, a runbook that helped — these deserve acknowledgment and reinforce the practices you want to keep.

## The five whys technique

When digging into root cause, ask "why" five times, each time going deeper:

1. Why did checkout fail? → Database connection pool exhausted.
2. Why did the pool exhaust? → New deployment added a feature that opened extra connections per request.
3. Why wasn't this caught? → No connection pool monitoring, and the load test didn't simulate enough concurrent users.
4. Why didn't load testing catch it? → Load tests run against a separate environment that has a larger pool configured.
5. Why is the pool size different in that environment? → Config drift — nobody audited the test environment against production.

Each "why" gets closer to a system-level fix. The action items follow from level 4 and 5: fix config drift, add connection pool monitoring, update load test environment.

## Sharing post-mortems

Post-mortems are most valuable when they're shared broadly — within the team, across engineering, sometimes publicly. The information in a post-mortem helps others avoid similar failures in their systems. A culture of open post-mortems is a culture that learns. A culture of post-mortems as private shame is a culture that repeats mistakes.

Many companies now publish post-mortems externally for major incidents. This is a trust-building move: it shows customers that when things break, you investigate seriously and take action.

<!-- RESOURCES -->

- [Google SRE Book - Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) -- type: book, time: 20m
- [Blameless Post-Mortem Template - PagerDuty](https://postmortems.pagerduty.com/) -- type: guide, time: 15m
- [Etsy's Blameless Post-Mortems - John Allspaw](https://www.etsy.com/codeascraft/blameless-postmortems/) -- type: article, time: 15m
- [Awesome Post-Mortems - Collection of real examples](https://github.com/danluu/post-mortems) -- type: reference, time: varies
