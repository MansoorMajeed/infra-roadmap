---
id: choosing-a-cni
title: Choosing a CNI Plugin
zone: kubernetes
edges:
  to:
    - id: ebpf-and-cilium
      question: >-
        Cilium keeps coming up as the answer to everything — networking,
        security, observability. What makes it so different from the others?
      detail: >-
        Every comparison ends with 'or just use Cilium.' It apparently uses
        something called eBPF to handle networking directly in the kernel, can
        replace kube-proxy, enforces network policies, and gives you visibility
        into every network flow. That sounds too good to be true. What's the
        catch, and what even is eBPF?
difficulty: 2
tags:
  - kubernetes
  - cni
  - flannel
  - calico
  - cilium
  - networking
  - k8s
category: concept
milestones:
  - >-
    Know Flannel: simplest CNI, overlay-only, no network policy enforcement —
    fine for learning and dev clusters
  - >-
    Know Calico: supports BGP and overlay, enforces network policies, mature and
    widely deployed in production
  - >-
    Know Cilium: eBPF-based, network policies, can replace kube-proxy, built-in
    observability with Hubble
  - >-
    Understand cloud provider CNIs (AWS VPC CNI, Azure CNI, GKE native): tight
    integration with cloud networking, limited portability
  - >-
    Know what Canal is: Flannel's networking with Calico's network policy
    enforcement — a common combination
  - >-
    Be able to pick a CNI based on actual needs: do you need network policies?
    eBPF? Cloud-native IPs? Performance? Start there.
---

TODO
