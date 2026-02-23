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

Raw Kubernetes YAML works fine for one service in one environment. It breaks down the moment you have staging and production, or multiple services, or multiple teams. You end up copy-pasting files, editing them slightly per environment, and slowly losing track of what's running where.

<!-- DEEP_DIVE -->

## The copy-paste drift problem

The naive approach: copy `deployment.yaml` to `deployment-staging.yaml` and `deployment-production.yaml`. Change the image tag, the replica count, the resource limits. Two weeks later, you add an environment variable to staging and forget to add it to production. A month later, the staging config has drifted so far from production that "it works in staging" is meaningless.

The problem isn't discipline — it's that copy-paste YAML has no mechanism to express "this file is staging's version of that file." There's no link. Changes to one don't flow to the other.

## Kustomize: patches on a base

Kustomize takes a different approach: define the base resource once, then define environment-specific overlays that patch only what's different.

```
├── base/
│   ├── deployment.yaml      # replica: 1, image: my-app:latest
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── staging/
    │   └── kustomization.yaml   # patches: replica count, image tag
    └── production/
        └── kustomization.yaml   # patches: higher replicas, limits
```

When you add a new environment variable to base, it's automatically present in both environments. When you change the production replica count, it only touches the production overlay.

Kustomize is built into `kubectl` — `kubectl apply -k overlays/production/` applies the complete rendered manifest.

## Helm: templating and packaging

Helm uses a different model: templates with variables. Instead of YAML patches, you write Go templates with `{{ .Values.image.tag }}`, and provide different values files per environment.

Helm's superpower is packaging: the community distributes Kubernetes software as Helm charts. cert-manager, nginx-ingress, Prometheus, Grafana — all available as charts. You `helm install cert-manager jetstack/cert-manager --version 1.14.0` and get a fully configured, production-ready cert-manager installation with proper RBAC, CRDs, and configuration.

Writing cert-manager manifests by hand would require maintaining dozens of files. Helm handles that for you; you only need to provide the values you want to customize.

## Which tool for which job

**Kustomize for your own applications** — you control the base manifest. Patching is straightforward and explicit. No templating syntax to learn. ArgoCD and Flux both support Kustomize natively.

**Helm for third-party cluster tooling** — you're installing something you didn't write. The chart handles complexity you don't want to think about. Use it for community software.

**Helm for complex applications with logic** — if your manifest generation requires conditionals (install this component if this feature flag is enabled), Helm's templates can express that. Kustomize can't.

The most common production setup: Kustomize overlays for your apps, Helm for cluster infrastructure tools.

## What not to do

Don't commit `helm template` output. It defeats the point of using Helm — the raw YAML loses the upgrade path and values structure.

Don't maintain a single flat directory of YAML files for multiple environments. There's no mechanism to keep them in sync.

Don't use `kubectl apply -f .` on a directory with mixed environment configs. One wrong context and you've applied staging configs to production.

<!-- RESOURCES -->

- [Kustomize Documentation](https://kubectl.docs.kubernetes.io/references/kustomize/) -- type: docs, time: 20m
- [Helm Documentation](https://helm.sh/docs/) -- type: docs, time: 20m
