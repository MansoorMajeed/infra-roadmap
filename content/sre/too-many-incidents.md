---
id: too-many-incidents
title: Too Many Incidents
zone: sre
edges:
  to:
    - id: incident-roles
      question: >-
        When an incident is happening and everyone's panicking, how do I
        bring some structure to it?
      detail: >-
        Last week three people were all making changes at once, nobody knew
        who was driving, and we made things worse before we got better. I know
        there's a more organised way to handle this but I've never seen it done
        properly. What does good incident response actually look like from the
        inside?
    - id: on-call-health
      question: >-
        Before we talk about running incidents better — the on-call rotation
        itself is broken. People are burning out. Where do I fix that first?
      detail: >-
        Half the incidents feel bad because the on-call experience is already
        miserable before anything even breaks. We're getting paged for things
        that don't matter, ignoring things that do because we've been
        desensitised, and nobody wants to be on rotation. I'm not sure fixing
        the incident process helps if the alerts and the rotation are the
        real problem.
difficulty: 1
tags:
  - incidents
  - sre
  - incident-management
  - reliability
  - on-call
  - firefighting
category: concept
milestones:
  - Identify the patterns that make incident response chaotic vs effective
  - Understand what distinguishes a high-performing incident response team
  - Know the difference between an incident and a bug or maintenance task
  - Recognise the signs that your organisation's incident management is broken
---

There's a difference between incidents and chaos. Every production system will have incidents — unexpected failures, degraded performance, bugs that slip through review. The question isn't whether you'll have incidents, but whether you have a process for handling them that doesn't make things worse. Right now, the process is chaos: no clear owner, multiple people making changes simultaneously, no one knowing the current status, and every incident feeling like the first time you've ever dealt with one.

<!-- DEEP_DIVE -->

## What makes incident response chaotic

There are predictable patterns in dysfunctional incident response:

**No declaration threshold.** Teams debate "is this really an incident?" while the situation deteriorates. Users are affected. The on-call engineer spends ten minutes figuring out if they should escalate while the damage accumulates.

**No single owner.** Everyone joins the call. Multiple people make changes to the same system simultaneously. Someone rolls back a deployment. Someone else changes a config. Nobody knows what changed or in what order. Debugging becomes impossible because the system state is constantly shifting.

**Communication collapse.** Engineering leadership is messaging the on-call engineer for status updates while they're trying to debug. Support is forwarding customer messages. Developers are asking questions in Slack. The person best positioned to fix the problem can't focus because everyone wants a status update.

**No timeline.** Nobody is writing down what happened, what was tried, what the current hypothesis is. When a second engineer joins to help, they have to be briefed from memory while the first engineer continues debugging. Information is lost. The same things get tried twice.

## What high-performing incident response looks like

The best incident responses feel controlled even when the situation is serious. The key characteristics:

One person is clearly in charge and making decisions. Others are executing, investigating, or communicating — not also deciding. There's a written log of what's happened and what's been tried. Stakeholders are getting updates on a predictable cadence, which means they're not interrupting the responders to ask for them. The diagnosis is happening systematically: form a hypothesis, test it, eliminate it or confirm it, move to the next.

High-performing teams also have a clear definition of what an incident is. Not every alert is an incident. Not every bug is an incident. An incident is a situation that's actively degrading user experience and requires coordinated response. Knowing when to declare one — and to do so quickly — is itself a skill.

## The cost of bad incident response

Poor incident response has compounding costs. The direct cost is longer resolution time — every minute of unclear ownership is a minute of additional user impact. The indirect cost is engineer burnout: chaotic incidents are stressful in a way that orderly incidents aren't. Engineers who dread every page start avoiding on-call, making the rotation worse for everyone.

There's also a learning cost. Chaotic incidents don't produce actionable post-mortems. When nobody knows exactly what happened, what was tried, or why it worked, the only lesson is "that was bad." You can't improve what you can't understand.

<!-- RESOURCES -->

- [Incident Management for Operations - O'Reilly](https://www.oreilly.com/library/view/incident-management-for/9781491917541/) -- type: book, time: varies
- [PagerDuty Incident Response Guide](https://response.pagerduty.com/) -- type: guide, time: 1h
- [Google SRE Book - Emergency Response](https://sre.google/sre-book/emergency-response/) -- type: book, time: 20m
