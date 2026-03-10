---
id: what-is-cni
title: "CNI: The Plugin That Builds the Network"
zone: kubernetes
edges:
  to:
    - id: overlay-vs-native-routing
      question: >-
        My CNI has different modes for how it moves traffic between nodes — one
        wraps packets, another uses real routes. What's the difference?
      detail: >-
        I'm setting up my CNI and it's asking me to choose between 'overlay' and
        'native routing.' One apparently wraps each pod's traffic inside another
        layer to send it across nodes. The other makes the real network aware of
        pod IPs. I don't know which one I want or what the trade-offs are.
    - id: choosing-a-cni
      question: >-
        Flannel, Calico, Cilium, Weave, AWS VPC CNI — there are a dozen
        options. How do I pick?
      detail: >-
        My cluster came with a default CNI and I never questioned it. But now I
        need network policies and someone said my CNI doesn't support them.
        Another person says I should use Cilium for everything. I have no idea
        what the actual differences are.
difficulty: 2
tags:
  - kubernetes
  - cni
  - networking
  - kubelet
  - ipam
  - k8s
category: concept
milestones:
  - >-
    Understand that CNI (Container Network Interface) is a spec — it defines the
    interface between container runtimes and network plugins
  - >-
    Know the lifecycle: when kubelet starts a pod, it calls the CNI plugin to
    assign an IP and wire up the network
  - >-
    Understand what IPAM (IP Address Management) does: allocates pod IPs from a
    configured range, tracks which IPs are in use
  - >-
    Know that CNI plugin chaining lets you stack plugins — e.g., a main network
    plugin plus a bandwidth-limiting plugin
  - >-
    Recognize the symptom of a broken CNI: pods stuck in ContainerCreating with
    network setup errors
---

CNI stands for Container Network Interface. It's not a product — it's a specification that defines how container runtimes (like containerd) should talk to network plugins. When kubelet starts a pod, it calls the CNI plugin to do the actual networking work: assign an IP, create the virtual interfaces, and set up routes. The CNI plugin is what makes the Kubernetes networking contract a reality.

<!-- DEEP_DIVE -->

## What CNI actually is

CNI is a spec maintained by the CNCF. It defines a simple interface: when a container is created, the runtime calls the CNI plugin with "add this container to the network." When the container is deleted, it calls "remove this container from the network."

The plugin is just a binary on the node. Kubelet finds it in `/opt/cni/bin/` and calls it with the container's network namespace as an argument. The plugin does whatever it needs to — create a veth pair, assign an IP, program routes — and returns the assigned IP address.

```
Pod starts → kubelet → calls CNI plugin binary → plugin assigns IP, creates veth, configures routes → pod has networking
```

## How IP addresses get assigned

CNI plugins use an IPAM (IP Address Management) module to assign IP addresses. The most common approach:

- Each node gets a slice of the cluster's pod CIDR (e.g., Node 1 gets `10.244.1.0/24`, Node 2 gets `10.244.2.0/24`)
- When a pod starts on Node 1, the IPAM module picks the next available IP from `10.244.1.0/24`
- The assignment is tracked so two pods never get the same IP

In cloud environments, the IPAM approach can be different. AWS VPC CNI, for example, assigns real VPC IP addresses to pods by requesting secondary IPs from the EC2 API.

## The CNI configuration

The CNI config lives on each node, typically at `/etc/cni/net.d/`. It tells kubelet which plugin to use and how to configure it:

```json
{
  "cniVersion": "1.0.0",
  "name": "my-network",
  "type": "calico",
  "ipam": {
    "type": "calico-ipam"
  }
}
```

The `type` field maps to a binary in `/opt/cni/bin/`. When you install a CNI like Calico or Cilium, it drops its binary there and writes this config file.

## Plugin chaining

CNI supports chaining multiple plugins together. The first plugin does the main networking (assign IP, create veth), and subsequent plugins add features on top:

```json
{
  "cniVersion": "1.0.0",
  "name": "my-network",
  "plugins": [
    { "type": "calico" },
    { "type": "bandwidth", "ingressRate": 1000000 },
    { "type": "portmap", "capabilities": { "portMappings": true } }
  ]
}
```

This runs Calico for the main network setup, then applies bandwidth limiting, then sets up port mappings. Each plugin in the chain gets called in order.

## When the CNI breaks

If the CNI plugin is misconfigured, missing, or crashing, pods get stuck in `ContainerCreating`. You'll see events like:

```
Warning  FailedCreatePodSandBox  network: failed to setup sandbox
```

Common causes:
- The CNI plugin binary is missing from `/opt/cni/bin/`
- The config in `/etc/cni/net.d/` is invalid or points to the wrong plugin
- The CNI pod itself (Calico, Cilium, etc.) is crash-looping on that node
- IP address exhaustion — the node's CIDR range is full

Check the CNI pods first:

```bash
kubectl get pods -n kube-system | grep -E "calico|cilium|flannel"
```

If those pods aren't healthy, no new pods on that node can get networking.

## Why the CNI choice matters

Your CNI plugin determines:
- **How traffic crosses nodes** — overlay (VXLAN) or native routing (BGP)
- **Whether network policies work** — Flannel doesn't enforce them, Calico and Cilium do
- **Performance characteristics** — overlay adds latency, eBPF-based CNIs skip iptables
- **Available features** — some CNIs provide encryption, observability, or can replace kube-proxy

This isn't something you can easily swap later. Changing CNIs in a running cluster means draining all nodes and reconfiguring networking — effectively a cluster rebuild. Pick carefully up front.

<!-- RESOURCES -->

- [CNI Specification](https://www.cni.dev/docs/spec/) -- type: docs, time: 15m
- [Kubernetes Docs - Network Plugins](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/) -- type: docs, time: 10m
- [Understanding CNI](https://www.tkng.io/cni/) -- type: guide, time: 20m
