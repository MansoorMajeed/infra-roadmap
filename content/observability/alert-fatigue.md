---
id: alert-fatigue
title: Alert Fatigue
zone: observability
edges:
  to:
    - id: symptom-vs-cause-alerting
      question: >-
        I've cut down the alert count. But when something breaks I still get
        30 alerts firing at once and I can't tell which is the real problem.
      detail: >-
        Fewer alerts helped but now every real incident floods us with alerts
        at once. The database is slow, so the API is slow, so all five
        downstream services start alerting too. I'm trying to debug through a
        wall of noise. Surely I should only be alerted about the one thing that
        actually matters.
difficulty: 2
tags:
  - alerting
  - alert-fatigue
  - on-call
  - observability
category: concept
milestones:
  - Identify which of your current alerts are noisy and non-actionable
  - Understand the alert debt cycle and how it leads to ignored pages
  - Audit your alert history and calculate what percentage led to real action
  - Set a policy for what makes an alert worth sending at all
---

Alert fatigue is what happens when your alerting system has cried wolf too many times. The team starts treating pages as background noise — silencing them, acknowledging without looking, or just learning to sleep through the phone. Then a real incident happens, a page fires into the noise, and nobody responds in time. It's one of the most common ways that a monitoring system that looks good on paper completely fails in practice.

The insidious thing about alert fatigue is that it builds gradually. You add an alert here, another there, a few more after an incident post-mortem. Each individual alert seemed reasonable when you wrote it. But they accumulate, overlap, and fire for things that don't require human action. After enough of that, the team's unconscious response to a page becomes "probably nothing" — which is exactly backwards from what alerting is supposed to accomplish.

The fix isn't to silence alerts or lower volumes. It's to fix the quality. Every alert that fires should require a human decision. If someone's response to a page is to look at it, decide nothing needs to be done, and go back to sleep — that alert should not exist in its current form. Either the condition is genuinely fine and the alert threshold is wrong, or the condition is real but not urgent enough to page (lower its severity to a ticket). Either way, the alert as-is is making your on-call worse.

<!-- DEEP_DIVE -->

## The Alert Debt Cycle

Alert fatigue follows a predictable cycle, and understanding it makes it easier to break.

It starts with **alert accumulation**. Alerts get added over time — after incidents, out of caution, because someone thought a metric looked interesting to watch. Nobody removes old ones. The total count climbs.

Then comes **routine noise**. Some of those alerts fire regularly for conditions that turn out to be fine. The team investigates once or twice, finds nothing, and starts treating that alert as known noise. They still acknowledge it (the system requires it), but they've stopped actually looking.

That leads to **desensitization**. When you've acknowledged 200 false alarms, your brain stops treating a page as a signal that something is wrong. It becomes an administrative task: silence, continue sleeping, deal with it in the morning.

Finally: **missed incidents**. A real problem fires an alert that looks exactly like the noise. It gets silenced or ignored. The incident gets worse while nobody responds. The post-mortem asks "why didn't anyone respond to the alert?" — and the real answer is that the alerting system had long since lost the team's trust.

## Auditing Your Alerts

The most direct way to address alert fatigue is to pull your alert history and measure it. Most alerting systems (PagerDuty, Opsgenie, Alertmanager with a logging backend) give you the ability to export alert events. You want at minimum 30 days of data, ideally 90.

For each alert that fired in that period, answer two questions:

1. Did this alert lead to real action? (a code change, a config fix, an infrastructure change, a rollback — something that addressed a real problem)
2. Was the action taken within a reasonable time of the alert, or did someone investigate and find nothing?

You'll typically find that a large fraction of alerts — often 50% or more in teams that haven't audited before — led to no action. Those are candidates for remediation.

For each no-action alert, you have exactly three options:

**Delete it.** If the condition it detected was never actually a problem, the alert was wrong. Remove it. Don't keep it "just in case."

**Downgrade its severity.** If the condition is real but doesn't require immediate human action, make it a ticket or a Slack notification instead of a page. It stays in your awareness without destroying on-call quality.

**Fix the underlying issue.** Sometimes an alert fires constantly because the underlying system is in a perpetual state it shouldn't be in. The right fix isn't to silence the alert — it's to fix the system so the condition goes away.

## Setting a Standard for What Gets to Page

After an audit, write down a policy. It doesn't have to be long. Something like:

> An alert gets page severity if and only if: a user is experiencing degraded service right now, AND a human action in the next 30 minutes can meaningfully improve the situation.

That second clause is important and often overlooked. If your database is down and there's nothing an engineer can do at 3am to recover it any faster, paging everyone on the team doesn't help users — it just exhausts the people who would need to do real work in the morning.

A useful question for every alert: **what exactly should the person who receives this do?** If you can't write a clear answer, the alert isn't ready to page. Put it in a ticket channel until you've written the runbook.

## The Ratio to Aim For

A healthy on-call rotation has a very high ratio of actionable alerts to total alerts. Some teams aim for 80-90%+ of pages requiring real action. This isn't about being cavalier with monitoring — it's about respecting that every page has a cost (interrupted sleep, on-call burnout, eroded trust in the system) and that cost should be paid only when the benefit is real.

When you hit a stretch of on-call where almost every page requires real action, two things happen: the team trusts the alerts, and the people who carry the pager feel like the system is working for them instead of against them. That's the goal.

## Ongoing Maintenance

Alert debt accumulates again if you don't maintain it. A few practices that help:

Run a monthly alert review. Look at which alerts fired in the past month and whether each one resulted in action. Make the review a team ritual, not an individual burden.

After every incident post-mortem, add new alerts deliberately — but also ask whether existing alerts contributed to noise during the incident and whether they should be tuned or removed.

Make it easy to delete alerts. Teams often keep bad alerts because removing one feels risky. A better frame: if an alert isn't earning its place, it's actively making things worse by being there.

<!-- RESOURCES -->

- [My Philosophy on Alerting (Rob Ewaschuk, Google)](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit) -- type: article, time: 20m
- [On-Call Shouldn't Suck (Charity Majors)](https://charity.wtf/2020/10/03/on-call-shouldnt-suck-a-guide-for-managers/) -- type: article, time: 15m
- [Alert Fatigue: Causes, Effects, and Solutions (PagerDuty)](https://www.pagerduty.com/resources/learn/alert-fatigue/) -- type: article, time: 10m
- [Alerting on What Matters (Prometheus docs)](https://prometheus.io/docs/practices/alerting/) -- type: article, time: 15m
- [The Practical Guide to Incident Management (Atlassian)](https://www.atlassian.com/incident-management) -- type: article, time: 20m
