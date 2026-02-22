---
id: "manual-deploy-is-painful"
title: "Manual Deploys Are Painful"
zone: "delivery"
edges:
  from:
    - id: "deploying-your-code"
      zone: "running"
      question: "I've been deploying manually. There has to be a better way."
      detail: "You SSH in, git pull, pip install, systemctl restart — every single time. Six steps, every deploy. Miss one at 2 AM and the site is down. There is a better way."
  to:
    - id: "what-is-ci-cd"
      question: "What is CI/CD and how does it fix this?"
      detail: "CI/CD — Continuous Integration and Continuous Delivery — is the practice of automating everything from testing to deployment. Push code to Git, and a pipeline runs your tests, builds your app, and deploys it automatically."
difficulty: 1
tags: ["ci-cd", "deployment", "automation", "devops"]
category: "concept"
milestones:
  - "List every manual step in your current deploy process"
  - "Identify which steps could fail silently"
  - "Understand why manual deployments don't scale"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
