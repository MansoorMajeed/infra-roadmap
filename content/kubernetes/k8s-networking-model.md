---
id: k8s-networking-model
title: How Kubernetes Networking Works
zone: kubernetes
edges:
  to:
    - id: pod-to-pod-networking
      question: >-
        Every pod gets its own IP and can reach every other pod — but how? My
        pods are on completely different machines.
      detail: >-
        I have pods on Node A and pods on Node B. They're on different machines
        with different network cables. But somehow a pod on one node can just
        curl a pod on another node by IP and it works. What is actually carrying
        that traffic between machines? I want to understand what's happening
        under the hood.
    - id: what-is-cni
      question: >-
        Every pod gets an IP and the network just works — but who sets it all up
        when a pod starts?
      detail: >-
        When I run a pod, it gets an IP address and can talk to other pods. But
        Kubernetes itself doesn't do networking — it says right in the docs that
        it delegates to a 'network plugin.' I've seen clusters break because
        this plugin was misconfigured, and I don't even know what it is.
    - id: coredns
      question: >-
        I curl `my-service.default.svc.cluster.local` and it resolves — who's
        running a DNS server in my cluster?
      detail: >-
        I've never set up a DNS server in this cluster, but every pod can
        resolve Service names. I don't know where it runs, what happens if it
        crashes, or why some DNS lookups take five seconds when they should be
        instant. It's a black box that everything depends on.
    - id: kube-proxy-basics
      question: >-
        A Service gives me a ClusterIP that I can reach from any pod — but that
        IP doesn't belong to anything. How does that work?
      detail: >-
        I ran `kubectl get svc` and got a ClusterIP like 10.96.0.1. I can curl
        it from any pod in the cluster and it reaches my app. But that IP isn't
        any pod's IP, and it's not any node's IP. It's a made-up address that
        somehow routes to the right place. What is doing that?
difficulty: 2
tags:
  - kubernetes
  - networking
  - pod-network
  - flat-network
  - k8s
category: concept
milestones:
  - >-
    Understand the Kubernetes networking contract: every pod gets a real routable
    IP, no NAT between pods, all pods can reach all other pods
  - >-
    Know how this differs from Docker's default bridge networking where
    containers share an IP and use port mapping
  - >-
    Identify the three networking problems Kubernetes solves: pod-to-pod,
    pod-to-service, and external-to-cluster
  - >-
    Understand that Kubernetes defines the networking rules but doesn't
    implement them — a network plugin handles the actual implementation
---

Kubernetes networking is built on one big promise: every pod gets its own real IP address, and every pod can talk to every other pod directly — no NAT, no port mapping. This is fundamentally different from Docker's default networking, and understanding this contract is the key to understanding everything else about how traffic moves inside a cluster.

<!-- DEEP_DIVE -->

## The networking contract

Kubernetes doesn't ship a networking implementation. Instead, it defines a set of rules that any networking solution must follow:

1. **Every pod gets its own IP address.** Not a port on the node's IP — its own unique IP, routable within the cluster.
2. **All pods can communicate with all other pods directly.** A pod on Node A can reach a pod on Node B by IP without any NAT or tunneling (from the pod's perspective).
3. **Agents on a node can communicate with all pods on that node.** Processes running directly on the node (like kubelet) can reach pod IPs on that node.

That's it. Kubernetes says "make these things true" and hands the actual work to a network plugin.

## How this differs from Docker

If you've used Docker without Kubernetes, you're used to a different model. Docker's default bridge networking gives every container a private IP on a virtual bridge (`docker0`), but those IPs aren't routable outside the host. To access a container from another machine, you map a container port to a host port with `-p 8080:80`.

Kubernetes throws that away entirely. There's no port mapping. Pod IPs are real within the cluster. If your pod is at `10.244.1.5`, any other pod in the cluster can `curl 10.244.1.5:8080` directly.

This is why you never see `-p` flags or port mapping in Kubernetes — every pod listens on whatever port it wants, and there are no collisions because every pod has its own IP.

## Three networking problems

Kubernetes networking solves three distinct problems, each at a different layer:

### Pod-to-pod

How does pod `10.244.1.5` on Node A reach pod `10.244.2.3` on Node B? Something has to move packets between nodes and deliver them to the right pod. This is where the CNI plugin does its work.

### Pod-to-service

Pods die and get recreated with new IPs. Services provide a stable virtual IP (ClusterIP) that load-balances across a changing set of pod IPs. Something has to intercept traffic to that virtual IP and route it to a real pod. This is what kube-proxy handles.

### External-to-cluster

Users outside the cluster need to reach your app. NodePort, LoadBalancer Services, and Ingress each solve this differently — from raw port exposure to cloud load balancers to HTTP routing.

## Who implements the contract?

Kubernetes delegates networking to external components:

- **CNI plugin** (Calico, Cilium, Flannel, etc.) — creates the pod network, assigns IPs, routes traffic between nodes
- **kube-proxy** — handles Service routing by programming iptables/IPVS rules on each node
- **CoreDNS** — provides DNS-based service discovery so pods can find Services by name

Each of these is a separate system. They work together but are independently swappable. You can replace your CNI without touching kube-proxy, or replace kube-proxy with Cilium's eBPF implementation without changing how DNS works.

## Seeing it in action

You can observe the networking model directly:

```bash
# Get a pod's IP
kubectl get pod my-app -o wide
# NAME     READY   IP           NODE
# my-app   1/1     10.244.1.5   node-1

# From another pod, you can reach it directly
kubectl exec other-pod -- curl 10.244.1.5:8080

# The node also has a different IP
kubectl get node node-1 -o wide
# NAME     INTERNAL-IP    ...
# node-1   192.168.1.10   ...
```

The pod IP (`10.244.1.5`) and the node IP (`192.168.1.10`) are on completely different subnets. The CNI plugin is responsible for making traffic to `10.244.x.x` reach the right pod on the right node.

<!-- RESOURCES -->

- [Kubernetes Docs - Cluster Networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/) -- type: docs, time: 15m
- [A Guide to the Kubernetes Networking Model](https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/) -- type: article, time: 20m
- [Kubernetes Networking Demystified](https://www.tkng.io/) -- type: guide, time: 30m
