---
id: on-call-health
title: Sustainable On-Call
zone: platform
edges:
  to:
    - id: escalation-policies
      question: >-
        When something goes wrong and the on-call engineer can't fix it alone,
        who do they call? What are the actual rules?
      detail: >-
        Last week a P1 went on for 40 minutes because nobody knew whether to
        call the database team or the platform team. We need a clear escalation
        chain so people can ask for help without having to figure it out under
        pressure.
    - id: reliability-roadmap
      question: >-
        The rotation is sustainable. How do I turn this into a real plan for
        improving reliability over time?
      detail: >-
        On-call is healthier now, but I'm still mostly reacting. I want to be
        more systematic — actually prioritising reliability work, tracking
        improvement, making it part of how the team operates permanently.
difficulty: 2
tags:
  - on-call
  - sre
  - burnout
  - alert-fatigue
  - toil
  - rotation
  - sustainability
category: practice
milestones:
  - >-
    Track on-call metrics: alert volume per shift, time-to-resolve, pages
    outside business hours
  - Require every actionable alert to have an associated runbook
  - >-
    Establish a policy: any alert that fires without action for N weeks gets
    deleted or silenced
  - >-
    Design an on-call rotation with reasonable primary/secondary coverage and
    handoff
---

On-call is necessary. But the version most engineers experience — constant paging, alerts that require no action, being woken at 2 AM for something that could have waited until morning — is a reliability dysfunction as much as a human one. Unsustainable on-call burns out engineers, degrades their decision-making, and ultimately makes systems less reliable. A healthy on-call rotation is one where engineers feel prepared, alerts are meaningful, and the burden is shared fairly.

<!-- DEEP_DIVE -->

## What unhealthy on-call looks like

The signs are recognizable: engineers dread their on-call weeks and count down the days. Alert volume is high enough that people stop acknowledging every page. "Alert fatigue" means important alerts get ignored because everything is treated as background noise. People learn which alerts to ignore without looking at them. Night pages happen regularly — not just for genuine emergencies. The same alerts fire every week, addressed the same way every week, with nobody ever fixing the underlying cause.

These aren't just morale problems. An engineer who's been awake since 3 AM is not making good decisions about complex production systems. Alerting systems that cry wolf mean genuine emergencies get slow responses.

## The principle of actionable alerts

Every alert that pages an engineer should require a decision that only a human can make. If the right response to an alert is always the same automated action, the alert should trigger that action automatically, not page a human. If an alert fires and the engineer always resolves it by running the same two commands, that resolution should be automated.

Questions to ask about every alert:
- When this fires, does it always require immediate human action?
- Is the action always the same? If yes, can it be automated?
- Is the firing threshold calibrated correctly, or does it fire too often or too rarely?
- What would happen if this alert were silenced for 30 days? Would anyone notice?

The last question is harsh but revealing. Many alerts are monitoring internal metrics that nobody actually acts on.

## Alert quality metrics

Track these per on-call rotation:

**Alert volume**: total pages per shift, per week, per engineer. If this is high, something is wrong.

**Alert actionability rate**: what percentage of alerts required immediate human action? Low actionability means high noise.

**Pages outside business hours**: how often are engineers woken up? This should be reserved for genuine emergencies.

**Time to acknowledge and resolve**: slow acknowledgment may indicate the alert isn't clear enough about urgency.

Review these numbers in a monthly on-call retrospective. Identify the noisiest alerts and either fix the underlying issue or raise the threshold.

## Rotation design

A healthy rotation has:

**Primary and secondary coverage**: the primary on-call engineer handles the incident. The secondary provides backup if primary is unavailable or overwhelmed. Escalation should be explicit.

**Reasonable shift lengths**: week-long rotations are common. Avoid shorter rotations (daily) — the cognitive load of context-switching is high. Avoid longer ones (two weeks) — the burden per person gets too heavy.

**Adequate rotation depth**: in a week-on rotation with a five-person team, each person is on-call one week in five. That's a meaningful fraction of their time. Below five people, on-call load becomes unsustainable without automation or on-call budget to hire.

**Clear handoff**: start of on-call is a deliberate handoff, not just a schedule change. Incoming on-call reads the previous week's incidents, reviews any known ongoing issues, and acknowledges the state of the system.

## The toil connection

Most on-call burnout comes from toil: the repetitive, manual work that scales with service incidents. Reducing on-call burden means reducing toil — automating the common responses, fixing the noisy alerts, and addressing the root causes of recurring incidents rather than patching them every week. Sustainable on-call is an engineering project, not just a scheduling problem.

<!-- RESOURCES -->

- [Google SRE Book - Being On-Call](https://sre.google/sre-book/being-on-call/) -- type: book, time: 20m
- [PagerDuty On-Call Best Practices](https://www.pagerduty.com/resources/learn/call-rotations-schedules/) -- type: guide, time: 15m
- [Atlassian On-Call Guide](https://www.atlassian.com/incident-management/on-call) -- type: guide, time: 20m
