---
id: "managing-k8s-manifests"
title: "Managing Kubernetes Manifests"
zone: "kubernetes-production"
edges:
  from:
    - id: "k8s-for-production"
      question: "My YAML files are getting messy across environments. How do I manage this properly?"
  to:
    - id: "kustomize-basics"
      question: "I want a simple way to manage staging and production without duplicating YAML."
    - id: "helm-for-cluster-tools"
      question: "I need to install things like cert-manager and nginx-ingress. How does that work?"
difficulty: 1
tags: ["kubernetes", "yaml", "manifests", "kustomize", "helm", "k8s"]
category: "concept"
milestones:
  - "Understand why copying YAML per environment causes drift"
  - "Know the difference between Kustomize (patching) and Helm (templating)"
  - "Know which tool fits which use case: Kustomize for your apps, Helm for community charts"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
