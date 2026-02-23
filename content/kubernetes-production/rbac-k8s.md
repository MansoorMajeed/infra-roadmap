---
id: rbac-k8s
title: RBAC and Access Control in Kubernetes
zone: kubernetes-production
edges:
  to:
    - id: network-policies
      question: >-
        I've locked down who can deploy to the cluster. But I just realized any
        pod can still reach any other pod freely.
      detail: >-
        My payment service could make HTTP calls to my internal admin API. A
        compromised pod in one namespace could try to hit the database in
        another. I've controlled what people can do via kubectl, but once a pod
        is running it seems like it can talk to anything. That can't be right.
difficulty: 3
tags:
  - kubernetes
  - rbac
  - roles
  - clusterroles
  - service-accounts
  - authorization
  - k8s
  - production
  - security
category: concept
milestones:
  - >-
    Understand the RBAC building blocks: Role, ClusterRole, RoleBinding,
    ClusterRoleBinding — and when to use each
  - >-
    Know the difference between namespace-scoped Roles and cluster-wide
    ClusterRoles, and why giving everyone a ClusterRole is the common mistake
  - >-
    Set up a ServiceAccount for your CI/CD pipeline with only the permissions
    it needs — not cluster-admin
  - >-
    Know the principle of least privilege in practice: verbs (get, list, watch,
    create, delete) mapped to specific resources per namespace
  - >-
    Use kubectl auth can-i to audit what a user or service account can
    actually do
---

Kubernetes RBAC controls what actions subjects (users, service accounts, CI systems) can take through the Kubernetes API. By default, new service accounts have no permissions. The common mistake is solving that by assigning `cluster-admin` — which grants god-mode to anything that holds the token.

<!-- DEEP_DIVE -->

## The building blocks

**Role** — a set of permissions scoped to a single namespace. Can only grant access to namespace-scoped resources (pods, deployments, secrets, services).

**ClusterRole** — a set of permissions that applies cluster-wide, or can be used to grant access to cluster-scoped resources (nodes, StorageClasses, PersistentVolumes, namespaces themselves).

**RoleBinding** — binds a Role (or ClusterRole) to subjects within a specific namespace.

**ClusterRoleBinding** — binds a ClusterRole to subjects cluster-wide.

The key distinction: a ClusterRoleBinding grants access everywhere. A RoleBinding with a ClusterRole as the role reference grants that role's permissions within the binding's namespace only.

## Subjects: who gets bound

RBAC subjects are:
- **User** — Kubernetes doesn't manage users. It trusts the authentication layer (certificates, OIDC tokens from your identity provider). A user "alice" means whatever auth system you've configured says the token belongs to alice.
- **Group** — similarly delegated to the auth layer. OIDC providers can include group claims.
- **ServiceAccount** — a namespaced Kubernetes object. Pods run as service accounts and can be bound to roles. This is how pods get API access.

## The CI/CD service account

Your CI system needs to deploy to the cluster. The wrong solution: give it `cluster-admin`.

The right solution: a service account with exactly the permissions it needs:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer
  namespace: production
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "update", "patch"]
  - apiGroups: [""]
    resources: ["services", "configmaps"]
    verbs: ["get", "list", "update", "patch", "create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ci-deployer
  namespace: production
subjects:
  - kind: ServiceAccount
    name: ci-runner
    namespace: ci
roleRef:
  kind: Role
  name: deployer
  apiGroup: rbac.authorization.k8s.io
```

This service account can update deployments and services in `production` — and nothing else. If the CI system is compromised, the attacker can deploy a bad image, but can't read secrets from other namespaces, delete arbitrary resources, or access cluster-level configuration.

## The principle of least privilege in practice

The verbs available are: `get`, `list`, `watch`, `create`, `update`, `patch`, `delete`, `deletecollection`. Grant the minimum set required for the task:

- Operators that read resource state: `get`, `list`, `watch`
- Deployment systems: `get`, `list`, `update`, `patch`, `create` on specific resource types
- Never `*` on resources or verbs unless there's no alternative

Namespace isolation: use Roles (not ClusterRoles) for permissions that should be namespace-scoped. A developer should be able to `kubectl logs` in their own namespace, not across the cluster.

## Auditing permissions

```bash
# Can alice delete pods in the production namespace?
kubectl auth can-i delete pods --namespace production --as alice

# What can the ci-runner service account do in production?
kubectl auth can-i --list --namespace production \
  --as system:serviceaccount:ci:ci-runner
```

Use these commands to verify permissions are what you expect before committing to a configuration. `--list` with `can-i` shows all permissions available to a subject.

## The common mistakes

**cluster-admin for developers** — given "temporarily" to unblock someone, never revoked. Audit your ClusterRoleBindings regularly.

**Shared service accounts** — multiple services using the same service account. If one is compromised, you can't revoke just that one.

**No RBAC for workloads** — pods defaulting to the `default` service account, which has no permissions by default but can be accidentally over-permissioned. Create dedicated service accounts for each workload.

<!-- RESOURCES -->

- [Kubernetes Docs - RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) -- type: docs, time: 30m
- [Kubernetes Docs - Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#using-rbac-authorization) -- type: docs, time: 20m
