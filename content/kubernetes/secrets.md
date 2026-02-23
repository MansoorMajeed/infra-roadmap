---
id: "secrets"
title: "Secrets"
zone: "kubernetes"
edges:
  from:
    - id: "configmaps"
      question: "ConfigMaps handle non-sensitive config. What about passwords, API keys, and TLS certificates?"
      detail: "Kubernetes Secrets are the resource for sensitive data. They look a lot like ConfigMaps — same injection patterns, same mounting options — but come with tighter access controls, audit logging, and optional encryption at rest. The one gotcha: Kubernetes Secrets are base64-encoded by default, not encrypted."
  to:
    - id: "autoscaling"
      question: "Config and secrets are managed. Now — how do I make my workloads scale automatically with traffic?"
      detail: "My app is running and configured correctly. But right now I have to manually change the replica count when traffic spikes. I want it to just grow when load increases and shrink when it drops — without me touching anything. How does Kubernetes do that automatically?"
    - id: "resource-requests-and-limits"
      question: "Before I set up autoscaling — I've heard Kubernetes needs resource requests defined first. What are those?"
      detail: "I want autoscaling to work, but I have a feeling I'm missing something. My Pods don't have resource requests set — does that matter? How does Kubernetes even know what 'high load' means for my app if I haven't told it how much CPU or memory each Pod is supposed to use?"
difficulty: 1
tags: ["kubernetes", "secrets", "security", "credentials", "encryption", "external-secrets", "k8s"]
category: "practice"
milestones:
  - "Create a Secret and inject it as an environment variable into a Pod"
  - "Understand why base64 encoding is not encryption"
  - "Enable encryption at rest for Secrets in etcd"
  - "Use the External Secrets Operator to sync a secret from AWS Secrets Manager or Vault"
---

Kubernetes Secrets hold sensitive data — passwords, API keys, TLS certificates, tokens. They look and work like ConfigMaps but with tighter access controls and optional encryption at rest. The critical caveat: Kubernetes Secrets are base64-encoded by default, which is encoding, not encryption.

<!-- DEEP_DIVE -->

## What Secrets are (and aren't)

A Kubernetes Secret stores sensitive data as key-value pairs. You inject it as environment variables or mount it as files, exactly like a ConfigMap. The difference is in the access model:

- Secrets require explicit RBAC permissions to read (whereas ConfigMaps in the same namespace are broadly readable)
- Kubernetes can audit Secret access separately
- etcd can encrypt Secrets at rest (not enabled by default on most clusters)
- Values are base64-encoded in the API (not plain text like ConfigMap data)

**Base64 is not encryption.** Anyone who can read a Secret can base64-decode it in seconds. The security comes from RBAC and etcd encryption, not from the encoding format.

## Creating a Secret

Imperatively (kubectl handles the base64 encoding for you):

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=postgres \
  --from-literal=password=supersecret
```

Or from YAML (you must base64-encode the values yourself):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: default
type: Opaque
data:
  username: cG9zdGdyZXM=      # base64("postgres")
  password: c3VwZXJzZWNyZXQ=  # base64("supersecret")
```

## Injecting Secrets into Pods

As environment variables — all keys:

```yaml
envFrom:
  - secretRef:
      name: db-credentials
```

Selectively:

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: password
```

As mounted files (for TLS certs, kubeconfig files, SSH keys):

```yaml
volumeMounts:
  - name: certs
    mountPath: /etc/ssl/certs
    readOnly: true
volumes:
  - name: certs
    secret:
      secretName: my-tls-cert
```

## Encryption at rest

By default, Secrets are stored unencrypted in etcd. Anyone with direct etcd access can read them. To enable encryption, configure an `EncryptionConfiguration` on the API server to encrypt Secret data using AES-GCM, AES-CBC, or a KMS provider. On managed clusters, EKS and GKE offer this as a configurable option — enable it.

## Don't put Secrets in Git

The obvious problem with Kubernetes Secrets as YAML files: you can't commit them to Git without committing the secrets. Two common solutions:

**External Secrets Operator (ESO)** — you write an `ExternalSecret` resource that references a secret in an external store (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager). ESO fetches the value and creates a regular Kubernetes Secret. Your Git repository only contains the reference, never the value. This is the recommended approach for GitOps workflows.

**Sealed Secrets** — you encrypt Secrets with a public key, commit the encrypted `SealedSecret` to Git, and a controller in the cluster decrypts them using the private key. The encrypted form is safe to commit; only the controller can decrypt it.

<!-- RESOURCES -->

- [Kubernetes Docs - Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) -- type: docs, time: 25m
- [External Secrets Operator](https://external-secrets.io/) -- type: tool, time: 30m
- [Sealed Secrets - Bitnami](https://github.com/bitnami-labs/sealed-secrets) -- type: tool, time: 20m
- [Kubernetes Secret Encryption at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/) -- type: docs, time: 20m
