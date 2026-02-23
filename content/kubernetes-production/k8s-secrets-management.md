---
id: k8s-secrets-management
title: Secrets Management in Kubernetes
zone: kubernetes-production
edges:
  to:
    - id: rbac-k8s
      question: >-
        I've got secrets stored safely. But how do I control which services and
        people are actually allowed to read them?
      detail: >-
        Any pod that knows the secret name can read it right now. I need a way
        to say "only the payment service gets the payment API key" — not just
        control what's in the secret, but who can access it.
difficulty: 3
tags:
  - kubernetes
  - secrets
  - sealed-secrets
  - external-secrets
  - vault
  - etcd
  - k8s
  - production
category: concept
milestones:
  - Understand why native K8s Secrets are base64 — not encrypted — by default
  - >-
    Know the etcd problem: secrets are stored unencrypted unless you configure
    encryption at rest
  - >-
    Know the spectrum: Sealed Secrets → External Secrets Operator → HashiCorp
    Vault
  - >-
    Understand when to reach for each: ESO + cloud secret store is the most
    common production pattern
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
