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
      detail: "ArgoCD watches the repo and applies what's there. But CI still needs to build the image and update the manifest. I'm not sure how CI and ArgoCD are supposed to coordinate — who updates the image tag and when?"
    - id: "k8s-secrets-management"
      question: "ArgoCD is deploying my app — but where do the passwords and API keys actually live? They can't be in Git."
      detail: "My app needs database passwords and API keys at runtime. ArgoCD applies whatever's in Git, but I can't commit secrets to Git. So where do they actually live and how does the pod get them?"
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
