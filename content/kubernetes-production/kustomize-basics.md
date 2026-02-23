---
id: "kustomize-basics"
title: "Managing Your App with Kustomize"
zone: "kubernetes-production"
edges:
  from:
    - id: "managing-k8s-manifests"
      question: "I want a simple way to manage staging and production without duplicating YAML."
  to:
    - id: "gitops-intro"
      question: "Kustomize handles my manifests. How do I stop applying them by hand?"
      detail: "I've got Kustomize overlays for staging and production, but I'm still running kubectl apply -k manually after every change. I want something watching the repo and doing that automatically."
difficulty: 2
tags: ["kubernetes", "kustomize", "manifests", "overlays", "environments", "k8s"]
category: "practice"
milestones:
  - "Understand the base + overlays pattern"
  - "Write a kustomization.yaml that patches a base manifest for staging"
  - "Apply a Kustomize overlay with kubectl apply -k"
  - "Use patches to change replica counts, image tags, and env vars per environment"
  - "Understand how ArgoCD consumes Kustomize overlays natively"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
