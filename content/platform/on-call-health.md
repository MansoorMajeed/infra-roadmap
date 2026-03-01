---
id: on-call-health
title: Sustainable On-Call
zone: platform
edges:
  to:
    - id: escalation-policies
      question: >-
        When something goes wrong and the on-call engineer can't fix it alone,
        who do they call? What are the actual rules?
      detail: >-
        Last week a P1 went on for 40 minutes because nobody knew whether to
        call the database team or the platform team. We need a clear escalation
        chain so people can ask for help without having to figure it out under
        pressure.
    - id: reliability-roadmap
      question: >-
        The rotation is sustainable. How do I turn this into a real plan for
        improving reliability over time?
      detail: >-
        On-call is healthier now, but I'm still mostly reacting. I want to be
        more systematic — actually prioritising reliability work, tracking
        improvement, making it part of how the team operates permanently.
difficulty: 2
tags:
  - on-call
  - sre
  - burnout
  - alert-fatigue
  - toil
  - rotation
  - sustainability
category: practice
milestones:
  - >-
    Track on-call metrics: alert volume per shift, time-to-resolve, pages
    outside business hours
  - Require every actionable alert to have an associated runbook
  - >-
    Establish a policy: any alert that fires without action for N weeks gets
    deleted or silenced
  - >-
    Design an on-call rotation with reasonable primary/secondary coverage and
    handoff
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
