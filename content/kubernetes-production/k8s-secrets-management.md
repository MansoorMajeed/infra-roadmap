---
id: "k8s-secrets-management"
title: "Secrets Management in Kubernetes"
zone: "kubernetes-production"
edges:
  from:
    - id: "argocd-setup"
      question: "ArgoCD is deploying my app — but where do the passwords and API keys actually live? They can't be in Git."
  to: []
difficulty: 3
tags: ["kubernetes", "secrets", "sealed-secrets", "external-secrets", "vault", "etcd", "k8s", "production"]
category: "concept"
milestones:
  - "Understand why native K8s Secrets are base64 — not encrypted — by default"
  - "Know the etcd problem: secrets are stored unencrypted unless you configure encryption at rest"
  - "Know the spectrum: Sealed Secrets → External Secrets Operator → HashiCorp Vault"
  - "Understand when to reach for each: ESO + cloud secret store is the most common production pattern"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
