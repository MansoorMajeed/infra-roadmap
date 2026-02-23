---
id: network-policies
title: Network Policies and Pod Isolation
zone: kubernetes-production
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - network-policy
  - isolation
  - namespaces
  - egress
  - ingress
  - k8s
  - production
  - security
category: concept
milestones:
  - >-
    Understand that Kubernetes has no network isolation by default — any pod
    can reach any other pod in the cluster by IP
  - >-
    Know what a NetworkPolicy does: it selects pods by label and specifies
    which ingress and egress connections are allowed
  - >-
    Understand the default-deny pattern: apply a deny-all policy first, then
    add explicit allow rules only for what's needed
  - >-
    Know that NetworkPolicy requires a CNI plugin that enforces it (Calico,
    Cilium, Weave) — not all CNIs do
  - >-
    Apply namespace isolation: allow a pod to talk only to pods in its own
    namespace plus specific external dependencies
---

By default, any pod in a Kubernetes cluster can send traffic to any other pod by IP address, regardless of namespace. There is no network firewall between namespaces, no isolation between services. NetworkPolicies are the Kubernetes mechanism for defining which pods are allowed to communicate — but they only work if your CNI enforces them.

<!-- DEEP_DIVE -->

## The open-by-default problem

In a default Kubernetes cluster with no NetworkPolicies applied:
- Your payment service can make HTTP calls to your internal admin API
- A pod in the `staging` namespace can reach pods in the `production` namespace
- Any compromised pod can try to reach any other service in the cluster

This is fine for small internal systems. It becomes a real risk when you have sensitive services, regulated data, or significant blast radius from a single compromised pod.

## What a NetworkPolicy does

A NetworkPolicy selects pods using a label selector and defines which ingress (incoming) and egress (outgoing) connections are allowed. Anything not explicitly allowed is denied — but only if a default-deny policy is in place.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-db
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database          # this policy applies to database pods
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api       # only allow traffic from api pods
      ports:
        - protocol: TCP
          port: 5432
```

This policy says: pods labeled `app: database` can only receive traffic on port 5432 from pods labeled `app: api`. Everything else is dropped.

## The default-deny pattern

NetworkPolicies are additive — they only restrict pods that have at least one policy selecting them. A pod with no policies is unrestricted.

The right approach: apply a deny-all policy to every namespace first, then add explicit allow rules.

```yaml
# Deny all ingress and egress for all pods in this namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}         # empty selector = select all pods
  policyTypes:
    - Ingress
    - Egress
```

Now nothing can communicate. Add explicit policies for what's needed:

```yaml
# Allow DNS (required for almost everything)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - ports:
        - protocol: UDP
          port: 53
```

Build up your policies incrementally: add the default-deny, then enable communication service by service, testing as you go.

## Namespace isolation

Restrict communication to only intra-namespace traffic plus specific exceptions:

```yaml
# Allow ingress only from pods in the same namespace
ingress:
  - from:
      - podSelector: {}    # any pod in the same namespace

# Allow ingress from a specific other namespace
ingress:
  - from:
      - namespaceSelector:
          matchLabels:
            kubernetes.io/metadata.name: monitoring
        podSelector:
          matchLabels:
            app: prometheus
```

Combining `namespaceSelector` and `podSelector` in the same `from` entry means "pods matching this selector in the namespace matching that selector" — it's an AND. Putting them in separate `from` entries means OR.

## CNI requirement: not all enforce NetworkPolicy

NetworkPolicy is an API object. The enforcement depends on your CNI plugin:

**Enforce NetworkPolicy:** Calico, Cilium, Weave Net, Antrea

**Do NOT enforce NetworkPolicy:** Flannel (by default)

If you apply a NetworkPolicy and your CNI doesn't enforce it, the policy is silently ignored. Traffic flows freely. Check which CNI your cluster uses.

For managed clusters: GKE uses Calico or Dataplane V2 (Cilium-based). EKS uses VPC CNI (does not enforce NetworkPolicy by default) — you need to enable the network policy controller separately. AKS supports Calico and Cilium.

## Testing your policies

After applying policies, verify they work:

```bash
# From an api pod, connect to the database - should work
kubectl exec -it api-pod -n production -- nc -zv database-svc 5432

# From a web pod, connect to the database - should be blocked
kubectl exec -it web-pod -n production -- nc -zv database-svc 5432
# Connection should timeout or be refused
```

Tools like `netshoot` (a pod with networking utilities) are useful for testing reachability within the cluster.

<!-- RESOURCES -->

- [Kubernetes Docs - Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) -- type: docs, time: 25m
- [Network Policy Editor (visual tool)](https://editor.networkpolicy.io/) -- type: tool, time: 15m
