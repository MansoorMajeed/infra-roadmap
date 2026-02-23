---
id: rbac-k8s
title: RBAC and Access Control in Kubernetes
zone: kubernetes-production
edges:
  to:
    - id: network-policies
      question: >-
        I've locked down who can deploy to the cluster. But I just realized any
        pod can still reach any other pod freely.
      detail: >-
        My payment service could make HTTP calls to my internal admin API. A
        compromised pod in one namespace could try to hit the database in
        another. I've controlled what people can do via kubectl, but once a pod
        is running it seems like it can talk to anything. That can't be right.
difficulty: 3
tags:
  - kubernetes
  - rbac
  - roles
  - clusterroles
  - service-accounts
  - authorization
  - k8s
  - production
  - security
category: concept
milestones:
  - >-
    Understand the RBAC building blocks: Role, ClusterRole, RoleBinding,
    ClusterRoleBinding — and when to use each
  - >-
    Know the difference between namespace-scoped Roles and cluster-wide
    ClusterRoles, and why giving everyone a ClusterRole is the common mistake
  - >-
    Set up a ServiceAccount for your CI/CD pipeline with only the permissions
    it needs — not cluster-admin
  - >-
    Know the principle of least privilege in practice: verbs (get, list, watch,
    create, delete) mapped to specific resources per namespace
  - >-
    Use kubectl auth can-i to audit what a user or service account can
    actually do
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
