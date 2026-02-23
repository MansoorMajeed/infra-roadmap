---
id: cluster-upgrades
title: Upgrading Kubernetes in Production
zone: kubernetes-production
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - upgrades
  - version
  - nodes
  - control-plane
  - drain
  - k8s
  - production
  - operations
category: practice
milestones:
  - >-
    Understand the Kubernetes release cadence: minor versions every ~4 months,
    each supported for ~14 months — falling behind is easy
  - >-
    Know the upgrade order: control plane first, then node groups — and why
    you cannot skip minor versions
  - >-
    Understand how managed clusters (EKS, GKE, AKS) handle control plane
    upgrades vs how you handle node group upgrades
  - >-
    Know the node upgrade strategies: rolling drain-and-replace vs blue-green
    node groups, and what PDBs do during the drain
  - >-
    Test upgrades in staging first — API deprecations between versions break
    things silently (check with kubectl deprecations or pluto)
---

Kubernetes releases a new minor version roughly every four months and supports each version for about fourteen months. Fall two versions behind and you're running EOL software with no security patches. Fall three behind and upgrading requires multiple sequential hops. Kubernetes upgrades are not optional — they're a recurring operational responsibility.

<!-- DEEP_DIVE -->

## The release cadence

Kubernetes follows a regular schedule: three minor versions per year (e.g., 1.28, 1.29, 1.30). Each version receives patch releases throughout its support window. Once a version reaches end of life, no more patches — including security fixes.

Managed clusters (EKS, GKE, AKS) sometimes extend support windows beyond the upstream schedule, but eventually force you to upgrade.

The practical rule: stay within two minor versions of the latest release. This gives you time to plan and test upgrades without falling into EOL territory.

## You cannot skip minor versions

Kubernetes guarantees compatibility between adjacent minor versions: the API server at version N supports clients at N-1 and N+1. The upgrade path is sequential: 1.27 → 1.28 → 1.29. Jumping from 1.27 to 1.29 directly is unsupported and will cause failures.

This means if you're two versions behind, you're doing two upgrades. Three behind, three upgrades. The longer you wait, the more work an upgrade becomes.

## The upgrade order: control plane first, then nodes

The control plane (API server, scheduler, controller manager) must be upgraded first. A newer API server is backward-compatible with older kubelet versions for one minor version. You cannot have nodes running newer Kubernetes than the control plane.

For managed clusters, the process is:

1. **Upgrade the control plane** — in EKS, this is done through the console or CLI. In GKE, you select the target version in the node pool configuration. In AKS, `az aks upgrade`.

2. **Upgrade node groups** — after the control plane is upgraded, update each node group to the new version. This triggers a rolling replacement: new nodes come up with the new version, workloads migrate over, old nodes are drained and terminated.

On EKS, upgrading nodes means either launching a new managed node group with the updated AMI (blue-green approach) or using in-place rolling update on the existing node group.

## Node upgrade strategies

**Rolling drain and replace** — nodes are drained one at a time (or in small batches), workloads migrate to remaining nodes, the drained node is replaced with a new one at the new version. Requires enough spare capacity to accommodate the migrating workloads during the drain.

**Blue-green node groups** — create a new node group with the updated version. Wait for it to be healthy. Migrate workloads using taints (taint the old group `NoSchedule`, new workloads land on new group) or by draining old nodes. Delete the old group when empty. Zero-downtime, but requires paying for two full node groups temporarily.

For critical production clusters, blue-green is safer. For most teams, rolling drain works fine with proper PDBs.

## What breaks during upgrades: API deprecations

Kubernetes removes deprecated API versions between minor versions. If your manifests use an API that was removed, they'll fail to apply after the upgrade. This is the most common surprise in Kubernetes upgrades.

Check before upgrading:

```bash
# Install pluto (a tool for detecting deprecated Kubernetes API versions)
# Then scan your manifests
pluto detect-files -d k8s/

# Or use kubectl's built-in deprecation check
kubectl get --raw /apis | grep "apiVersion"
```

Common historical examples: `apps/v1beta1` Deployments (removed in 1.16), `networking.k8s.io/v1beta1` Ingress (removed in 1.22), `autoscaling/v2beta1` HPA (removed in 1.26).

Always check the release notes and deprecation announcements for your target version before upgrading.

## Testing: staging first, always

Upgrade your staging cluster one to two weeks before upgrading production. Run your full suite of integration tests against the upgraded staging cluster. Fix any API deprecation issues or behavior changes before they become production incidents.

If you don't have a staging cluster running the same Kubernetes version as production, you can't safely test upgrades. This is one of the arguments for keeping staging reasonably close to production configuration.

## The managed cluster upgrade workflow (EKS example)

```bash
# Upgrade EKS control plane to 1.29
aws eks update-cluster-version \
  --name my-cluster \
  --kubernetes-version 1.29

# Wait for control plane upgrade to complete
aws eks wait cluster-active --name my-cluster

# Upgrade managed node group
aws eks update-nodegroup-version \
  --cluster-name my-cluster \
  --nodegroup-name general \
  --kubernetes-version 1.29

# Watch node group update status
aws eks describe-nodegroup \
  --cluster-name my-cluster \
  --nodegroup-name general \
  --query "nodegroup.status"
```

The node group update triggers rolling replacement. With proper PDBs set, workloads migrate safely during the drain.

<!-- RESOURCES -->

- [Kubernetes Release Notes](https://kubernetes.io/releases/) -- type: docs, time: 15m
- [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/) -- type: docs, time: 10m
- [Pluto - Kubernetes API Deprecation Detector](https://pluto.docs.fairwinds.com/) -- type: tool, time: 10m
- [AWS EKS Cluster Upgrade](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html) -- type: docs, time: 20m
