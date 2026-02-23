---
id: statefulsets
title: StatefulSets
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - statefulsets
  - storage
  - databases
  - headless-service
  - k8s
category: practice
milestones:
  - >-
    Understand the three StatefulSet guarantees: stable pod identity, stable
    network hostname, and stable per-replica storage
  - >-
    Create a StatefulSet with a volumeClaimTemplate and verify each pod gets
    its own PVC
  - >-
    Understand how headless Services give each pod a stable DNS name like
    my-app-0.my-app.default.svc.cluster.local
  - >-
    Know the ordering guarantees: pods start in order (0, 1, 2) and terminate
    in reverse — and when that matters vs when it doesn't
  - >-
    Know when NOT to use StatefulSets: managed databases outside the cluster
    are usually less operational pain
---

A StatefulSet is the right workload type when your pods cannot be interchangeable. Unlike a Deployment (where replicas are identical and disposable), a StatefulSet gives each pod a stable name, a stable DNS hostname, and its own PersistentVolumeClaim that follows it across rescheduling.

The classic use case is a database cluster: each replica needs to know its own identity, communicate with specific peers by name, and write to its own storage — none of which works with a Deployment.

<!-- DEEP_DIVE -->

## The three guarantees

StatefulSets provide three things that Deployments don't:

**Stable pod identity** — pods are named `<statefulset>-0`, `<statefulset>-1`, etc. The name is consistent across restarts. Pod `my-db-0` is always `my-db-0`, not some randomly generated name.

**Stable network hostname** — when paired with a headless Service, each pod gets a DNS record like `my-db-0.my-db.default.svc.cluster.local`. Other pods can address a specific replica directly, not just the service's load-balanced endpoint.

**Stable per-replica storage** — each pod gets its own PVC, created from a `volumeClaimTemplate`. The PVC is named `<template>-<pod>` (e.g. `data-my-db-0`) and is never deleted when the pod is rescheduled. The replacement pod finds the same data waiting.

## Writing a StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: my-db
spec:
  serviceName: my-db        # must match the headless Service name
  replicas: 3
  selector:
    matchLabels:
      app: my-db
  template:
    metadata:
      labels:
        app: my-db
    spec:
      containers:
        - name: db
          image: postgres:15
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: gp3
        resources:
          requests:
            storage: 20Gi
```

When you apply this, Kubernetes creates three pods (`my-db-0`, `my-db-1`, `my-db-2`) and three PVCs (`data-my-db-0`, `data-my-db-1`, `data-my-db-2`). Each pod mounts only its own PVC.

## The headless Service

A StatefulSet requires a headless Service — a Service with `clusterIP: None`. Without a headless Service you don't get per-pod DNS records.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-db
spec:
  clusterIP: None           # headless
  selector:
    app: my-db
  ports:
    - port: 5432
```

With this in place, `my-db-0.my-db.default.svc.cluster.local` resolves directly to pod `my-db-0`. This is how database clustering software (Postgres, Cassandra, Redis Sentinel) knows how to reach specific peers.

## Ordering guarantees

StatefulSets start pods in order and wait for each to be Ready before starting the next:

- `my-db-0` starts, becomes Ready
- `my-db-1` starts, becomes Ready
- `my-db-2` starts

Scale-down is the reverse: `my-db-2` terminates first, then `my-db-1`, then `my-db-0`.

This ordering matters for databases that elect a leader or require a primary to be up before replicas join. For workloads that don't need it, you can set `podManagementPolicy: Parallel` to start all pods simultaneously.

## What doesn't get cleaned up automatically

Deleting a StatefulSet does **not** delete its PVCs. This is intentional — you don't want to lose database state just because you reapplied a manifest. PVCs must be deleted manually. Be deliberate about this in CI environments where you're tearing things down.

## When not to use StatefulSets

Running a database inside Kubernetes is operationally harder than it looks. You're responsible for backups, replication configuration, failover, and upgrades — on top of running Kubernetes itself.

For most teams, the right answer is a managed database (RDS, Cloud SQL, PlanetScale) outside the cluster, accessed over the network. You lose nothing architecturally and gain a lot of operational simplicity.

StatefulSets are appropriate when:
- You're running infrastructure software that needs to be self-contained (message queues, caches, search engines)
- You're operating at a scale where a managed service is prohibitively expensive
- You have the platform team capacity to own the operational burden

<!-- RESOURCES -->

- [Kubernetes Docs - StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) -- type: docs, time: 25m
- [Kubernetes Docs - Running a Replicated Stateful Application](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/) -- type: tutorial, time: 30m
