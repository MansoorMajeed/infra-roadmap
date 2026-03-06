---
id: status-pages
title: Status Pages
zone: sre
edges:
  to:
    - id: post-mortems
      question: >-
        The incident is over and the status page is updated. Now how do we
        actually learn from what happened?
      detail: >-
        We posted the all-clear and customers know things are back to normal.
        But we closed the ticket without really digging into why it happened.
        I've promised customers a post-incident review — how do I run one that
        actually produces something useful rather than just documenting the
        timeline?
difficulty: 1
tags:
  - status-page
  - incident-communication
  - customer-communication
  - transparency
  - sre
category: practice
milestones:
  - Set up a public status page for your service
  - Write communication templates for common incident severities
  - Establish who owns updating the status page during an incident
  - Practice updating the status page during a non-critical incident
---

Right now, when your service goes down, customers find out from Twitter, from their own users filing support tickets, or from their own dashboards going red. They have no reliable place to check what's happening and whether you know about it. A status page gives them that: a single, always-available source of truth about your service's current status and any ongoing incidents. Done well, it reduces support volume, sets expectations, and signals that you're operating with transparency.

<!-- DEEP_DIVE -->

## What a status page is not

A status page is not a dashboard for internal teams. It's not a replacement for your internal monitoring or alerting. It's an outward-facing communication channel for customers who don't have access to your systems but need to know whether to trust them right now.

The design principle: a customer checking your status page should get a clear, jargon-free answer to the question "is this service working?" without needing any technical knowledge to interpret it.

## What to put on it

**Current status for each major component.** Break your service into meaningful user-facing components — not by internal service name, but by what users actually interact with: "Dashboard", "API", "Billing", "Mobile App". Show the status of each: Operational / Degraded Performance / Partial Outage / Major Outage.

**Incident timeline.** When an incident is in progress, provide timestamped updates in plain language:
- "2:15 PM — We're investigating elevated error rates on the API."
- "2:45 PM — We've identified the cause: a misconfigured deployment rolled out at 2:00 PM. Rollback in progress."
- "3:10 PM — Service has recovered. Error rates are back to normal."

**Historical incidents.** Show past incidents and how they were resolved. This builds trust. A service with no incident history looks suspicious, not reliable.

## Hosted vs self-hosted

**Atlassian Statuspage** — the industry standard. Integrates with PagerDuty, Datadog, and most monitoring tools for automatic status updates. Has a free tier. Powers status pages for Slack, GitHub, Stripe, and thousands of other services.

**Cachet** — open-source, self-hosted alternative. Requires your own infrastructure — which creates a problem: your status page might be down when your service is down.

If you're self-hosting, make absolutely sure the status page runs on infrastructure isolated from the service it reports on. A status page that goes down with the service is useless at the exact moment it's needed most.

## Automation vs manual updates

The best status pages combine both. Automated components update green/yellow/red based on monitoring signals. Incident communications are written by humans because they require context and judgment.

A common pattern: set up automated component status updates from your monitoring (if API error rate exceeds threshold, automatically flip "API" to "Degraded Performance"). Write manual incident updates explaining what's happening and what you're doing.

## Prepare templates in advance

Writing clear communication under pressure is hard. Prepare templates before you need them:

```
Investigating: We are aware of issues affecting [component].
Our team is currently investigating. Next update in 30 minutes.

Update: We have identified the issue: [one sentence].
We are currently [action]. Next update in 30 minutes.

Resolved: This incident has been resolved. [Component] is operating normally.
We will publish a post-incident review by [date].
```

Fill in the specifics during the incident. Don't write from scratch under pressure.

<!-- RESOURCES -->

- [Atlassian Statuspage](https://www.atlassian.com/software/statuspage) -- type: tool, time: 30m
- [Cachet - Open Source Status Page](https://cachethq.io/) -- type: tool, time: 1h
- [Writing Good Incident Status Updates](https://www.atlassian.com/blog/statuspage/incident-communication-best-practices) -- type: article, time: 10m
