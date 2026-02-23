---
id: persistent-volume-claims
title: Persistent Volume Claims
zone: kubernetes
edges:
  to:
    - id: configmaps
      question: >-
        Storage sorted. My app also needs configuration — database URLs, feature
        flags, settings. Where do those go?
      detail: >-
        Storage is sorted. But now my app needs to know its database URL, which
        environment it's in, which feature flags are on. Right now that's all
        baked into the container image — which means a rebuild every time
        something changes. There must be a way to inject configuration at
        runtime without rebuilding.
difficulty: 1
tags:
  - kubernetes
  - pvc
  - persistent-volume-claims
  - storage
  - volumes
  - k8s
category: practice
milestones:
  - Create a PVC and mount it into a Pod as a volume
  - >-
    Write data to the mounted path, delete the Pod, recreate it, and verify the
    data persists
  - >-
    Understand why StatefulSets are used instead of Deployments for stateful
    workloads
  - Explain what happens to a PVC when the Pod that uses it is deleted
---

A PersistentVolumeClaim (PVC) is how a Pod requests durable storage from the cluster. You declare the size and access mode you need; Kubernetes finds or creates a matching PersistentVolume and binds it. The Pod mounts the PVC as a directory and is abstracted from the underlying storage details entirely.

<!-- DEEP_DIVE -->

## Writing a PVC

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
  namespace: default
spec:
  storageClassName: gp3      # which StorageClass to use for dynamic provisioning
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

Apply this and Kubernetes will either bind it to a matching pre-existing PV (static provisioning), or trigger the StorageClass's provisioner to create the underlying storage automatically (dynamic provisioning).

## Mounting a PVC into a Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: postgres:15
      volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: my-data
```

The Pod sees `/var/lib/postgresql/data` as a regular directory. Whether it's backed by an EBS volume, an NFS share, or a local disk is invisible to the application.

## What happens when you delete the Pod

Deleting the Pod does not delete the PVC or the underlying storage. The volume outlives the Pod — that's the whole point. A new Pod mounting the same PVC finds the same data waiting for it.

What happens when you delete the PVC itself depends on the StorageClass's reclaim policy:
- `Delete` — the underlying storage is destroyed
- `Retain` — the storage persists and must be manually cleaned up

## PVCs and Deployments — the multi-replica problem

Using a PVC with a Deployment works, but with an important constraint: the access mode must be `ReadWriteMany` if you want multiple Pod replicas mounting the same PVC simultaneously. `ReadWriteOnce` volumes can only be mounted by Pods on the same node — if your Deployment scales to multiple nodes, extra Pods will fail to mount the volume.

For stateful workloads where each replica needs its own persistent storage (databases, message queues, stateful services), use a **StatefulSet** instead of a Deployment. StatefulSets use `volumeClaimTemplates` — Kubernetes automatically creates a separate PVC per Pod replica, named predictably (`data-my-app-0`, `data-my-app-1`, etc.), and each Pod always reconnects to its own PVC when rescheduled.

## Verifying persistence hands-on

The best way to understand PVCs is to experience them directly:

1. Create a PVC and mount it into a Pod
2. Write files to the mounted path (`echo "hello" > /data/test.txt`)
3. Delete the Pod
4. Create a new Pod using the same PVC
5. Verify the files are still there

This makes the abstraction concrete: the Pod is gone but the data survived.

<!-- RESOURCES -->

- [Kubernetes Docs - Persistent Volume Claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims) -- type: docs, time: 20m
- [Kubernetes Docs - StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) -- type: docs, time: 25m
- [Kubernetes Docs - Configure a Pod to Use a PersistentVolume](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/) -- type: tutorial, time: 20m
