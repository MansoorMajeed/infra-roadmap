---
id: kustomize-basics
title: Managing Your App with Kustomize
zone: kubernetes-production
edges:
  to:
    - id: gitops-intro
      question: Kustomize handles my manifests. How do I stop applying them by hand?
      detail: >-
        I've got Kustomize overlays for staging and production, but I'm still
        running kubectl apply -k manually after every change. I want something
        watching the repo and doing that automatically.
difficulty: 2
tags:
  - kubernetes
  - kustomize
  - manifests
  - overlays
  - environments
  - k8s
category: practice
milestones:
  - Understand the base + overlays pattern
  - Write a kustomization.yaml that patches a base manifest for staging
  - Apply a Kustomize overlay with kubectl apply -k
  - >-
    Use patches to change replica counts, image tags, and env vars per
    environment
  - Understand how ArgoCD consumes Kustomize overlays natively
---

Kustomize lets you define your Kubernetes resources once in a base, then layer environment-specific changes on top using overlays. No templating language — just patches. The same base feeds staging and production; overlays express only what's different.

<!-- DEEP_DIVE -->

## The base + overlays structure

```
my-app/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── staging/
    │   ├── kustomization.yaml
    │   └── replica-patch.yaml
    └── production/
        ├── kustomization.yaml
        └── production-patch.yaml
```

The base contains complete, valid Kubernetes manifests. The overlays reference the base and add patches. Running `kubectl apply -k overlays/production/` renders the base with the production patches applied and applies it all at once.

## The kustomization.yaml

The base `kustomization.yaml` lists the resources:

```yaml
# base/kustomization.yaml
resources:
  - deployment.yaml
  - service.yaml
```

An overlay `kustomization.yaml` references the base and adds patches:

```yaml
# overlays/production/kustomization.yaml
resources:
  - ../../base

patches:
  - path: production-patch.yaml

images:
  - name: my-app
    newTag: "v1.4.2"
```

The `images` field updates the container image tag without touching the deployment YAML.

## Common patches

**Changing replica count:**

```yaml
# overlays/production/replica-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 5
```

**Changing resource limits:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
        - name: app
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: "2"
              memory: 1Gi
```

**Adding environment variables:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
        - name: app
          env:
            - name: APP_ENV
              value: production
```

Patches are strategic merges — they merge into the base resource rather than replacing it. You only need to specify the fields you want to change.

## Applying a Kustomize overlay

```bash
# Preview what will be applied (renders the final YAML without applying)
kubectl kustomize overlays/production/

# Apply it
kubectl apply -k overlays/production/

# ArgoCD uses the same kustomize rendering internally
```

## How ArgoCD uses Kustomize

ArgoCD has native Kustomize support. When you create an Application pointing at a Kustomize overlay directory, ArgoCD runs `kustomize build` internally and applies the result. You don't need to run anything manually — ArgoCD handles it on every sync.

```yaml
# ArgoCD Application pointing at a Kustomize overlay
spec:
  source:
    repoURL: https://github.com/my-org/my-app-manifests
    targetRevision: HEAD
    path: overlays/production
```

## When Kustomize isn't enough

Kustomize has no conditionals or loops. If you need to conditionally include a resource (deploy this sidecar only in production, not staging), Kustomize can't express that cleanly. You'd either duplicate resources across overlays or switch to Helm.

For most application deployments, Kustomize is sufficient. When you find yourself fighting the patch model, that's the signal to consider Helm.

<!-- RESOURCES -->

- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/references/kustomize/) -- type: docs, time: 20m
- [Kustomize Examples](https://github.com/kubernetes-sigs/kustomize/tree/master/examples) -- type: docs, time: 20m
