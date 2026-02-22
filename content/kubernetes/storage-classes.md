---
id: "storage-classes"
title: "StorageClasses and Dynamic Provisioning"
zone: "kubernetes"
edges:
  from:
    - id: "persistent-volumes"
      question: "Manually creating PersistentVolumes for every workload doesn't scale. How does dynamic provisioning work?"
      detail: "Static provisioning means a human creates a PV before the workload needs it. Dynamic provisioning inverts this: a StorageClass tells Kubernetes how to create storage on demand. When a PVC is created, Kubernetes calls the provisioner and the volume appears automatically."
  to:
    - id: "persistent-volume-claims"
      question: "StorageClasses are configured. How do workloads actually request and use storage?"
      detail: "A PersistentVolumeClaim is the Pod's request for storage: 'I need 20GB from the fast-ssd StorageClass'. Kubernetes satisfies it either from a pre-existing PV or by triggering dynamic provisioning. The PVC is then mounted into the Pod like a regular directory."
difficulty: 2
tags: ["kubernetes", "storageclass", "dynamic-provisioning", "ebs", "gcp-pd", "csi", "k8s"]
category: "concept"
milestones:
  - "Inspect the default StorageClass in your cluster"
  - "Create a PVC without a pre-existing PV and watch dynamic provisioning create the underlying disk"
  - "Understand what a CSI driver is and why cloud providers ship them"
  - "Know the reclaim policies: Retain, Delete, Recycle — and when each is appropriate"
---

StorageClasses tell Kubernetes how to dynamically provision storage on demand. Instead of a human creating a PersistentVolume before a workload starts, the StorageClass defines a provisioner that creates the underlying storage automatically when a PVC is submitted.

<!-- DEEP_DIVE -->

## Static vs dynamic provisioning

With static provisioning, someone pre-creates PersistentVolume objects. A PVC then binds to a matching PV. The problem: a human has to provision storage before the workload needs it, and you're left with either unused pre-created volumes or deployment delays.

Dynamic provisioning inverts this. When a PVC is submitted referencing a StorageClass:

1. Kubernetes calls the StorageClass's provisioner
2. The provisioner creates the underlying storage (an EBS volume, a GCP Persistent Disk, an NFS share)
3. Kubernetes creates a PV automatically to represent it
4. The PV is bound to the PVC

The workload gets storage without anyone manually provisioning it.

## Inspecting your cluster's StorageClasses

```bash
kubectl get storageclass
```

On EKS you'll typically see `gp2` or `gp3` (EBS volumes). On GKE, `standard` and `premium-rwo`. One is usually marked `(default)` — PVCs without an explicit StorageClass reference use this one.

## Writing a StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com     # the CSI driver that creates the volume
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
```

## Reclaim policies

When the PVC using a PV is deleted, what happens to the PV and its underlying storage?

- **Delete** — delete the PV and the underlying storage automatically. This is the common default for cloud volumes — you don't want orphaned EBS volumes accumulating.
- **Retain** — keep the PV (and the data) after the PVC is deleted. A human must manually clean up. Use this for important data where accidental deletion would be catastrophic.
- **Recycle** — deprecated. Don't use.

## VolumeBindingMode

- **Immediate** — provision the volume as soon as the PVC is created, regardless of where the Pod will be scheduled. Problem in cloud environments: the volume ends up in a random availability zone and may not be in the same AZ as the node the Pod gets scheduled to.
- **WaitForFirstConsumer** — provision the volume only when a Pod that uses the PVC is actually scheduled. The provisioner creates the volume in the same AZ as the scheduled node. This is the recommended mode for cloud environments.

## CSI drivers

CSI (Container Storage Interface) is the standard interface between Kubernetes and storage backends. Cloud providers ship CSI drivers for their storage services:

- `ebs.csi.aws.com` — AWS EBS
- `pd.csi.storage.gke.io` — GCP Persistent Disk
- `disk.csi.azure.com` — Azure Disk
- `nfs.csi.k8s.io` — NFS (community driver)

Managed Kubernetes services (EKS, GKE, AKS) install the appropriate CSI driver automatically. On self-managed clusters, you install the driver as a Helm chart or manifest.

<!-- RESOURCES -->

- [Kubernetes Docs - Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/) -- type: docs, time: 25m
- [AWS EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver) -- type: tool, time: 20m
- [Container Storage Interface (CSI) Overview](https://kubernetes-csi.github.io/docs/) -- type: docs, time: 15m
