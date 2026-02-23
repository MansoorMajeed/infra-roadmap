---
id: debugging-storage
title: Debugging Storage and PVCs
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - debugging
  - pvc
  - storage
  - persistent-volumes
  - storage-class
  - k8s
category: practice
milestones:
  - >-
    Use kubectl describe pvc to find why a claim isn't binding — wrong storage
    class, no provisioner, or access mode mismatch
  - >-
    Understand the difference between a PVC stuck in Pending (provisioning
    failed) and a pod stuck in Pending waiting for a PVC to bind
  - >-
    Know how to find and check the CSI driver or provisioner that's responsible
    for creating the actual storage
---

A pod stuck in Pending because of storage is usually either a PVC that won't bind, or a PVC that bound to the wrong kind of volume. Almost all PVC problems come down to the storage class, the access mode, or a provisioner that isn't running.

<!-- DEEP_DIVE -->

## Check the PVC first

When a pod is pending because of storage, start with the PVC:

```bash
kubectl get pvc
kubectl describe pvc my-claim
```

Look at the **Status** field. A PVC can be:

- **Pending** — waiting to be bound. Either no matching PV exists (static provisioning), or the StorageClass provisioner hasn't created one yet, or it failed to.
- **Bound** — successfully bound to a PV. If the pod is still pending, the problem is something else (node resources, scheduling constraints).
- **Lost** — was bound to a PV that no longer exists. The PV was deleted while the PVC was still using it.

The **Events** section in `describe pvc` tells you what the provisioner tried and what went wrong.

## StorageClass problems

The most common root cause: the StorageClass doesn't exist, or its provisioner isn't running.

```bash
kubectl get storageclass
```

Check that the StorageClass your PVC requests actually exists. If you wrote `storageClassName: gp3` but the cluster has `gp2`, the PVC will sit in Pending forever.

Check whether the provisioner is working:

```bash
kubectl get pods -n kube-system | grep -i csi
```

If the CSI driver pods are crashing or missing, no PVCs can be provisioned. Check their logs:

```bash
kubectl logs -n kube-system <csi-provisioner-pod>
```

## Access mode mismatch

A PVC requests an access mode (`ReadWriteOnce`, `ReadWriteMany`, `ReadOnlyMany`). The PV it binds to must support that mode.

`ReadWriteOnce` (RWO) is the most common — one pod can mount the volume at a time, and only on one node. If your Deployment has multiple replicas trying to mount the same RWO PVC from different nodes, only one will succeed and the others will be stuck.

If you need multiple pods to mount the same volume simultaneously, you need `ReadWriteMany` (RWX) — but most cloud block storage (EBS, GCP PD) doesn't support RWX. You need a network filesystem (NFS, EFS, Azure Files) for that.

## Pod stuck waiting for PVC

If the pod is pending with this in its Events:

```
Warning  FailedScheduling  persistentvolumeclaim "my-claim" not found
```

or:

```
Warning  FailedMount  Unable to attach or mount volumes
```

The PVC itself might be bound, but the volume can't be attached to the node the pod landed on. This happens with zone-specific storage: if your PVC bound to a volume in `us-east-1a` and the pod scheduled to a node in `us-east-1b`, the attach will fail.

Fix: use `volumeBindingMode: WaitForFirstConsumer` on the StorageClass — this delays volume creation until a pod is scheduled, so the volume gets created in the right zone.

## A systematic approach

1. `kubectl get pvc` — is the PVC Bound or Pending?
2. `kubectl describe pvc my-claim` — Events section: what did the provisioner say?
3. `kubectl get storageclass` — does the requested StorageClass exist?
4. `kubectl get pods -n kube-system | grep csi` — is the provisioner running?
5. `kubectl describe pod my-pod` — Events: is the pod pending because of PVC or something else?
6. Check access mode: is this RWO being mounted by multiple pods on different nodes?

<!-- RESOURCES -->

- [Kubernetes Docs - Troubleshoot Persistent Volumes](https://kubernetes.io/docs/tasks/debug/debug-cluster/debug-application/#my-persistent-volume-is-not-binding) -- type: docs, time: 15m
- [Kubernetes Docs - Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/) -- type: docs, time: 20m
