---
id: namespace-strategy
title: Namespace Strategy for Production
zone: kubernetes-production
edges:
  to:
    - id: rbac-k8s
      question: >-
        Now that I have namespaces organized, how do I control who can deploy
        to each one?
      detail: >-
        I've got my namespace structure figured out. But I need to make sure
        developers can only touch the namespaces they own — not accidentally
        deploy to production or read secrets from another team's namespace.
difficulty: 3
tags:
  - kubernetes
  - namespaces
  - multi-tenancy
  - environments
  - isolation
  - k8s
  - production
  - organization
category: concept
milestones:
  - >-
    Understand what namespaces actually isolate — and what they don't: network
    traffic, node scheduling, and cluster-scoped resources are not namespace-isolated
  - >-
    Know the two main models: namespace-per-environment (dev/staging/prod in
    one cluster) vs cluster-per-environment, and the trade-offs of each
  - >-
    Understand namespace-per-team as a multi-tenancy pattern: each team owns
    their namespace(s) with scoped RBAC and ResourceQuotas
  - >-
    Know how ResourceQuotas and LimitRanges enforce resource boundaries at the
    namespace level — preventing one team from starving another
  - >-
    Understand when shared-cluster multi-tenancy breaks down and separate
    clusters become the right answer (hard compliance, noisy-neighbor problems)
---

Namespaces are Kubernetes's primary mechanism for logical organization. But they're often misunderstood as security boundaries — they're not. Understanding what namespaces actually give you (and what they don't) determines whether your namespace structure is genuinely protective or just visually reassuring.

<!-- DEEP_DIVE -->

## What namespaces provide

**Name isolation** — two resources with the same name can coexist in different namespaces. `api` deployment in `team-a` and `api` deployment in `team-b` don't conflict.

**RBAC scope** — Role and RoleBinding objects are namespace-scoped. You can grant a service account read access to secrets in `team-a` without granting access to `team-b`.

**Resource quota scope** — ResourceQuotas apply per namespace. You can limit how much CPU, memory, and storage a namespace's workloads can consume in aggregate.

**Grouping for operations** — `kubectl get pods -n team-a` shows only that team's pods. Network policies, monitoring filters, and audit logs can all be scoped by namespace.

## What namespaces do NOT provide

**Network isolation** — a pod in namespace `staging` can make HTTP requests to a pod in namespace `production` using its ClusterIP. Namespaces have no network firewall effect by default. You need NetworkPolicies for that (and a CNI that enforces them).

**Node isolation** — pods from different namespaces can land on the same node and share its CPU, memory, and kernel. A runaway pod in staging can starve production pods on the same node if resource limits aren't enforced.

**Cluster-scoped resource isolation** — CRDs, ClusterRoles, StorageClasses, and PersistentVolumes are not namespace-scoped. Namespaces don't protect against cluster-level misconfiguration.

## Common namespace patterns

**Namespace per environment:**
```
production/
staging/
development/
```
Simple. Works for small teams. The risk: staging and production share the cluster; a production incident takes both down.

**Namespace per team:**
```
team-payments/
team-search/
team-platform/
```
Good for multi-team isolation. Each team owns their namespace(s). RBAC is straightforward. Resource quotas prevent noisy-neighbor problems.

**Namespace per team per environment:**
```
payments-prod/
payments-staging/
search-prod/
search-staging/
```
More granular but higher operational overhead. Makes sense for large organizations with strong team ownership.

## ResourceQuotas: limiting namespace consumption

Without quotas, one namespace can consume all cluster resources. ResourceQuotas prevent this:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-payments
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
```

The team's workloads can't exceed these limits in aggregate. If they try, new pods fail to schedule.

## LimitRanges: defaults and caps per pod

Without LimitRanges, pods without resource specifications run with no requests or limits (BestEffort QoS — first evicted under pressure). LimitRanges fix this:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: team-payments
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      default:
        cpu: 500m
        memory: 512Mi
      max:
        cpu: "4"
        memory: 4Gi
```

Pods that don't specify resource requests/limits get the defaults. Pods that request more than `max` are rejected. This enforces hygiene without requiring developers to know the exact values.

## When namespaces aren't enough

Namespace-level isolation breaks down for:

- **Hard multi-tenancy** — external customers or untrusted workloads sharing a cluster. Namespaces alone don't prevent a malicious pod from escaping to the host or accessing other tenants' data.
- **Compliance requirements** — PCI, HIPAA, and similar standards often require physical separation of production data. Namespaces in a shared cluster typically don't satisfy these.
- **Persistent noisy-neighbor problems** — a team consuming excessive node I/O or network bandwidth affects other namespaces on the same node. ResourceQuotas limit scheduling but don't control runtime resource consumption at the node level.

When you hit these limits, the answer is separate clusters — not more namespace configuration.

<!-- RESOURCES -->

- [Kubernetes Docs - Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) -- type: docs, time: 15m
- [Kubernetes Docs - Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/) -- type: docs, time: 15m
- [Kubernetes Docs - Limit Ranges](https://kubernetes.io/docs/concepts/policy/limit-range/) -- type: docs, time: 15m
