---
id: gitops-intro
title: 'GitOps: Git as the Source of Truth'
zone: kubernetes-production
edges:
  to:
    - id: argocd-setup
      question: >-
        My manifests are in Git — how do I make the cluster automatically apply
        them when I merge?
      detail: >-
        I've been running kubectl apply by hand after every change, which is
        error-prone and means I could forget a step. I want merging a PR to be
        what actually triggers the deployment — but I'm not sure what's doing
        the watching and applying.
difficulty: 2
tags:
  - gitops
  - kubernetes
  - argocd
  - flux
  - deployment
  - k8s
category: concept
milestones:
  - >-
    Understand the GitOps model: Git is the desired state, the operator
    reconciles
  - Know the difference between push-based and pull-based deployments
  - Understand why GitOps gives you a free audit trail and rollback path
---

GitOps is a deployment model where Git is the single source of truth for cluster state. Instead of CI pushing changes directly to the cluster, a controller inside the cluster watches a Git repository and reconciles the cluster to match what's there. The cluster pulls from Git — it's never pushed to.

<!-- DEEP_DIVE -->

## Push-based vs pull-based deployments

**Push-based (traditional CI/CD):** Your CI pipeline runs `kubectl apply` or `helm upgrade` at the end of a build. The cluster accepts changes from external systems. The pipeline needs credentials to write to the cluster. The cluster's actual state may drift from what was last deployed — there's nothing continuously reconciling.

**Pull-based (GitOps):** A controller (ArgoCD, Flux) runs inside the cluster. It watches a Git repository. When the repository changes, the controller applies the changes. The controller continuously reconciles actual state with desired state — if someone manually edits a resource in the cluster, the controller reverts it to match Git.

The key advantage of pull-based: CI doesn't need cluster credentials. You don't have to trust every CI pipeline with write access to production.

## What GitOps gives you

**Audit trail** — every deployment is a Git commit. Who deployed what, when, and why is recorded in commit history. This is invaluable during an incident.

**Free rollback** — rolling back is `git revert`. The GitOps controller sees the revert commit and rolls the cluster back to the previous state. No special rollback commands; Git history is your deployment history.

**Drift detection** — if someone manually changes something in the cluster (emergency hotfix, configuration tweak), the GitOps controller detects the drift and alerts you — or automatically reverts it, depending on your sync policy.

**Reproducibility** — a new cluster can be bootstrapped from Git. Your cluster state is defined in code, not reconstructed from memory.

## The split between CI and CD

In a GitOps model, CI and CD are separate concerns:

**CI (Continuous Integration):** Build and test the code. Build and push a container image. Update the image tag in the Git repository (in the manifests repo).

**CD (Continuous Deployment / GitOps):** The controller watches the repository. When the image tag changes, it applies the new manifest. The cluster updates.

CI doesn't touch the cluster. CD doesn't build images. They communicate through Git.

## Flux vs ArgoCD

Both are pull-based GitOps operators. Both watch Git repositories and reconcile cluster state.

**ArgoCD** — has a web UI for visualizing application state, sync status, and resource health. More feature-rich. Has its own RBAC model. The most widely adopted option.

**Flux** — more Kubernetes-native (everything is a CRD). No built-in UI. More composable. Good fit for teams that prefer CLI and want less opinion.

For most teams starting out, ArgoCD is easier to reason about and has better visibility. Flux is preferred by teams that want a more minimal, CLI-centric workflow.

<!-- RESOURCES -->

- [OpenGitOps Principles](https://opengitops.dev/) -- type: docs, time: 10m
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/en/stable/) -- type: docs, time: 20m
- [Flux Documentation](https://fluxcd.io/flux/) -- type: docs, time: 20m
