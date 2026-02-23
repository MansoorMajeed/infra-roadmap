---
id: daemonsets
title: DaemonSets
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - daemonsets
  - nodes
  - logging
  - monitoring
  - k8s
category: concept
milestones:
  - >-
    Understand what a DaemonSet guarantees: exactly one pod per node,
    automatically added when nodes join and removed when nodes leave
  - >-
    Know the canonical use cases: log collectors, monitoring agents, network
    plugins, storage drivers
  - >-
    Use a node selector or affinity to run a DaemonSet only on a subset of
    nodes (e.g. only GPU nodes, only spot nodes)
  - >-
    Know the update strategies: RollingUpdate (replace pods one at a time) vs
    OnDelete (replace only when you manually delete the old pod)
---

A DaemonSet ensures that exactly one copy of a pod runs on every node in the cluster — or on a selected subset of nodes. When a new node joins the cluster, the DaemonSet pod is automatically scheduled there. When a node is removed, that pod is cleaned up. There's no replica count to manage.

<!-- DEEP_DIVE -->

## When to use a DaemonSet

DaemonSets are for node-level infrastructure concerns — software that needs to run everywhere because it's collecting from or providing something to the node itself:

- **Log collectors** (Fluent Bit, Fluentd) — tail container logs from every node and forward them to a central log store
- **Monitoring agents** (Prometheus node-exporter, Datadog agent) — collect node-level metrics: CPU, memory, disk, network
- **Network plugins** (Calico, Cilium, Weave) — implement pod networking and network policy at the kernel level on each node
- **Storage drivers** (CSI node plugins) — mount volumes on nodes where pods need them
- **Security agents** — host-level intrusion detection, vulnerability scanning

For application workloads (your API, your web server), use a Deployment. DaemonSets are for infrastructure that serves the node, not the application.

## Writing a DaemonSet

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    metadata:
      labels:
        app: fluent-bit
    spec:
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
      containers:
        - name: fluent-bit
          image: fluent/fluent-bit:2.2
          volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: containers
              mountPath: /var/lib/docker/containers
              readOnly: true
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: containers
          hostPath:
            path: /var/lib/docker/containers
```

The `hostPath` volumes give the DaemonSet pod access to the node's filesystem — typical for log collectors that need to read files the container runtime writes.

## Tolerations and control plane nodes

By default, the Kubernetes control plane has a taint (`node-role.kubernetes.io/control-plane:NoSchedule`) that prevents regular pods from landing there. DaemonSets respect this taint too.

If you need your DaemonSet on control plane nodes as well (some networking plugins do), add a toleration:

```yaml
tolerations:
  - key: node-role.kubernetes.io/control-plane
    operator: Exists
    effect: NoSchedule
```

## Running on a subset of nodes

If you only want the DaemonSet on certain nodes — GPU nodes, spot nodes, nodes in a specific pool — use a node selector:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        cloud.google.com/gke-nodepool: gpu-pool
```

Or use node affinity for more expressive rules. The DaemonSet will only schedule pods on nodes whose labels match.

## Update strategy

DaemonSets support two update strategies:

**RollingUpdate** (default) — replaces DaemonSet pods one at a time across nodes, respecting `maxUnavailable`. Use this for most workloads.

**OnDelete** — Kubernetes only creates the new pod template on a node after you manually delete the existing DaemonSet pod on that node. Useful when you need explicit control over when each node gets updated (e.g., infrastructure components where you want to validate each node before proceeding).

```yaml
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
```

## Difference from a Deployment

The key distinction: a Deployment manages a desired replica count across available nodes. A DaemonSet doesn't have a replica count — it has a desired state of "one pod per matching node." As your cluster grows or shrinks, the DaemonSet adjusts automatically without any configuration changes.

<!-- RESOURCES -->

- [Kubernetes Docs - DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) -- type: docs, time: 20m
