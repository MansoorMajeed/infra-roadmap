---
id: "namespaces"
title: "Namespaces"
zone: "kubernetes"
edges:
  from:
    - id: "why-kubernetes"
      question: "Before I start running things — how does Kubernetes keep different apps, teams, or environments from stepping on each other?"
      detail: "A Kubernetes cluster is shared infrastructure. Without organisation, workloads from different teams, environments, or applications all live in the same flat space. Namespaces are Kubernetes's way of partitioning a cluster — separate spaces with their own resources, RBAC policies, and network boundaries."
  to:
    - id: "pods"
      question: "I understand how namespaces organise the cluster. Now — how do I actually run something in one?"
      detail: "I've set up my namespaces, but now I'm staring at kubectl not sure what to actually put in them. What's the first real thing I deploy, and how do I make sure it ends up in the right namespace?"
difficulty: 1
tags: ["kubernetes", "namespaces", "multi-tenancy", "resource-quotas", "organisation", "k8s"]
category: "concept"
milestones:
  - "Create a namespace and deploy a Pod into it"
  - "Use -n flag with kubectl to target a specific namespace"
  - "Set a ResourceQuota on a namespace to limit CPU and memory"
  - "Understand why cluster-scoped resources (Nodes, PersistentVolumes) don't belong to namespaces"
  - "Explain the difference between namespace-scoped and cluster-scoped resources"
---

A Kubernetes cluster is shared infrastructure — by default, everything lands in the `default` namespace and all workloads can see each other. Namespaces carve a cluster into isolated virtual spaces, each with its own resources, access controls, and limits. Getting this right from the start is much easier than retrofitting it later.

<!-- DEEP_DIVE -->

## What a namespace actually is

Namespaces are a virtual partition inside a Kubernetes cluster. Think of them like directories in a filesystem — except these directories also carry access controls and resource limits. Two Services named `api` in different namespaces are completely separate resources. A ResourceQuota on the `staging` namespace doesn't affect `production`.

Kubernetes ships with a few built-in namespaces:

- `default` — where your resources go when you don't specify a namespace
- `kube-system` — where Kubernetes's own components run (scheduler, controller manager, CoreDNS)
- `kube-public` — readable by all users, rarely used in practice
- `kube-node-lease` — used for node heartbeats, not for user workloads

## How to use namespaces

Creating a namespace is trivial:

```bash
kubectl create namespace staging
```

Or declaratively (the preferred way for anything you'd commit to Git):

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: staging
```

Every subsequent `kubectl` command accepts a `-n` flag to target a specific namespace:

```bash
kubectl get pods -n staging
kubectl apply -f my-app.yaml -n staging
kubectl logs my-pod -n staging
```

If you work in one namespace constantly, set it as the default for your current context with `kubens` (part of the `kubectx` tool) rather than typing `-n` on every command.

## Namespace-scoped vs cluster-scoped resources

Not everything in Kubernetes lives inside a namespace. Namespaces contain workload-level resources: Pods, Services, Deployments, ConfigMaps, Secrets, PersistentVolumeClaims. But some resources are cluster-scoped and exist outside any namespace:

- **Nodes** — the machines themselves
- **PersistentVolumes** — cluster-level storage pools
- **StorageClasses** — how to provision storage
- **ClusterRoles** and **ClusterRoleBindings** — cluster-wide permissions
- **Namespaces** themselves

This distinction matters: when you grant RBAC permissions scoped to a namespace, they only apply to namespace-scoped resources within that namespace. Cluster-scoped resources require ClusterRoleBindings.

## Resource quotas

One of the main reasons to use namespaces in a shared cluster is to prevent one team or environment from consuming all available compute. A `ResourceQuota` caps what a namespace can collectively use:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: staging-quota
  namespace: staging
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "50"
```

With this quota, the staging namespace can never collectively request more than 4 CPUs or 8GB of memory. If a Deployment update would push past the limit, Kubernetes rejects it — the quota acts as a ceiling.

## Namespace patterns in practice

Three common strategies:

- **Per-environment** — `dev`, `staging`, `production` in the same cluster. Simple, but production and dev are co-located, which makes some teams nervous.
- **Per-team** — `payments`, `auth`, `notifications`, each team owns their namespace. Works well with GitOps where each team manages their own manifests.
- **Per-application** — fine-grained isolation, each application gets its own namespace. Common in larger organizations with many services.

For strong isolation between tenants who shouldn't see each other's secrets — true multi-tenancy — namespaces alone aren't enough. You also need NetworkPolicies (to limit cross-namespace network traffic) and strict RBAC (to prevent namespace hopping). For single-team clusters with multiple environments, namespace-per-environment is simple and usually sufficient.

<!-- RESOURCES -->

- [Kubernetes Docs - Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) -- type: docs, time: 15m
- [Kubernetes Docs - Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/) -- type: docs, time: 20m
- [kubectx + kubens - Switch contexts and namespaces fast](https://github.com/ahmetb/kubectx) -- type: tool, time: 5m
