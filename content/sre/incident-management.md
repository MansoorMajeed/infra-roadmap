---
id: incident-management
title: Incident Management
zone: sre
edges:
  to:
    - id: post-mortems
      question: >-
        The incident is resolved. How do I make sure we actually learn from it
        instead of just moving on?
      detail: >-
        Every post-mortem I've seen either turns into a blame session or
        produces a list of action items that nobody follows through on. I want
        to run one that actually changes how we work — not just fills out a
        document.
    - id: incident-communication
      question: >-
        While I'm trying to fix the incident, how do I keep stakeholders and
        customers in the loop without it derailing the response?
      detail: >-
        The responders need to focus on debugging. But I'm also getting pinged
        by engineering leadership, the support team, and customers all at once.
        All that communication is pulling focus away from the actual fix. I need
        to handle both without sacrificing either.
difficulty: 2
tags:
  - incident-management
  - incident-response
  - on-call
  - sre
  - severity
  - incident-commander
category: practice
milestones:
  - 'Define severity levels for your organisation (SEV1, SEV2, SEV3)'
  - Establish the incident commander role and what it's responsible for
  - Practice declaring and running a simulated incident
  - Document your incident response process so anyone can follow it at 3 AM
---

Incident management is the process that turns a chaotic outage into a structured response with a clear owner, a clear timeline, and a clear path to resolution. The goal isn't to eliminate incidents — it's to make them predictable. When the process is right, any engineer in the rotation can handle any incident with confidence, because the process tells them what to do even when their technical knowledge runs out.

<!-- DEEP_DIVE -->

## Incident lifecycle

A well-run incident has five phases:

**1. Detection**: Someone or something notices the service is degraded. Ideally an alert — but users, support tickets, or a developer noticing something wrong all count. The faster detection happens, the less total damage.

**2. Declaration**: Someone explicitly says "this is an incident." This sounds trivial but it matters. Declaration triggers the process: the IC is assigned, the incident channel is created, the severity is set. Without explicit declaration, the response stays informal and coordination breaks down.

**3. Triage**: What is the scope and severity? Is this a complete outage or degraded service? Which users are affected? What's the business impact? Triage determines urgency and guides resource allocation. It also shapes communication — a SEV1 complete outage gets a different response than a SEV3 elevated error rate.

**4. Response**: The technical work of fixing the problem. Form a hypothesis, test it, eliminate or confirm, iterate. The IC coordinates. The scribe documents. The comms lead handles updates. Responders debug.

**5. Resolution and handoff**: The incident is declared resolved when the symptom is gone and the fix is confirmed stable. The IC writes an all-clear. The scribe's log is preserved for the post-mortem.

## Severity levels

Define severity levels before you need them. A typical structure:

| Severity | Description | Response | Example |
|----------|-------------|----------|---------|
| SEV1 | Complete service outage, data loss risk, or security breach | All hands, 24/7 until resolved | Checkout completely down |
| SEV2 | Major feature broken, significant user impact | IC + team, business hours extended | Payment failures for 20% of users |
| SEV3 | Degraded performance, minor feature broken | On-call handles, normal hours | Slow search, non-critical feature failing |
| SEV4 | Minor issue, no immediate user impact | Ticket, fix in normal sprint | Edge case bug, cosmetic issue |

SEV1 and SEV2 require IC + comms roles. SEV3 can often be handled by the on-call engineer alone. SEV4 is a ticket, not an incident.

## The incident channel

Every incident gets its own communication channel (Slack, Teams, or equivalent), created at declaration and archived afterward. The channel becomes the single source of truth: what's happening, what's been tried, who's doing what. Side conversations and DMs during an incident fragment information and hurt coordination.

Channel naming convention: `#incident-YYYY-MM-DD-brief-description` or `#inc-[ticket-number]`. Keep it searchable.

## Declaring resolution

Resolution is the IC's call. The criteria:
- The symptom that triggered the incident is no longer present
- The fix (or mitigation) is confirmed stable — not just "seems better"
- Monitoring shows return to baseline
- There are no obvious secondary effects

Don't rush resolution. A premature all-clear followed by another incident 20 minutes later is worse than a longer incident with a clean resolution.

<!-- RESOURCES -->

- [PagerDuty Incident Response Guide](https://response.pagerduty.com/) -- type: guide, time: 1h
- [Google SRE Book - Managing Incidents](https://sre.google/sre-book/managing-incidents/) -- type: book, time: 25m
- [Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management) -- type: guide, time: 30m
