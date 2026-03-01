---
id: incident-communication
title: Incident Communication
zone: platform
edges:
  to:
    - id: status-pages
      question: >-
        I need somewhere customers can see what's happening during an incident.
        How do I set that up?
      detail: >-
        Right now customers find out about outages from Twitter or by flooding
        our support inbox. I want a proper status page so they have a reliable
        source of truth — but I don't know how to structure it, what to put on
        it, or how to keep it updated during a chaotic incident.
    - id: post-mortems
      question: >-
        Communications are wrapped up. Now how do we do a proper review of
        what went wrong?
      detail: >-
        We sent the all-clear update and the ticket is closed. But I'm worried
        we're just going to hit the same thing in three months. We need to do a
        real review, but I've been in bad post-mortems before and I don't want
        to repeat that.
difficulty: 2
tags:
  - incident-communication
  - status-page
  - stakeholder-management
  - sre
  - customer-communication
category: practice
milestones:
  - 'Set up a status page (statuspage.io, Cachet, or equivalent)'
  - Write communication templates for common incident severities
  - >-
    Define who owns external communication vs internal communication during an
    incident
  - >-
    Practice the update cadence: communicate every 30 minutes even if there's no
    update
---

When something breaks, two things need to happen simultaneously: fix it, and communicate about it. These two activities compete for the same people's attention, and if you don't have a system, communication always loses — until a customer tweets about it, your CEO gets a call, and now communication is suddenly a five-alarm fire on top of the original five-alarm fire. Good incident communication is invisible when it works: stakeholders feel informed, responders stay focused, and nobody is blindsided by something they should have known.

<!-- DEEP_DIVE -->

## Internal vs external communication

Internal and external communication have different audiences, different cadences, and different content.

**Internal communication** targets engineering leadership, product, support, and adjacent teams. It's detailed and technical: what's broken, what we're doing about it, what's the current hypothesis, who owns it. The audience needs enough information to make decisions — should we activate the sales customer success team? Should we notify enterprise accounts directly? When will it be fixed so support can tell customers?

**External communication** targets users, customers, and the public. It's plain language, focused on impact and timeline: "We're experiencing issues with checkout. Orders placed between 2:00 PM and 3:15 PM may not have processed. We're working to resolve this and will update in 30 minutes." No technical details. No speculation. No blame.

## The communication cadence

The most important rule: communicate on a schedule, not just when there's something to say. An update every 30 minutes — even if it's "we're still investigating, no new information" — is dramatically better than silence. Silence breeds speculation, escalation, and angry calls to your CEO.

This is why the communications lead role exists. The IC is too busy to also write stakeholder updates. The comms lead owns the update cadence: set a timer, write the update when it fires, send it.

A simple template:

```
[TIME] STATUS UPDATE - Incident [ID]

Current Status: Investigating / Mitigating / Resolved

Impact: [Who is affected and how]
What we know: [One sentence summary of current understanding]
What we're doing: [Current action being taken]
Next update: [In 30 minutes / When we have more information]
```

## Stakeholder mapping

Know in advance who needs to know about incidents of different severities:

| Severity | Notify |
|----------|--------|
| SEV1 | Engineering VP, product, support team lead, customer success (enterprise accounts) |
| SEV2 | Engineering management, product, support team lead |
| SEV3 | Engineering team, support if tickets increasing |
| SEV4 | Engineering team only |

Have this list written down and linked from your incident runbook. Making this decision during an incident is one more thing for the IC to figure out under pressure.

## The all-clear

When the incident resolves, send a final update with:
- Confirmed resolution time
- A brief description of what happened and what fixed it
- The expected post-mortem date (if SEV1/SEV2)

The all-clear is not a post-mortem. Don't include root cause analysis, blame, or detailed technical explanations. That comes later.

<!-- RESOURCES -->

- [PagerDuty Incident Communication](https://response.pagerduty.com/during/communication/) -- type: guide, time: 15m
- [Writing Good Incident Status Updates - Statuspage Blog](https://www.atlassian.com/blog/statuspage/incident-communication-best-practices) -- type: article, time: 10m
