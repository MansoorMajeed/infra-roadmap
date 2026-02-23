---
id: "helm-for-cluster-tools"
title: "Helm for Cluster Tooling"
zone: "kubernetes-production"
edges:
  from:
    - id: "managing-k8s-manifests"
      question: "I need to install things like cert-manager and nginx-ingress. How does that work?"
  to:
    - id: "gitops-intro"
      question: "I can install cluster tools with Helm. How do I manage all of this with GitOps?"
      detail: "I've been running helm install manually whenever I set up a cluster. But I want cluster tooling to be reproducible and tracked in Git like everything else — not something I install by hand and forget about."
difficulty: 2
tags: ["kubernetes", "helm", "cert-manager", "nginx", "cluster-tools", "k8s", "charts"]
category: "tool"
milestones:
  - "Install a community chart (cert-manager, nginx-ingress, or similar)"
  - "Understand what a Helm release is and how to inspect it"
  - "Override chart values with a values.yaml file"
  - "Upgrade and rollback a Helm release"
  - "Understand why Helm is the standard for distributing community K8s software"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
