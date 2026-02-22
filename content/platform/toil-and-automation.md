---
id: "toil-and-automation"
title: "Toil and Automation"
zone: "platform"
edges:
  from:
    - id: "what-is-sre"
      question: "SRE is about engineering away operational work. What exactly is toil?"
      detail: "Not all operational work is toil. Toil is the subset that is manual, repetitive, automatable, and scales with traffic — it grows as your system grows instead of compounding in value. The SRE mandate is to keep toil under 50% of your time, and spend the rest building the systems that eliminate it."
  to:
    - id: "error-budgets-in-practice"
      question: "I'm automating away toil. How do I use error budgets to decide when to prioritise reliability work vs new features?"
      detail: "Toil reduction is internal — it makes your team more efficient. Error budgets are external — they govern the relationship between reliability and feature velocity. When the error budget is healthy, you ship features. When it's burning, you stop and fix things."
    - id: "on-call-health"
      question: "A huge source of toil is bad on-call. How do I make on-call sustainable?"
      detail: "On-call is where toil hurts most: manual interventions at 3 AM, the same alert for the sixth time this week, runbooks that don't actually work. Sustainable on-call is a practice — measuring alert volume, requiring actionable alerts, and enforcing toil budgets for the on-call rotation."
difficulty: 2
tags: ["toil", "automation", "sre", "operational-work", "on-call", "efficiency"]
category: "concept"
milestones:
  - "Define toil using the SRE definition: manual, repetitive, automatable, scales with traffic"
  - "Audit your current operational work and classify it as toil or not toil"
  - "Identify your top three sources of toil and pick one to automate"
  - "Understand the 50% toil cap and why exceeding it is unsustainable"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
