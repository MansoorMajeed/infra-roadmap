---
id: "persistent-volumes"
title: "Persistent Volumes"
zone: "kubernetes"
edges:
  from:
    - id: "ingress"
      question: "My app is running and reachable. But it needs to write data that survives when the Pod restarts."
      detail: "A Pod's filesystem is ephemeral — when the Pod dies, everything it wrote is gone. For anything that needs to persist (database files, user uploads, state), you need storage that exists independently of the Pod. PersistentVolumes are Kubernetes's abstraction for that storage."
  to:
    - id: "persistent-volume-claims"
      question: "I understand PersistentVolumes exist as cluster resources. How does my Pod actually claim and use one?"
      detail: "A PersistentVolume is the storage. A PersistentVolumeClaim is how your Pod requests it — like a ticket that says 'I need 10GB of storage'. Kubernetes matches the claim to a suitable volume and mounts it into your Pod."
    - id: "storage-classes"
      question: "Creating PersistentVolumes manually one by one sounds painful. Is there a way to provision storage automatically?"
      detail: "Static provisioning — creating PVs by hand — doesn't scale. StorageClasses enable dynamic provisioning: when a Pod requests storage, Kubernetes automatically creates the underlying volume (an EBS disk, a GCP PD, an NFS share) without any manual work."
difficulty: 2
tags: ["kubernetes", "persistent-volumes", "pv", "storage", "stateful", "k8s"]
category: "concept"
milestones:
  - "Explain why Pod storage is ephemeral by default"
  - "Create a PersistentVolume manually (static provisioning)"
  - "Understand the PV lifecycle: Available, Bound, Released, Failed"
  - "Know the access modes: ReadWriteOnce, ReadOnlyMany, ReadWriteMany"
---

A Pod's filesystem is ephemeral by default — when the Pod is deleted, everything it wrote is gone. PersistentVolumes are cluster-level storage resources that exist independently of Pods, allowing data to survive Pod restarts, rescheduling, and replacements.

<!-- DEEP_DIVE -->

## Why Pod storage is ephemeral

When a container starts in Kubernetes, it gets a writable layer on top of its container image (using a union filesystem like OverlayFS). Everything the container writes goes into this writable layer. When the container or Pod is deleted, that writable layer is discarded.

This is a feature for stateless workloads — you never accidentally carry stale state from one run to the next. But for anything that needs persistence — databases, file uploads, caches that are expensive to rebuild — you need storage that exists outside the Pod.

## PersistentVolumes

A PersistentVolume (PV) is a cluster-level resource that represents a piece of storage. It could be:

- An AWS EBS volume
- A GCP Persistent Disk
- An Azure Disk or Azure File share
- An NFS mount
- A local disk on a node
- Any other backend that has a CSI driver

A manually created (statically provisioned) PV looks like this:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-nfs-pv
spec:
  capacity:
    storage: 50Gi
  accessModes:
    - ReadWriteMany
  nfs:
    path: /exports/data
    server: 10.0.0.5
```

## Access modes

Access modes describe how a volume can be mounted across nodes:

- **ReadWriteOnce (RWO)** — mounted read-write by a single node. Most cloud block storage (EBS, GCP PD, Azure Disk) only supports this. Multiple Pods on the same node can share it, but Pods on different nodes cannot.
- **ReadOnlyMany (ROX)** — mounted read-only by many nodes simultaneously. Good for distributing static content or config data.
- **ReadWriteMany (RWX)** — mounted read-write by many nodes simultaneously. Requires a network filesystem like NFS, CephFS, or AWS EFS. More expensive to set up correctly.

The access mode you request in a PVC must be supported by the underlying storage type.

## PV lifecycle states

A PV moves through these states:

- **Available** — created and not yet claimed by any PVC
- **Bound** — matched to a PVC and in use
- **Released** — the PVC was deleted, but the volume hasn't been reclaimed yet (its data still exists)
- **Failed** — automatic reclamation failed

## Static vs dynamic provisioning

Creating PVs manually (static provisioning) doesn't scale. Every new workload needs a new PV, and a human has to provision the underlying storage before the workload can start.

Dynamic provisioning via **StorageClasses** solves this: when a PVC is created referencing a StorageClass, Kubernetes automatically provisions the underlying storage and creates the PV. No human in the loop. This is how most production Kubernetes storage works.

<!-- RESOURCES -->

- [Kubernetes Docs - Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) -- type: docs, time: 30m
- [Container Storage Interface (CSI) Docs](https://kubernetes-csi.github.io/docs/) -- type: docs, time: 20m
- [Kubernetes Storage Explained - TechWorld with Nana (YouTube)](https://www.youtube.com/watch?v=0swOh5C3OVM) -- type: video, time: 20m
