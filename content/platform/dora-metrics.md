---
id: dora-metrics
title: DORA Metrics
zone: platform
edges:
  to:
    - id: chaos-engineering
      question: >-
        I can measure that we're improving. But I still want to proactively
        find the weaknesses before users do.
      detail: >-
        DORA metrics tell me we're deploying more frequently and recovering
        faster. But every incident is still a surprise. I want to go beyond
        measuring improvement and start actively hunting for what's going to
        break next — before it breaks in production.
difficulty: 2
tags:
  - dora
  - metrics
  - devops
  - sre
  - deployment-frequency
  - mttr
  - change-failure-rate
category: concept
milestones:
  - Define the four DORA metrics and what each measures
  - Instrument your delivery pipeline to collect deployment frequency and lead time
  - Know what "elite" vs "low" DORA performance looks like and what drives each
  - Understand why change failure rate and MTTR are the reliability-facing DORA metrics
---

DORA metrics are four measurements that tell you whether your engineering organization is performing well — not just individual services, but the whole delivery system. They came from the DevOps Research and Assessment team's research across thousands of organizations, and they've held up: these four metrics strongly predict organizational performance, both reliability and velocity. If you want to know whether your org is improving, these are the numbers to watch.

<!-- DEEP_DIVE -->

## The four DORA metrics

**Deployment Frequency** — How often does your organization successfully release to production? Elite organizations deploy on demand — multiple times per day. Low performers deploy once a month or less. This measures the health of your delivery pipeline: can you ship changes quickly when you need to?

**Lead Time for Changes** — How long does it take from code committed to code in production? Elite: less than one hour. Low performers: one to six months. This captures everything between commit and deploy: code review time, CI duration, manual approvals, deployment processes.

**Change Failure Rate** — What percentage of deployments cause a production incident requiring a rollback or hotfix? Elite performers: 0–15%. Low performers: 46–60%. This is the reliability-facing deployment metric. High change failure rate means your development and testing practices aren't catching problems before production.

**Time to Restore Service (MTTR)** — When a service incident occurs, how long does it take to recover? Elite: less than one hour. Low performers: one to six months (for the longest incidents). This captures the effectiveness of your incident detection, response, and resolution processes.

## Which metrics are reliability-facing

All four DORA metrics relate to reliability, but change failure rate and MTTR are the most directly connected.

**Change failure rate** tells you how often your deployments break things. Improving it requires: better automated testing, staged rollouts (canary, blue/green), feature flags that let you decouple deploy from release, and code review practices that catch defects earlier.

**MTTR** tells you how effective your incident response is. Improving it requires: better alerting that detects problems sooner, runbooks that enable faster diagnosis, and post-mortems that address root causes so the same incident doesn't recur.

## The tension between deployment frequency and change failure rate

High deployment frequency is good, but only if the change failure rate stays low. Organizations that ship frequently but break things constantly are trading velocity for stability. The goal is to increase deployment frequency without increasing change failure rate — and the key to that is progressive delivery (canary deployments, feature flags) and comprehensive automated testing.

Elite organizations achieve both: they deploy frequently and have low failure rates. This is not a coincidence — the practices that enable frequent deployment (automation, small changes, CI/CD) also reduce the blast radius of failures.

## Measuring DORA in practice

**Deployment Frequency**: count deployments to production per time period. Your CI/CD pipeline already has this data — the number of successful deployments to production.

**Lead Time**: timestamp of first commit to a branch vs. timestamp of merge to main. Requires integration with your version control system. Most CI/CD platforms or DORA-specific tools (LinearB, Sleuth, Faros) can calculate this.

**Change Failure Rate**: count deployments that caused an incident (defined as: required a rollback, hotfix, or incident declaration within some window, typically 1 hour of deployment). Manual tagging in your incident tracker, or automated correlation between deployments and incidents.

**MTTR**: timestamp of incident declaration to timestamp of resolution. Pull from your incident management tool (PagerDuty, OpsGenie).

<!-- RESOURCES -->

- [Accelerate: The Science of Lean Software and DevOps - Nicole Forsgren](https://itrevolution.com/accelerate-book/) -- type: book, time: varies
- [2023 State of DevOps Report - Google Cloud + DORA](https://dora.dev/research/2023/dora-report/) -- type: report, time: 1h
- [DORA Metrics - How to Measure - LinearB](https://linearb.io/blog/dora-metrics) -- type: article, time: 15m
