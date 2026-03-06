---
id: game-days
title: Game Days
zone: sre
edges:
  to:
    - id: capacity-planning
      question: >-
        The team knows how to respond under pressure. What's the next proactive
        reliability concern?
      detail: >-
        GameDays have been great — people know the playbooks, roles, and
        escalation paths now. But I'm starting to think about whether we're
        actually sized correctly for what's coming. Recovery is covered. I want
        to make sure we don't hit a wall on the growth side.
difficulty: 3
tags:
  - game-days
  - chaos-engineering
  - incident-response
  - drills
  - resilience
  - sre
category: practice
milestones:
  - Design a game day scenario based on a real historical failure mode
  - Run the game day without telling all participants what failure will be injected
  - Measure response time and decision accuracy against runbooks
  - Capture follow-up items and update runbooks based on what broke down
---

Chaos engineering finds technical weaknesses. Game days practice the human response. A game day is a scheduled, facilitated exercise where the team faces a realistic failure scenario — either injected into a real system or simulated in a tabletop format — and responds as they would in a real incident. The goal is to find out how your response process actually works under pressure, rather than finding out during a genuine emergency at 3 AM.

<!-- DEEP_DIVE -->

## Why practice matters

Incident response is a perishable skill. Reading the runbook is not the same as using it. Knowing who the IC is supposed to be is not the same as actually functioning in that role under stress. Teams that have practiced incident response — who have made mistakes in a safe environment and learned from them — handle real incidents dramatically better than teams that haven't.

This is why organizations like the US military and emergency services spend so much time on drills. The muscle memory matters. The procedures need to be practiced until they're automatic, not just documented until they're familiar.

## Game day formats

**Live failure injection** (chaos-assisted): inject an actual failure into a real environment (production or staging) and run a real incident response. The team must detect, diagnose, and resolve the failure. The facilitator observes, notes what breaks down, and may introduce complications.

**Tabletop exercise**: no actual system changes. The facilitator describes a failure scenario and the team talks through their response: "The database just went read-only. What's the first thing you do?" "You've confirmed it's a disk issue. Who do you escalate to?" This is lower-risk and can cover more failure scenarios per hour.

**Hybrid**: inject a real failure but with a facilitator who can stop it if things go badly. The real alert fires, real tools are used, but there's a safety net.

For teams new to game days, start with tabletop exercises. They're lower-stakes, require no setup, and can be run in a single meeting. Once the process is familiar, move to live injection.

## Designing a game day scenario

A good scenario has three properties:

**Based on plausible failure modes**: ideally adapted from a real historical incident or a chaos experiment that revealed a weakness. Theoretical failures are less motivating than failures that have actually happened.

**Multi-step**: simple "database is down" scenarios are too easy. The best scenarios require diagnosis across multiple systems: "Users are reporting slow checkouts, but the checkout service looks healthy, and the database latency looks normal. What now?"

**Unknown to most participants**: if everyone knows the scenario, the exercise tests knowledge of the specific failure, not the diagnostic process. At minimum, the responders shouldn't know what failure will be injected.

## Running the game day

**Before**: define the scenario, confirm the scope, brief any stakeholders who might see alerts fire, ensure you have a rollback plan.

**During**: the facilitator observes without intervening (unless things are genuinely going badly). Note: How long until detection? Was the alert accurate? Was the IC role clear? Were the runbooks used? What caused confusion?

**After**: facilitate a debrief. What worked? What was confusing? Which runbooks were incomplete? Who didn't know what to do? Capture action items while they're fresh.

## Measuring the exercise

Compare the response to your defined criteria:

- Time from failure injection to detection
- Time from detection to accurate diagnosis
- Adherence to incident roles
- Runbook usefulness (did it help, or was it ignored?)
- Communication quality (internal and simulated external)

These measurements make the next game day comparable, and they show whether you're improving over time.

<!-- RESOURCES -->

- [Google SRE Workbook - Incident Management](https://sre.google/workbook/incident-management/) -- type: book, time: 30m
- [PagerDuty Game Day Guide](https://response.pagerduty.com/training/gameday/) -- type: guide, time: 20m
- [How Stripe Runs Game Days](https://stripe.com/blog/game-day-exercises-at-stripe) -- type: article, time: 15m
