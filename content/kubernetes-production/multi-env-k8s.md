---
id: "multi-env-k8s"
title: "Multi-Environment Promotion"
zone: "kubernetes-production"
edges:
  from:
    - id: "k8s-cicd-pipeline"
      question: "The pipeline works. How do I manage staging and production separately?"
  to:
    - id: "resource-requests-limits"
      question: "My app is deployed across environments — but how do I make sure it doesn't starve or take down other pods?"
      detail: "In staging I don't care much about resource usage. But in production I worry that one misbehaving pod could consume all the memory and take everything else down with it. How do I actually prevent that?"
    - id: "service-mesh-problems"
      question: "Everything is running. But how do services talk to each other securely, and how do I know what's going wrong?"
      detail: "My services communicate over plain HTTP inside the cluster. I've heard that's not great from a security standpoint. And when a request fails somewhere in the chain, I have no visibility into which service is responsible."
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
