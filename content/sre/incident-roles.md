---
id: incident-roles
title: Incident Roles
zone: sre
edges:
  to:
    - id: incident-management
      question: >-
        We have roles assigned. What's the actual process for running an
        incident from start to finish?
      detail: >-
        I know who the incident commander is now. But I still don't have a
        clear picture of the full lifecycle — how do we track what we've tried,
        how do we decide when it's actually fixed, when do we escalate? The
        whole thing still feels improvised even with roles in place.
difficulty: 2
tags:
  - incident-response
  - incident-roles
  - incident-commander
  - sre
  - coordination
category: practice
milestones:
  - Define the responsibilities of the incident commander role
  - Explain why a dedicated comms lead reduces resolution time
  - Practice assigning roles at the start of a simulated incident
  - Understand what the scribe captures and why that log matters afterward
---

When everyone is equally responsible for an incident, nobody is responsible. The first thing that separates orderly incident response from chaos is role clarity: one person is in charge, one person handles all external communication, and someone is writing everything down. These three roles — Incident Commander, Communications Lead, and Scribe — exist not because of bureaucracy but because human coordination under pressure requires explicit structure to work.

<!-- DEEP_DIVE -->

## Incident Commander (IC)

The IC is the decision-maker. They own the incident from declaration to resolution. Their job is not to fix the problem — it's to coordinate the people who are fixing it. This distinction is critical and counterintuitive. The most senior engineer should not be the IC if they're also the most qualified to debug the system. The IC's value comes from their ability to coordinate, not their technical depth.

IC responsibilities:
- Declare the incident and set the severity
- Assign tasks to other responders and track whether they've been completed
- Make judgment calls about when to escalate, when to rollback, when to call in additional help
- Keep the team focused — cut off rabbit holes, redirect exploratory debugging when the situation is urgent
- Declare resolution when the incident is over

The IC is also the single point of contact for the comms lead. Nobody else is fielding stakeholder questions.

## Communications Lead (Comms)

The comms lead's job is to keep everyone outside the incident room informed so that the responders don't have to. This is not a junior role. The comms lead needs enough technical understanding to accurately represent what's happening without exposing sensitive details or creating additional confusion.

Comms responsibilities:
- Send regular status updates to stakeholders (engineering leadership, support, affected customers via status page) on a defined cadence — typically every 30 minutes, even if there's nothing new to report
- Field incoming questions so they don't reach the responders
- Draft the initial incident declaration and the all-clear message
- Coordinate with support teams on customer-facing communications

A well-functioning comms lead completely shields the technical responders from communication overhead. During a major incident, responders should not be sending status updates — they should be debugging.

## Scribe

The scribe documents everything in real time. Not a summary written after the fact — a timestamped running log during the incident:

```
14:32 - Alert fired: high error rate on checkout service (15% errors)
14:34 - IC assigned: [name]. Severity declared: SEV2
14:37 - Database connection pool exhausted. Investigating connection leak.
14:41 - Found: new deployment at 14:15 introduced connection pool config change
14:44 - Rollback initiated
14:51 - Error rate returning to normal
15:00 - Resolved. Error rate at 0.1% (baseline)
```

This log is invaluable: it tells the post-mortem who did what, when, and why. It makes handoffs between responders possible without context loss. It documents the timeline of changes, which is essential for understanding cascading failures.

## How roles are assigned

Roles are assigned at the start of the incident, not during it. The on-call engineer who acknowledges the page is the default IC until explicitly handed off. The assignment should be explicit: "I'm taking IC. [Name], take comms. [Name], take scribe." First message in the incident channel.

For smaller teams or smaller incidents, the same person can hold multiple roles — but the scribe role is the one most often dropped under pressure, and it's the one most worth protecting.

<!-- RESOURCES -->

- [PagerDuty Incident Response Roles](https://response.pagerduty.com/training/incident_commander/) -- type: guide, time: 20m
- [Google SRE Book - Being On-Call](https://sre.google/sre-book/being-on-call/) -- type: book, time: 20m
- [Incident Command for IT - FEMA ICS adapted](https://response.pagerduty.com/during/during_an_incident/) -- type: guide, time: 15m
