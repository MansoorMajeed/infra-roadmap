---
id: runbooks-and-playbooks
title: Runbooks and Playbooks
zone: platform
edges:
  to:
    - id: on-call-health
      question: >-
        I've got runbooks written. But the on-call rotation is still miserable
        — people are dreading it.
      detail: >-
        The documentation helps a bit, but we're still getting paged too much
        and for things that don't actually need immediate action. The rotation
        feels unfair, people are burning out, and I'm not sure how to fix the
        human side of it.
difficulty: 2
tags:
  - runbooks
  - playbooks
  - on-call
  - documentation
  - incident-response
  - sre
category: practice
milestones:
  - Write a runbook for a real alert in your system
  - Include decision trees and exact copy-paste commands — not vague steps
  - Verify the runbook by having someone else follow it without your help
  - Establish a process for keeping runbooks up to date after incidents
---

Right now, when something breaks at 3 AM, the on-call engineer figures it out from scratch. They dig through Slack history, they call the person who built the thing, they try things until something works. Every incident is an improvisation. A runbook changes this: it's the documented procedure for diagnosing and resolving a specific alert or failure mode. When a runbook exists and is good, an engineer who has never seen that system before can follow it and resolve the incident. That's the bar.

<!-- DEEP_DIVE -->

## Runbooks vs playbooks

These terms are often used interchangeably, but there's a useful distinction:

**Runbooks** are procedure documents for specific operational tasks — usually tied to a specific alert or system. "When you get paged for high connection pool utilization on the checkout database, do this." Runbooks are prescriptive and specific.

**Playbooks** are higher-level guides for incident response — they cover patterns and decision trees rather than specific procedures. "When responding to an incident, follow these steps to diagnose the layer at which the failure is occurring." Playbooks guide judgment; runbooks guide action.

In practice, "runbook" is used for both. The key is that the document gives you what you need to act without requiring improvisation.

## What makes a runbook actually useful

Most runbooks fail because they describe what happens, not what to do. "If you see this alert, investigate the database connections" is not a runbook. It's a summary of the alert you just read.

A useful runbook has:

**Context**: What does this alert mean? What's the blast radius? What are the symptoms users are experiencing?

**Immediate triage questions**: Is this a partial failure or complete? Has traffic volume changed? Did a recent deployment happen?

**Step-by-step diagnosis**: Exact commands to run, with expected output. `kubectl get pods -n checkout | grep -v Running` — not "check if pods are running."

**Remediation steps**: What to actually do. With rollback instructions if the fix makes things worse.

**Escalation criteria**: When does this alert require waking someone up vs. it can wait until morning? Who do you escalate to?

**Post-resolution**: What to note in the incident log. Whether a post-mortem is needed.

## Copy-paste commands are good, not lazy

Some engineers feel that providing copy-paste commands in runbooks is hand-holding. The opposite is true. When an engineer is paged at 3 AM, their cognitive capacity is reduced. They shouldn't be constructing complex commands from memory. Give them the exact command. If the command needs a variable they'll have to fill in (like a pod name), use clear placeholders: `kubectl delete pod <POD_NAME> -n checkout`.

## Keeping runbooks current

Runbooks go stale. Systems change. The top cause of stale runbooks is that the post-mortem action item "update the runbook" never gets done.

Two practices that help:

**Include a "last verified" date in the runbook.** Make it policy that any engineer who uses a runbook during an incident is expected to update it with any corrections or additions within 24 hours afterward.

**Runbooks-as-code.** Store runbooks in the same Git repository as the system they document, alongside the alerting rules that reference them. When you change an alert, you change the runbook. Review them in PRs.

<!-- RESOURCES -->

- [PagerDuty Runbook Guide](https://response.pagerduty.com/oncall/alerting_principles/) -- type: guide, time: 15m
- [How to Write a Runbook That People Actually Use](https://www.transposit.com/devops-wiki/devops-practice/runbook/) -- type: article, time: 10m
- [Google SRE Book - Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/) -- type: book, time: 20m
