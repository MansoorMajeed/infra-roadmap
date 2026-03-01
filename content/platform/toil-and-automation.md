---
id: toil-and-automation
title: Toil and Automation
zone: platform
edges:
  to:
    - id: runbooks-and-playbooks
      question: >-
        Before I can automate any of this, I feel like I need to write down how
        we actually handle things. Where do I start?
      detail: >-
        Half of our operational knowledge lives in people's heads. When
        something breaks, whoever's on call figures it out from scratch every
        time. I want to capture that, but I've seen runbooks that are out of
        date the moment they're written — so what makes one actually useful?
difficulty: 2
tags:
  - toil
  - automation
  - sre
  - operational-work
  - on-call
  - efficiency
category: concept
milestones:
  - >-
    Define toil using the SRE definition: manual, repetitive, automatable,
    scales with traffic
  - Audit your current operational work and classify it as toil or not toil
  - Identify your top three sources of toil and pick one to automate
  - Understand the 50% toil cap and why exceeding it is unsustainable
---

Toil is the operational work that keeps systems running today but doesn't make them better tomorrow. Restarting services. Processing manual deployment requests. Running the same diagnostic script every week. Answering tickets that ask the same question. Every hour spent on toil is an hour not spent on engineering work that would reduce toil. Left unchecked, toil grows with scale — more services, more traffic, more toil — until it consumes the entire team.

<!-- DEEP_DIVE -->

## The SRE definition of toil

The Google SRE book gives toil a precise definition with six characteristics:

**Manual** — it requires a human to do it. Not automated, not running by itself.

**Repetitive** — you've done it before and will do it again. Not a one-off.

**Automatable** — a machine could do it with sufficient engineering investment.

**Reactive** — triggered by external events, not by the team's own planned work. Pages, tickets, customer requests.

**Scales with service growth** — more users or traffic means more toil, not the same amount. This is the key sign that toil is structural, not incidental.

**Low value** — toil keeps the lights on but doesn't improve the system. It has no cumulative benefit. Doing it today doesn't make tomorrow better.

Not all operational work is toil. Building a new monitoring dashboard is not toil — it has lasting value. Writing a runbook that will be used for years is not toil. Responding to a novel incident that teaches you something new is not toil. Toil is specifically the repetitive, low-value work that scales with the system.

## The 50% toil cap

Google SRE sets a firm limit: SREs should spend no more than 50% of their time on toil. The rest goes to engineering work — projects that reduce toil, improve reliability, or build new capabilities. This isn't a suggestion. If an SRE regularly exceeds 50% toil, that's a management problem — the team is being used as operational staff rather than engineers.

Why 50%? Below that threshold, toil is manageable and the team has time to invest in reducing it. Above it, toil crowds out the engineering work that would reduce toil, creating a death spiral: more toil → less time for automation → toil continues to grow → even less time for automation.

## Identifying and measuring toil

You can't manage what you don't measure. Start by auditing the operational work your team does over a two-week period:

1. List every recurring task — weekly, daily, or per-incident
2. Estimate the time per occurrence and frequency
3. Classify each as toil or legitimate engineering work
4. Calculate the total toil burden as a percentage of team capacity

Once you have the list, prioritize by impact: which toil takes the most time? Which is growing fastest? Which is most automatable? Pick one. Build the automation. Measure the reduction.

## What automation means in practice

Automation isn't always a sophisticated system. Sometimes it's:

- A script that runs the 15-step diagnostic process automatically
- A Kubernetes operator that handles the restart logic that on-call engineers do manually
- A runbook converted into a self-service form that developers can fill out without filing a ticket
- A pre-built dashboard that answers the three questions people always ask during incidents

The automation spectrum runs from "manual" to "fully automated with no human in the loop." You don't have to reach full automation to get value. A script that does 80% of the work and prompts a human for the last decision is dramatically better than 100% manual.

<!-- RESOURCES -->

- [Google SRE Book - Eliminating Toil](https://sre.google/sre-book/eliminating-toil/) -- type: book, time: 20m
- [Measuring and Reducing Toil - Google SRE Workbook](https://sre.google/workbook/toil-budgets/) -- type: book, time: 20m
