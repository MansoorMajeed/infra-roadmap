---
id: "gitops-with-argocd"
title: "GitOps with ArgoCD"
zone: "kubernetes"
edges:
  from:
    - id: "deployments"
      question: "I understand Deployments. How do I make updates happen automatically on every code push?"
      detail: "Running kubectl apply manually works for one service. It doesn't scale to dozens. ArgoCD watches a Git repository and continuously reconciles the cluster to match what's declared there — a code push triggers a deployment, rollbacks are a git revert, and the audit trail is the git log."
    - id: "deployment-strategies"
      question: "I understand deployment strategies. How do I automate them?"
      detail: "Understanding how to do a canary or blue-green manually makes it much clearer why GitOps tooling exists. ArgoCD automates the deployment loop; Argo Rollouts extends it with progressive delivery strategies as native Kubernetes resources — triggered by a Git push, not a human running commands."
    - id: "jobs-and-cronjobs"
      question: "Jobs and CronJobs are Kubernetes resources too — how do I manage them declaratively from Git?"
      detail: "Jobs and CronJobs are just YAML like Deployments and Services. They belong in Git alongside everything else. ArgoCD syncs them the same way — database migration Jobs run as part of the same application as the Deployment they prepare, with the same audit trail and rollback capability."
  to: []
difficulty: 2
tags: ["gitops", "argocd", "kubernetes", "continuous-deployment", "declarative", "flux", "k8s"]
category: "practice"
milestones:
  - "Install ArgoCD and connect it to a Git repository"
  - "Define an Application resource that syncs a Deployment manifest from Git"
  - "Make a change in Git and watch ArgoCD detect and apply it"
  - "Roll back by reverting a Git commit and watching the cluster follow"
  - "Understand the difference between manual sync and automated sync policies"
---

GitOps treats Git as the single source of truth for your cluster's desired state. ArgoCD watches a Git repository and continuously reconciles the cluster to match the manifests in it. A code push triggers a deployment; a git revert is a rollback; the git log is your audit trail.

<!-- DEEP_DIVE -->

## What GitOps is

Traditional CI/CD: a pipeline runs `kubectl apply` after tests pass. It works, but it has problems:

- The cluster state can drift from the repo over time (someone ran `kubectl edit` manually)
- If you need to recreate the cluster, you re-run the pipeline — and hope it's still idempotent
- There's no continuous reconciliation — if a resource is accidentally deleted from the cluster, nothing brings it back

GitOps flips the model. Instead of pushing changes to the cluster, a controller inside the cluster continuously pulls from Git:

1. You commit a change to a manifest in Git
2. ArgoCD detects the change (polling or webhook)
3. ArgoCD applies the diff to the cluster
4. If someone manually modifies cluster state (drift), ArgoCD detects it and can automatically revert it

The cluster is always trying to match Git. Git is the truth.

## Installing ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Access the UI via port-forward:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Get the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

## Defining an Application

An ArgoCD `Application` resource tells ArgoCD where to find manifests and where to deploy them:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/k8s-manifests
    targetRevision: main
    path: apps/my-app
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app
  syncPolicy:
    automated:
      prune: true       # delete resources removed from Git
      selfHeal: true    # revert manual cluster changes automatically
```

With `automated.selfHeal: true`, ArgoCD automatically resyncs if cluster state drifts from Git. Manual changes get reverted within seconds. This is the configuration that makes GitOps actually mean something.

## The GitOps workflow

1. Developer opens a PR changing `image: my-app:1.4.2` to `my-app:1.5.0` in the manifest
2. PR is reviewed and merged to main
3. ArgoCD detects the change (within 3 minutes by default, or immediately if you configure a Git webhook)
4. ArgoCD applies the updated Deployment
5. The rolling update proceeds
6. To roll back: `git revert <commit>` and push — ArgoCD rolls the Deployment back

No `kubectl` in the deployment loop. No manual steps. The audit trail is the git log.

## Repository structure patterns

Two common approaches:

**Mono-repo** — application code and Kubernetes manifests live in the same repository. Simple to cross-reference, easy to see "this code change and this manifest change went together." Gets messy at scale when many teams are committing.

**Separate config repo** — application code in one repo, Kubernetes manifests in a dedicated config repo. CI/CD publishes new image tags to the config repo (often automated with `argocd-image-updater` or custom scripts). ArgoCD watches the config repo. Clear separation of concerns; easier to control who can modify what.

## Helm and Kustomize

ArgoCD doesn't require raw YAML manifests. It can render Helm charts and Kustomize overlays from your repository. This means you can maintain a single base manifest and use Kustomize to patch environment-specific values, or use a Helm chart with different `values.yaml` files per environment — and ArgoCD handles the rendering before applying to the cluster.

<!-- RESOURCES -->

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/) -- type: docs, time: 1h
- [argocd-image-updater - Automate image tag updates](https://argocd-image-updater.readthedocs.io/) -- type: tool, time: 20m
- [GitOps Principles - OpenGitOps](https://opengitops.dev/) -- type: article, time: 10m
- [Flux - Alternative GitOps controller](https://fluxcd.io/) -- type: tool, time: 20m
- [Argo Rollouts - Progressive delivery](https://argo-rollouts.readthedocs.io/) -- type: tool, time: 30m
