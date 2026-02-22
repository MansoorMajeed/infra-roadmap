---
id: "argocd-setup"
title: "Continuous Delivery with ArgoCD"
zone: "kubernetes-production"
edges:
  from:
    - id: "gitops-intro"
      question: "My manifests are in Git — how do I make the cluster automatically apply them when I merge?"
  to:
    - id: "k8s-cicd-pipeline"
      question: "ArgoCD watches my repo. How does CI feed into this — build, push, and trigger a deploy?"
difficulty: 3
tags: ["argocd", "gitops", "kubernetes", "cd", "k8s", "deployment"]
category: "tool"
milestones:
  - "Install ArgoCD in a Kubernetes cluster"
  - "Connect ArgoCD to a Git repository"
  - "Create an ArgoCD Application pointing at a Kustomize overlay or Helm chart"
  - "Trigger a sync and watch ArgoCD reconcile the cluster"
  - "Understand sync policies: manual vs auto-sync"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
