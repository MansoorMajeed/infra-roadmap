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

TODO
