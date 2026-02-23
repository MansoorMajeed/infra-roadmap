---
id: "k8s-cicd-pipeline"
title: "CI/CD Pipeline for Kubernetes"
zone: "kubernetes-production"
edges:
  from:
    - id: "argocd-setup"
      question: "ArgoCD is watching my repo. How does CI feed into this?"
  to:
    - id: "multi-env-k8s"
      question: "The pipeline works for one environment. How do I promote between staging and production?"
      detail: "Right now everything that merges to main goes straight to production. I want to deploy to staging first, verify it works, and then promote deliberately — not push to prod automatically on every commit."
difficulty: 3
tags: ["ci-cd", "kubernetes", "gitops", "argocd", "github-actions", "containers", "k8s"]
category: "practice"
milestones:
  - "Build and push a container image on every commit to main"
  - "Update the image tag in the Helm values file (or Kustomize overlay) via CI"
  - "Have ArgoCD pick up the change and deploy it automatically"
  - "Understand the full loop: commit → build → push → update manifest → ArgoCD syncs"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
