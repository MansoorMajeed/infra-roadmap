---
id: helm-for-cluster-tools
title: Helm for Cluster Tooling
zone: kubernetes-production
edges:
  to:
    - id: gitops-intro
      question: >-
        I can install cluster tools with Helm. How do I manage all of this with
        GitOps?
      detail: >-
        I've been running helm install manually whenever I set up a cluster. But
        I want cluster tooling to be reproducible and tracked in Git like
        everything else — not something I install by hand and forget about.
difficulty: 2
tags:
  - kubernetes
  - helm
  - cert-manager
  - nginx
  - cluster-tools
  - k8s
  - charts
category: tool
milestones:
  - 'Install a community chart (cert-manager, nginx-ingress, or similar)'
  - Understand what a Helm release is and how to inspect it
  - Override chart values with a values.yaml file
  - Upgrade and rollback a Helm release
  - Understand why Helm is the standard for distributing community K8s software
---

Helm is how the Kubernetes community distributes software. cert-manager, nginx-ingress, Prometheus, ArgoCD, Grafana — all available as Helm charts. Instead of maintaining dozens of YAML files for a third-party tool, you install a chart, customize it with a values file, and let Helm manage it from there.

<!-- DEEP_DIVE -->

## What a Helm chart is

A Helm chart is a packaged Kubernetes application: Go templates, default values, CRD definitions, RBAC, and all the resources needed to run the software. When you `helm install`, Helm renders the templates with your values and applies the resulting YAML to the cluster.

A Helm release is an instance of a chart running in your cluster. You can have multiple releases of the same chart (two nginx-ingress controllers for different use cases, for example).

## Installing a chart

```bash
# Add the chart repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.0 \
  --set crds.enabled=true
```

Pin the version. Using `--version` ensures you know exactly what you're running. Omitting it gives you whatever's latest — which changes when you reinstall.

## Customizing with values

Helm charts expose configuration through a values file. Override the defaults you care about:

```yaml
# cert-manager-values.yaml
replicaCount: 2
resources:
  requests:
    cpu: 100m
    memory: 128Mi

prometheus:
  enabled: true
  servicemonitor:
    enabled: true
```

```bash
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  -f cert-manager-values.yaml \
  --version v1.14.0
```

Always read the chart's default `values.yaml` before installing. It documents every knob available.

## Inspecting and upgrading a release

```bash
# List releases
helm list -A

# See what values a release is using
helm get values cert-manager -n cert-manager

# Upgrade to a new version
helm upgrade cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  -f cert-manager-values.yaml \
  --version v1.15.0

# Roll back if the upgrade broke something
helm rollback cert-manager 1 -n cert-manager
```

## Don't put secrets in values

Helm values files end up in the cluster as a ConfigMap (readable by anyone with access). Never put passwords, API keys, or tokens in a values file. Use External Secrets Operator or Sealed Secrets for secrets that Helm-managed charts need.

## Storing values in Git (the GitOps pattern)

Your values files belong in Git, versioned and reviewable:

```
cluster/
├── cert-manager/
│   ├── values.yaml
│   └── namespace.yaml
└── nginx-ingress/
    └── values.yaml
```

If you're using ArgoCD, create an Application for each Helm release. ArgoCD will reconcile the Helm release from Git, including when you upgrade the chart version by editing the Application's `targetRevision`.

This is the right production pattern: no one runs `helm install` on a laptop. Changes go through Git and are applied by the GitOps operator.

<!-- RESOURCES -->

- [Helm Documentation](https://helm.sh/docs/) -- type: docs, time: 25m
- [Helm Hub / Artifact Hub](https://artifacthub.io/) -- type: tool, time: 10m
