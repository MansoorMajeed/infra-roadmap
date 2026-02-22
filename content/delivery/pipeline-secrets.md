---
id: "pipeline-secrets"
title: "Secrets in CI/CD Pipelines"
zone: "delivery"
edges:
  from:
    - id: "github-actions"
      question: "My pipeline needs SSH keys, API tokens, passwords. Where do I put them safely?"
      detail: "The naive answer is to put credentials in your workflow YAML. That's also wrong — your YAML is in Git, and Git is forever. Secrets need to live outside your code."
  to:
    - id: "build-and-test-pipeline"
      question: "Secrets are handled. Now how do I structure the full pipeline?"
      detail: "With secrets sorted, you can build a pipeline that actually deploys: test, build, push to a registry, and deploy to your server — all automatically, without hardcoded credentials."
difficulty: 2
tags: ["secrets", "security", "ci-cd", "environment-variables", "github-secrets", "vault"]
category: "practice"
milestones:
  - "Store a secret in GitHub Actions secrets and reference it in a workflow"
  - "Understand why secrets should never appear in logs or YAML files"
  - "Know the difference between repository secrets and environment secrets"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
