---
id: k8s-for-production
title: Taking Kubernetes to Production
zone: kubernetes-production
edges:
  to:
    - id: managed-vs-self-managed
      question: >-
        Do I even need to run the cluster control plane myself, or is there a
        better way?
      detail: >-
        Setting up the control plane myself sounds like a full-time job — etcd,
        the API server, controller manager. Surely there's a way to just get a
        cluster without having to operate all of that infrastructure?
    - id: managing-k8s-manifests
      question: >-
        My YAML files are getting messy across environments. How do I manage
        this properly?
      detail: >-
        I have staging and production and I've been copying and editing YAML
        between them. It's already drifting and I'm only two environments in.
        There has to be a better approach than copy-paste.
difficulty: 2
tags:
  - kubernetes
  - production
  - k8s
  - concept
category: concept
milestones:
  - Understand what changes between local K8s and production K8s
  - >-
    Know what 'production-grade' means: HA control plane, node pools, storage
    classes
  - Understand why raw YAML manifests don't scale for real workloads
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
