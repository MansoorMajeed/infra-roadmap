---
id: k8s-cicd-pipeline
title: CI/CD Pipeline for Kubernetes
zone: kubernetes-production
edges:
  to:
    - id: multi-env-k8s
      question: >-
        The pipeline works for one environment. How do I promote between staging
        and production?
      detail: >-
        Right now everything that merges to main goes straight to production. I
        want to deploy to staging first, verify it works, and then promote
        deliberately — not push to prod automatically on every commit.
difficulty: 3
tags:
  - ci-cd
  - kubernetes
  - gitops
  - argocd
  - github-actions
  - containers
  - k8s
category: practice
milestones:
  - Build and push a container image on every commit to main
  - Update the image tag in the Helm values file (or Kustomize overlay) via CI
  - Have ArgoCD pick up the change and deploy it automatically
  - >-
    Understand the full loop: commit → build → push → update manifest → ArgoCD
    syncs
---

In a GitOps model, CI and CD have distinct, non-overlapping responsibilities. CI builds, tests, and publishes the container image. CD (ArgoCD or Flux) watches the manifest repository and applies changes. They communicate through Git — CI never touches the cluster directly.

<!-- DEEP_DIVE -->

## The full pipeline

```
Code commit → CI builds & tests → CI pushes image to registry
→ CI updates image tag in manifest repo → ArgoCD detects change
→ ArgoCD syncs cluster → new pods running
```

The manifest repository is separate from the application code repository. This is the key structure that makes GitOps work: you can see the history of what was deployed and when, independent of application code changes.

## The CI side: build and update

A GitHub Actions workflow for the CI half:

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push image
        run: |
          docker build -t ghcr.io/my-org/my-app:${{ github.sha }} .
          docker push ghcr.io/my-org/my-app:${{ github.sha }}

      - name: Update image tag in manifests
        run: |
          git clone https://github.com/my-org/my-app-manifests
          cd my-app-manifests
          # Update the image tag in the Kustomize overlay
          kustomize edit set image my-app=ghcr.io/my-org/my-app:${{ github.sha }} \
            --stack-trace
          git config user.email "ci@example.com"
          git config user.name "CI Bot"
          git add -A
          git commit -m "Update my-app image to ${{ github.sha }}"
          git push
```

Use the git commit SHA as the image tag — not `latest`. Tags like `latest` are mutable and create ambiguity about what's actually deployed.

## Updating image tags

Three common approaches:

**kustomize edit set image** — works if your overlay uses Kustomize. Updates the image field in `kustomization.yaml` directly.

**yq / sed** — directly edit the image field in a values file or manifest. Simple but fragile if the format changes.

**Helm values update** — if using Helm in ArgoCD, update the `image.tag` in your values file committed to Git.

## Environment separation in the pipeline

Don't deploy to production on every main branch commit. The pattern:

1. Every commit to `main` → deploy to staging automatically
2. Promote to production by opening a PR that updates the production image tag
3. Require review and approval before merging
4. Merging triggers ArgoCD sync to production

This gives you: automatic staging deployment, human gate before production, and a Git record of every production deployment (the promotion PR).

## What not to do

**Don't `kubectl apply` from CI directly.** CI pipelines shouldn't have cluster credentials. If CI is compromised, the blast radius should be limited to the image registry and manifest repo — not direct cluster access.

**Don't use `latest` tags.** You lose the ability to audit what's deployed, and you can't reliably roll back.

**Don't have CI wait for the deployment to complete.** CI's job ends when it pushes the manifest change. ArgoCD's job is reconciling the cluster. These are separate systems on separate timelines.

## Image signing and attestation (optional)

For higher-security environments, consider signing images with Sigstore/cosign and using OPA or Kyverno to reject unsigned images in production. This prevents an attacker who compromises your registry from deploying arbitrary code.

<!-- RESOURCES -->

- [ArgoCD CI Integration](https://argo-cd.readthedocs.io/en/stable/operator-manual/ci_automation/) -- type: docs, time: 15m
- [GitHub Actions Documentation](https://docs.github.com/en/actions) -- type: docs, time: 20m
