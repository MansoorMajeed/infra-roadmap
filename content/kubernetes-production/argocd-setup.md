---
id: argocd-setup
title: Continuous Delivery with ArgoCD
zone: kubernetes-production
edges:
  to:
    - id: k8s-cicd-pipeline
      question: >-
        ArgoCD watches my repo. How does CI feed into this — build, push, and
        trigger a deploy?
      detail: >-
        ArgoCD watches the repo and applies what's there. But CI still needs to
        build the image and update the manifest. I'm not sure how CI and ArgoCD
        are supposed to coordinate — who updates the image tag and when?
    - id: k8s-secrets-management
      question: >-
        ArgoCD is deploying my app — but where do the passwords and API keys
        actually live? They can't be in Git.
      detail: >-
        My app needs database passwords and API keys at runtime. ArgoCD applies
        whatever's in Git, but I can't commit secrets to Git. So where do they
        actually live and how does the pod get them?
difficulty: 3
tags:
  - argocd
  - gitops
  - kubernetes
  - cd
  - k8s
  - deployment
category: tool
milestones:
  - Install ArgoCD in a Kubernetes cluster
  - Connect ArgoCD to a Git repository
  - Create an ArgoCD Application pointing at a Kustomize overlay or Helm chart
  - Trigger a sync and watch ArgoCD reconcile the cluster
  - 'Understand sync policies: manual vs auto-sync'
---

ArgoCD is a Kubernetes controller that watches Git repositories and keeps your cluster synchronized with what's there. You define your desired state in Git — as Kustomize overlays, Helm charts, or plain manifests — and ArgoCD continuously reconciles the cluster to match.

<!-- DEEP_DIVE -->

## Installing ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Or via Helm:

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd -n argocd --create-namespace
```

After installation, access the UI by port-forwarding (or exposing via Ingress):

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Get the initial admin password:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

## The Application CRD

An ArgoCD Application is a CRD that describes what to sync: where the source is and where to apply it.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/my-app-manifests
    targetRevision: HEAD
    path: overlays/production          # Kustomize overlay path
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true        # delete resources removed from Git
      selfHeal: true     # revert manual changes to the cluster
```

For Helm:

```yaml
source:
  repoURL: https://charts.jetstack.io
  chart: cert-manager
  targetRevision: v1.14.0
  helm:
    values: |
      replicaCount: 2
```

## Sync policies: manual vs automatic

**Manual sync** — ArgoCD detects drift and shows the app as `OutOfSync` in the UI. A human clicks "Sync" to apply the changes. Good for production if you want a human in the loop for every deployment.

**Automatic sync** — ArgoCD applies changes as soon as they're detected in Git. Combined with `selfHeal: true`, it also reverts manual changes to the cluster. Good for non-production environments or teams comfortable with continuous deployment.

**prune: true** — resources deleted from Git are also deleted from the cluster. Without this, removed resources linger indefinitely. Enable it — otherwise GitOps isn't actually authoritative.

## Sync waves for ordering

Some resources must exist before others. CRDs before the resources that use them. Namespaces before the resources inside them. ArgoCD sync waves handle this:

```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "0"   # apply first
```

Lower wave numbers apply before higher ones. All wave 0 resources must be healthy before wave 1 begins.

## RBAC in ArgoCD

By default, all logged-in users have read-only access. Define policies to control who can sync which applications:

```yaml
# argocd-rbac-cm ConfigMap
data:
  policy.csv: |
    p, role:developers, applications, sync, production/*, deny
    p, role:developers, applications, sync, staging/*, allow
    g, my-team, role:developers
```

Developers can sync staging but not production — production requires a senior engineer or automated promotion.

## The App of Apps pattern

For managing multiple ArgoCD Applications, use the "App of Apps" pattern: one ArgoCD Application whose source is a directory of Application manifests. ArgoCD deploys the Application manifests, which then bootstrap all the other applications. Your entire cluster state is expressed as Applications in Git.

<!-- RESOURCES -->

- [ArgoCD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/) -- type: docs, time: 30m
- [ArgoCD Application CRD Reference](https://argo-cd.readthedocs.io/en/stable/operator-manual/application.yaml/) -- type: docs, time: 15m
