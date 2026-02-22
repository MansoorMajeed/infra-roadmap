---
id: "multi-env-k8s"
title: "Multi-Environment Promotion"
zone: "kubernetes-production"
edges:
  from:
    - id: "k8s-cicd-pipeline"
      question: "The pipeline works. How do I manage staging and production separately?"
  to: []
difficulty: 3
tags: ["kubernetes", "environments", "staging", "production", "gitops", "promotion", "k8s"]
category: "practice"
milestones:
  - "Separate staging and production into distinct namespaces or clusters"
  - "Promote a release from staging to production via a pull request"
  - "Understand environment-specific config using Helm values or Kustomize overlays"
  - "Require manual approval before production deployments"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
