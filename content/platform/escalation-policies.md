---
id: escalation-policies
title: Escalation Policies
zone: platform
edges:
  to:
    - id: reliability-roadmap
      question: >-
        Escalation is sorted. How do I now build a real plan for improving
        reliability instead of just reacting to incidents?
      detail: >-
        I've fixed the immediate process problems — people know who to call and
        when. But I'm still mostly firefighting. I want to be systematic about
        making reliability improvements, not just better at handling emergencies.
difficulty: 2
tags:
  - escalation
  - on-call
  - incident-response
  - sre
  - paging
  - rotation
category: practice
milestones:
  - Define at least two escalation tiers for your on-call rotation
  - Document who to contact for each type of incident and how
  - Establish time-based escalation — if not acknowledged in N minutes, auto-escalate
  - Understand the difference between escalating for help vs handing off ownership
---

When an incident is serious and the on-call engineer can't fix it alone, they need to know exactly who to call, how to reach them, and under what circumstances. Right now that knowledge is informal — people guess, delay, or ping someone on Slack and hope for the best. An escalation policy is the written, automated answer to "who do I call when I'm stuck?" It exists so that nobody has to figure out escalation procedures while actively fighting an incident.

<!-- DEEP_DIVE -->

## What escalation means

Escalation isn't failure. It's the recognition that a problem requires more expertise, authority, or capacity than the current responder has alone. Escalating quickly is a sign of good incident management. Delaying escalation because you don't want to bother someone, or because you're not sure who to call, extends the incident unnecessarily.

There are two kinds of escalation:

**Help escalation**: the on-call engineer needs additional expertise. The database is behaving strangely and they need someone who knows the database deeply. The network is doing something unexpected and they need a network engineer. This is escalating for knowledge.

**Ownership escalation**: the severity warrants leadership involvement. A SEV1 that's been running for 30 minutes needs an engineering manager in the loop, not because they'll debug it, but because they need situational awareness and may need to make business decisions.

## The escalation chain structure

A standard two-tier escalation chain:

**Tier 1: Primary on-call**. First responder. Handles alerts, owns the incident until resolved or handed off. Typically a rotation of all engineers on the team.

**Tier 2: Secondary on-call / team lead**. Backup if primary is unavailable. Point of escalation if primary has been on the incident for 30 minutes without progress or if the incident reaches a defined severity threshold.

**Tier 3: Engineering management**. Notified for SEV1 incidents. Makes decisions that require business authority. Doesn't debug.

Beyond Tier 3, escalation should be rare — reserved for incidents with major business impact, data loss risk, or security implications.

## Time-based automatic escalation

Human beings are bad at escalating. Pride, uncertainty about severity, desire to solve it themselves — all of these cause delays. Automated escalation removes the decision: if the primary on-call hasn't acknowledged the page within 5 minutes, the secondary is paged automatically. If nobody has acknowledged in 15 minutes, management is notified.

PagerDuty, OpsGenie, and most modern on-call platforms have this built in. Set it up before you need it:

```
Alert fires
  → Page primary on-call
  → If no acknowledgment in 5 minutes: page secondary on-call
  → If no acknowledgment in 15 minutes: page engineering manager
  → If no response in 30 minutes: high-urgency escalation (phone call, not just push notification)
```

## Specialty escalation paths

Beyond the general on-call chain, document escalation for specialty areas:

- **Database incidents**: who owns database infrastructure? How do they prefer to be contacted?
- **Security incidents**: who owns security response? Important: security escalation may need to bypass normal channels to avoid tipping off a potential attacker.
- **Third-party vendor incidents**: does your vendor have an enterprise support line? A dedicated account manager? The number to call needs to be written down, not remembered.

## Escalation vs handoff

Escalation and handoff are different. Escalation means "I need help right now, I'm still the IC." Handoff means "I'm transferring incident ownership to you." When handing off, the outgoing IC must brief the incoming IC: current status, timeline, what's been tried, current hypothesis. The scribe's log makes this briefing possible without relying on memory.

<!-- RESOURCES -->

- [PagerDuty Escalation Policies](https://support.pagerduty.com/docs/escalation-policies-and-schedules) -- type: guide, time: 15m
- [On-Call Escalation Best Practices - Atlassian](https://www.atlassian.com/incident-management/on-call/escalations) -- type: article, time: 10m
