---
id: cluster-topology
title: One Cluster or Many?
zone: kubernetes-production
edges:
  to:
    - id: node-pools
      question: >-
        I've decided on my cluster structure. Now how do I actually carve up the
        machines inside it?
      detail: >-
        I know whether I want one cluster or many. But now I need to figure out
        what the actual machines look like — different sizes, different roles.
        My GPU workloads and my web servers probably shouldn't run on the same
        nodes.
difficulty: 2
tags:
  - kubernetes
  - cluster
  - multi-cluster
  - namespaces
  - isolation
  - blast-radius
  - k8s
  - production
category: concept
milestones:
  - >-
    Understand the tradeoffs between per-environment clusters vs namespaces in
    one cluster
  - Know what 'blast radius' means and why isolation matters
  - Understand the operational cost of running multiple clusters
  - Know when a single cluster with namespaces is good enough
---

One cluster with namespaces, or separate clusters per environment? This is one of the first architectural decisions in production Kubernetes and there's no universal right answer — only trade-offs that depend on your team size, compliance requirements, and operational appetite.

<!-- DEEP_DIVE -->

## What namespaces actually give you

Namespaces provide:
- **Name isolation** — two deployments named `api` can coexist in `staging` and `production` namespaces
- **RBAC scope** — Role bindings can be scoped to a namespace
- **Resource quota scope** — ResourceQuotas apply per namespace
- **Logical grouping** — `kubectl get pods -n staging` filters to just that namespace

Namespaces do *not* provide:
- **Network isolation** — a pod in `staging` can by default reach a pod in `production` over the cluster network
- **Node isolation** — staging and production pods land on the same nodes
- **Cluster-scoped resource isolation** — CRDs, ClusterRoles, StorageClasses are cluster-wide
- **Blast radius isolation** — a bug in the API server or etcd affects all namespaces simultaneously

Namespaces are a soft boundary. They work well for team organization. They're not a security perimeter.

## The case for separate clusters per environment

**Blast radius containment** — a botched production deploy, a cluster-level misconfiguration, or a control plane incident is scoped to that cluster. Staging problems cannot take down production.

**Independent upgrade schedules** — you can run Kubernetes 1.30 in production and 1.31 in staging to validate the upgrade before committing to production.

**Compliance and audit requirements** — some regulations require production data to be isolated from non-production environments. Namespaces don't satisfy this; separate clusters do.

**Different node sizing** — production might need beefy nodes with specific instance types; staging can run on cheap spot instances.

The cost: every cluster is an operational artifact. Secrets, ingress, monitoring, cluster add-ons — all duplicated. Upgrading five clusters is five times the work of upgrading one.

## The case for namespaces in one cluster

**Operational simplicity** — one cluster to monitor, upgrade, and maintain. Cluster add-ons (cert-manager, ingress controller, monitoring) installed once.

**Cost** — managed control planes charge per cluster. One cluster is cheaper.

**Developer experience** — easier to give developers access to a namespace than to manage kubeconfig files for multiple clusters.

The cost: weaker isolation. If you care about staging pods being on different nodes than production pods, or about network-level separation, you need more configuration (NetworkPolicies, PodAntiAffinity, taints) to compensate.

## The most common pattern in practice

Most teams land here: **production is its own cluster; staging and development share a second cluster** (sometimes separated by namespace, sometimes together).

This gives you:
- Strong isolation for production (the thing that matters most)
- One cluster to manage for non-production (acceptable risk; shared cost)

Teams with strong compliance requirements, regulated data, or multiple internal teams often move to a cluster-per-environment model as they grow.

## Multi-cluster complexity

If you go multi-cluster, be prepared for:
- Managing separate kubeconfig contexts and auth for each cluster
- Deploying the same workloads to multiple clusters (GitOps helps here significantly)
- Service discovery across clusters (no built-in solution — needs extra tooling)
- Multiple ingress configurations and certificates

Multi-cluster management is a real operational cost. Don't add clusters you don't need.

<!-- RESOURCES -->

- [Kubernetes Docs - Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) -- type: docs, time: 15m
- [Kubernetes Docs - Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/) -- type: docs, time: 15m
