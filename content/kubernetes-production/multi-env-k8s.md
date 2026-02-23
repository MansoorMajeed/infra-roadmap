---
id: multi-env-k8s
title: Multi-Environment Promotion
zone: kubernetes-production
edges:
  to:
    - id: resource-requests-limits
      question: >-
        My app is deployed across environments — but how do I make sure it
        doesn't starve or take down other pods?
      detail: >-
        In staging I don't care much about resource usage. But in production I
        worry that one misbehaving pod could consume all the memory and take
        everything else down with it. How do I actually prevent that?
    - id: service-mesh-problems
      question: >-
        Everything is running. But how do services talk to each other securely,
        and how do I know what's going wrong?
      detail: >-
        My services communicate over plain HTTP inside the cluster. I've heard
        that's not great from a security standpoint. And when a request fails
        somewhere in the chain, I have no visibility into which service is
        responsible.
    - id: namespace-strategy
      question: >-
        Should I use separate namespaces or separate clusters for each
        environment?
      detail: >-
        I've been using namespaces to separate staging and production but I'm
        not sure that's actually providing real isolation. What's actually
        stopping a misconfigured staging pod from hitting the production
        database?
    - id: network-policies
      question: >-
        How do I stop services in one environment from accidentally talking to
        services in another?
      detail: >-
        Staging and production are in the same cluster. I keep worrying that a
        misconfigured service in staging could accidentally call the production
        API or database. Right now there's nothing at the network level stopping
        that from happening.
difficulty: 3
tags:
  - kubernetes
  - environments
  - staging
  - production
  - gitops
  - promotion
  - k8s
category: practice
milestones:
  - Separate staging and production into distinct namespaces or clusters
  - Promote a release from staging to production via a pull request
  - >-
    Understand environment-specific config using Helm values or Kustomize
    overlays
  - Require manual approval before production deployments
---

Staging exists to catch problems before they reach production. But a staging environment only provides value if it closely resembles production and promotion between them is deliberate — not automatic, not accidental.

<!-- DEEP_DIVE -->

## What each environment is for

**Development** — fast iteration, loose stability requirements. Developers need frequent deploys; breaking changes are acceptable. Can be namespaces in a shared cluster.

**Staging** — production-like. Same Kubernetes version, same resource limits, same networking. The bar is: "would this break in production?" Integration tests, load tests, and manual QA happen here.

**Production** — the real thing. Changes are deliberate. Deploys require approval. Rollbacks are practiced, not improvised.

Running staging on a small, cheap cluster with half the resources of production is a mistake. You'll find resource-related bugs in production that staging never surfaced.

## Namespace-per-environment vs cluster-per-environment

**Namespaces:** Staging and production coexist in one cluster, separated by namespace. Simpler operationally. One set of cluster add-ons. Less cost.

The risk: a misconfiguration in one namespace can affect others. Staging pods can talk to production pods by default (no network isolation without NetworkPolicies). A cluster-level incident takes both down.

**Separate clusters:** Production is isolated. Independent upgrade schedules. Network-level separation by default. Better blast radius control.

The cost: every cluster needs its own add-ons, monitoring, ingress, certificates. Operational overhead multiplies.

The common pragmatic answer: **production gets its own cluster; staging and dev share a cluster** (separated by namespace or by a small staging cluster). This limits blast radius for what matters most while keeping operational complexity manageable.

## Environment-specific configuration

Use Kustomize overlays or Helm values files to express environment differences:

```yaml
# overlays/production/kustomization.yaml
patches:
  - path: production-resources.yaml   # higher resource limits
  - path: production-replicas.yaml    # more replicas

images:
  - name: my-app
    newTag: "v1.4.2"                  # pinned release version
```

```yaml
# overlays/staging/kustomization.yaml
patches:
  - path: staging-resources.yaml      # smaller limits to save cost

images:
  - name: my-app
    newTag: "main-abc123"             # latest main branch build
```

The structure makes the difference explicit and reviewable.

## Promotion mechanics with ArgoCD

Each environment gets its own ArgoCD Application pointing at its overlay:

```yaml
# Staging Application
spec:
  source:
    path: overlays/staging

# Production Application
spec:
  source:
    path: overlays/production
```

Staging auto-syncs on every main branch build (CI updates the image tag). Production requires a manual sync — or a promotion PR that updates the production overlay's image tag, reviewed and merged by a human.

The promotion flow:
1. CI builds image `v1.4.2`, updates staging overlay → staging deploys automatically
2. QA runs on staging, passes
3. Engineer opens a PR updating `overlays/production/kustomization.yaml` to `v1.4.2`
4. PR is reviewed, approved, and merged
5. ArgoCD detects the production manifest change → syncs production

Every production deployment is a Git commit with a reviewer and a timestamp. Rollback is reverting the commit.

## Requiring approval before production

In ArgoCD, set the production Application to manual sync:

```yaml
syncPolicy:
  automated: null   # disable automatic sync
```

Deploys to production require someone to click "Sync" in the ArgoCD UI (or run `argocd app sync production`). Combine with ArgoCD RBAC to restrict who can trigger production syncs.

In GitHub Actions, use environment protection rules to require reviewers before a production deployment job runs.

<!-- RESOURCES -->

- [ArgoCD Multi-Cluster Management](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#clusters) -- type: docs, time: 20m
- [Kubernetes Docs - Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) -- type: docs, time: 10m
