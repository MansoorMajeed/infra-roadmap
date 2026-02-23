---
id: "gitops-intro"
title: "GitOps: Git as the Source of Truth"
zone: "kubernetes-production"
edges:
  from:
    - id: "kustomize-basics"
      question: "I can manage my own app manifests with Kustomize. How do I automate deployments?"
    - id: "helm-for-cluster-tools"
      question: "I'm managing cluster tooling with Helm. How do I tie this all together with GitOps?"
  to:
    - id: "argocd-setup"
      question: "My manifests are in Git — how do I make the cluster automatically apply them when I merge?"
      detail: "I've been running kubectl apply by hand after every change, which is error-prone and means I could forget a step. I want merging a PR to be what actually triggers the deployment — but I'm not sure what's doing the watching and applying."
difficulty: 2
tags: ["gitops", "kubernetes", "argocd", "flux", "deployment", "k8s"]
category: "concept"
milestones:
  - "Understand the GitOps model: Git is the desired state, the operator reconciles"
  - "Know the difference between push-based and pull-based deployments"
  - "Understand why GitOps gives you a free audit trail and rollback path"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
