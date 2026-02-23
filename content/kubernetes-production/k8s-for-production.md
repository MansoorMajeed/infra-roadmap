---
id: k8s-for-production
title: Taking Kubernetes to Production
zone: kubernetes-production
edges:
  to:
    - id: managed-vs-self-managed
      question: >-
        Do I even need to run the cluster control plane myself, or is there a
        better way?
      detail: >-
        Setting up the control plane myself sounds like a full-time job — etcd,
        the API server, controller manager. Surely there's a way to just get a
        cluster without having to operate all of that infrastructure?
    - id: managing-k8s-manifests
      question: >-
        My YAML files are getting messy across environments. How do I manage
        this properly?
      detail: >-
        I have staging and production and I've been copying and editing YAML
        between them. It's already drifting and I'm only two environments in.
        There has to be a better approach than copy-paste.
    - id: rbac-k8s
      question: >-
        How do I control who can actually do what in my cluster — without giving
        everyone admin access?
      detail: >-
        Right now anyone with the kubeconfig can do anything — delete namespaces,
        read secrets, scale down production. I need a way to give developers just
        enough access without handing them the keys to everything.
difficulty: 2
tags:
  - kubernetes
  - production
  - k8s
  - concept
category: concept
milestones:
  - Understand what changes between local K8s and production K8s
  - >-
    Know what 'production-grade' means: HA control plane, node pools, storage
    classes
  - Understand why raw YAML manifests don't scale for real workloads
---

Running Kubernetes locally is not the same as running it in production. A local cluster has one node, no real storage, no access control, and nobody cares if it dies. Production means real users, real data, and real consequences when things go wrong. The gap between the two is where most of the hard lessons live.

<!-- DEEP_DIVE -->

## What actually changes in production

In a local cluster you can skip almost everything: no RBAC, no resource limits, no health checks, no autoscaling. It works because nothing important depends on it.

In production, each of those skipped pieces becomes a failure mode:

- **No resource limits** — one misbehaving pod starves everything else on the node
- **No health checks** — Kubernetes routes traffic to pods that are starting up or broken
- **No graceful shutdown** — in-flight requests die when pods are replaced
- **No access control** — any CI token can delete production namespaces
- **Manifests managed by hand** — environments drift, changes are unreproducible, rollback is manual

Production Kubernetes is really a set of operational disciplines layered on top of the basics you already know.

## The production checklist (conceptually)

**Cluster reliability:**
- Managed control plane (you don't run etcd yourself)
- Nodes in multiple availability zones
- Node pools sized for your actual workloads

**Workload reliability:**
- Resource requests and limits on every container
- Liveness, readiness, and startup probes configured correctly
- Graceful shutdown handled in application code
- Pods spread across nodes and zones
- PodDisruptionBudgets so upgrades don't take you down

**Scaling:**
- HPA for handling traffic spikes
- Node autoscaling so you're not paying for idle capacity

**Manifest management:**
- Kustomize or Helm — not copy-paste YAML
- GitOps — the cluster's desired state is in Git, not in someone's head

**Security:**
- RBAC — least privilege for humans and CI systems
- Secrets stored in a real secret store, not base64 in Git
- Network policies — pods can't reach everything by default

**Operations:**
- A safe upgrade process for Kubernetes versions
- Multi-environment promotion (staging before production)

None of these are optional if you're running something people depend on.

## The mindset shift

Local Kubernetes teaches you the API. Production Kubernetes teaches you what happens when the API is used by real workloads under real conditions.

The questions change. It's no longer "how do I deploy this?" It's "what happens when this pod gets evicted?" and "how does my app behave when it receives SIGTERM?" and "what happens if the node this pod is on disappears?"

Kubernetes gives you powerful primitives. The production work is configuring those primitives to match how you actually want your system to behave.

<!-- RESOURCES -->

- [Kubernetes Docs - Production Best Practices](https://kubernetes.io/docs/setup/production-environment/) -- type: docs, time: 20m
- [Kubernetes Docs - Configuration Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/) -- type: docs, time: 15m
