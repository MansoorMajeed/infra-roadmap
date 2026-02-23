---
id: managing-k8s-manifests
title: Managing Kubernetes Manifests
zone: kubernetes-production
edges:
  to:
    - id: kustomize-basics
      question: >-
        I want a simple way to manage staging and production without duplicating
        YAML.
      detail: >-
        I'm managing two environments and they've already drifted apart because
        I'm copy-pasting YAML and forgetting to update both. I want to define
        things once and only override what's actually different per environment.
    - id: helm-for-cluster-tools
      question: >-
        I need to install things like cert-manager and nginx-ingress. How does
        that work?
      detail: >-
        I can manage my own app manifests, but cert-manager and nginx-ingress
        are third-party software with dozens of resources I don't want to
        maintain by hand. How do people normally install and upgrade these?
difficulty: 1
tags:
  - kubernetes
  - yaml
  - manifests
  - kustomize
  - helm
  - k8s
category: concept
milestones:
  - Understand why copying YAML per environment causes drift
  - Know the difference between Kustomize (patching) and Helm (templating)
  - >-
    Know which tool fits which use case: Kustomize for your apps, Helm for
    community charts
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
