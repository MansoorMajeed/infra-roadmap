---
id: always-firefighting
title: Always Firefighting
zone: sre
edges:
  to:
    - id: what-is-sre
      question: >-
        Is there a more systematic way to handle this than just hiring more
        people and hoping it gets better?
      detail: >-
        Every incident we patch something, add another alert, write a note
        somewhere. But we're back in the same cycle two weeks later. It feels
        like we're treating symptoms, not the root cause. There has to be a
        fundamentally better way to think about running software in production.
difficulty: 1
tags:
  - sre
  - reliability
  - ops
  - incidents
  - firefighting
  - culture
category: concept
milestones:
  - Identify the patterns that lead to permanent firefighting mode
  - Understand why adding more ops headcount doesn't solve the root problem
  - Recognize the dev/ops divide and its consequences for reliability
  - Know the cost of poor reliability — churn, trust erosion, engineering morale
---

Every ops team hits this wall eventually. You're not building anymore — you're just surviving. Something breaks, you fix it, something else breaks. The cycle repeats. Your backlog is a graveyard of intentions: projects you meant to do, improvements you planned to make, the automation you keep promising yourself you'll write next week. Next week never comes. This isn't bad luck or a staffing problem. It's the predictable outcome of scaling complexity without scaling the systems for managing it.

<!-- DEEP_DIVE -->

## Why the fires never stop

The firefighting trap has a specific shape. Early on, the team is small and the system is simple. Everyone knows everything. When something breaks, the right person fixes it fast. Then the system grows. New services, new dependencies, new failure modes. But the team's operating model doesn't change — you still rely on heroics, institutional knowledge, and whoever is available. The fires start taking longer to put out. Then they start overlapping.

Adding more people is the instinctive response, but it doesn't solve the underlying problem. More people means more services to own, more alerts to triage, more incidents to manage. The workload expands to fill the headcount. You end up with a bigger team that's just as overwhelmed, plus the coordination overhead of a bigger team.

## The dev/ops divide

In most organizations, the team that builds software and the team that runs it are different people. Developers optimize for shipping features fast. Operations optimizes for keeping things stable. These incentives conflict by design. Developers throw code over the wall; operations catches whatever breaks. Neither team has the full picture. Developers don't feel the pain of running bad code in production. Operations doesn't have the context to fix the underlying problems. So both teams are stuck: developers keep shipping things that break, operations keeps fixing the same classes of problems over and over.

The result: operations is reactive by nature. You respond to what happened. You don't have the time, context, or authority to prevent the next thing.

## What reliability actually costs

Poor reliability isn't just an operational headache — it's a business cost that's easy to underestimate. Every major incident erodes trust. Customers who get burned once start looking for alternatives. Support tickets spike, which costs money. Engineers who spend their nights and weekends on-call burn out and leave. The knowledge walks out the door with them, which makes the next incident worse.

There's also the hidden cost of interruptions. An engineer who gets paged at 2 AM loses not just two hours — they lose the next day's focus too. Studies on cognitive interruption show that context-switching between deep work and incident response has a compounding cost that doesn't show up in any on-call report.

## The pattern that escapes this

The escape isn't working harder or hiring faster. It's changing the model. Organizations that stop firefighting permanently share a few traits: they measure reliability in terms that connect to user impact, they have a shared understanding between development and operations about what "working well enough" means, and they treat operational work as engineering work — something to be systematically reduced, not just staffed.

That's the discipline this zone is about. Not more firefighting, but fewer fires — and a systematic way to make that happen.

<!-- RESOURCES -->

- [Google SRE Book - Introduction](https://sre.google/sre-book/introduction/) -- type: book, time: 30m
- [The Calculus of Service Availability - Google](https://queue.acm.org/detail.cfm?id=3096459) -- type: article, time: 20m
