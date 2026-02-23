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

Kubernetes Secrets are not secret by default. They're base64-encoded — which is encoding, not encryption. Anyone with read access to the Secret object sees the value. And if you commit them to Git, they're effectively plaintext in your repository history. Production requires a real secrets strategy.

<!-- DEEP_DIVE -->

## The native Secret problem

```bash
kubectl get secret my-db-password -o jsonpath='{.data.password}' | base64 -d
```

That's all it takes to read a Kubernetes Secret if you have `get` permission on secrets in that namespace. Base64 is trivially reversible.

By default, etcd also stores secrets unencrypted. If someone gains access to etcd — or an etcd backup — they have all your secrets. This is configurable: Kubernetes supports encryption at rest for etcd, which managed clusters like GKE enable by default, while self-managed clusters require explicit configuration.

## Option 1: Sealed Secrets

Sealed Secrets (by Bitnami) lets you commit encrypted secrets to Git. A controller in the cluster holds a private key. You encrypt secrets with the corresponding public key using the `kubeseal` CLI. The encrypted `SealedSecret` is safe to commit — only the cluster's controller can decrypt it.

```bash
kubectl create secret generic db-password \
  --from-literal=password=supersecret \
  --dry-run=client -o yaml | \
  kubeseal --format yaml > sealed-db-password.yaml
```

Commit `sealed-db-password.yaml`. The controller decrypts it and creates the actual Kubernetes Secret. If someone gets your Git repo, they see ciphertext, not the password.

Limitation: if you lose the cluster's private key, you lose the ability to decrypt. Key rotation is manual and requires re-sealing every secret. Good for simple setups; gets unwieldy at scale.

## Option 2: External Secrets Operator (ESO)

ESO syncs secrets from external secret stores (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault) into Kubernetes Secrets automatically.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-password
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore
  target:
    name: db-password       # name of the Kubernetes Secret to create
  data:
    - secretKey: password
      remoteRef:
        key: production/db-password   # key in AWS Secrets Manager
```

ESO creates and updates the Kubernetes Secret from the external store. Your manifests in Git reference only the ExternalSecret definition — no secret values in Git at all. The actual values live in the cloud secret store.

This is the most common production pattern for cloud-hosted clusters. AWS Secrets Manager, GCP Secret Manager, and Azure Key Vault are all first-class citizens.

## Option 3: HashiCorp Vault

Vault is a full-featured secrets management platform: dynamic secrets, PKI, database credential rotation, audit logging. It can generate short-lived database credentials that expire automatically rather than long-lived static passwords.

The power: a compromised Kubernetes Secret is just a credential that expires soon. Vault's dynamic secrets significantly reduce the blast radius of credential exposure.

The cost: Vault is a complex system to operate. High availability Vault requires distributed consensus (Raft or Consul). You're now running infrastructure to manage your infrastructure.

Vault makes sense when you have: complex credential rotation requirements, strict audit requirements, or multiple platforms (Kubernetes and non-Kubernetes systems) that need centralized secrets.

## The rule: never commit plaintext secrets to Git

Not in comments. Not in values files. Not "just temporarily." Git history is forever, and secret-scanning tools will find them. If you've ever committed a secret, rotate it immediately — you cannot reliably expunge it from Git history everywhere it's been cloned.

Use `.gitignore` to prevent accidental commits. Use pre-commit hooks or tools like `git-secrets` to block them at the commit stage.

## The most common production choice

**ESO + your cloud provider's secret store** is where most teams end up. It's operationally simple (ESO is a single Helm chart), integrates with IAM for access control, and keeps values out of Git entirely. Start here.

<!-- RESOURCES -->

- [Kubernetes Docs - Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) -- type: docs, time: 15m
- [External Secrets Operator](https://external-secrets.io/latest/) -- type: docs, time: 25m
- [Sealed Secrets](https://sealed-secrets.netlify.app/) -- type: docs, time: 20m
