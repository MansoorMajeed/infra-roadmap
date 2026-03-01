---
id: error-budget-policy
title: Error Budget Policy
zone: platform
edges:
  to:
    - id: slo-alerting
      question: >-
        The policy is clear on paper. But how do I know the moment the budget
        starts burning — before it's too late to act?
      detail: >-
        We've agreed: when the budget drops below 50%, we stop shipping features
        and focus on reliability. But right now I only find out how much budget
        we've spent by manually checking a dashboard. I need an automatic signal
        the moment the burn rate goes high, not a surprise at the end of the month.
difficulty: 2
tags:
  - error-budget
  - slo
  - sre
  - feature-velocity
  - reliability
  - policy
category: practice
milestones:
  - Write an error budget policy document with defined thresholds (75%, 50%, 0%)
  - Understand why the error budget is a shared tool between SRE and product
  - Explain what "freezing the feature roadmap" means in practice and who decides
  - Know the difference between error budget consumption and SLO breach
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
