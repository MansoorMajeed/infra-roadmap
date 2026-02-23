---
id: managed-vs-self-managed
title: Managed vs Self-Managed Kubernetes
zone: kubernetes-production
edges:
  to:
    - id: cluster-topology
      question: >-
        I know I'm using a managed cluster. Now — should I have one cluster or
        many?
      detail: >-
        I've got my managed cluster running but staging and production are in
        the same cluster separated by namespaces. I keep wondering whether
        that's actually good enough isolation or if I need separate clusters
        entirely.
    - id: cluster-upgrades
      question: >-
        New Kubernetes versions keep dropping. How do I actually upgrade without
        taking everything down?
      detail: >-
        My cluster is running 1.28 and I'm already two minor versions behind. I
        have no idea what the upgrade process looks like — whether my workloads
        survive it or whether there's a window of downtime I need to plan around.
difficulty: 2
tags:
  - kubernetes
  - eks
  - gke
  - aks
  - managed
  - control-plane
  - k8s
  - production
category: concept
milestones:
  - Understand what a control plane is and why running it yourself is hard
  - 'Know what EKS, GKE, and AKS handle for you vs what you still own'
  - >-
    Understand the real costs: managed isn't free, but operator time has a cost
    too
  - 'Know when self-managed (kubeadm, k3s) is actually the right call'
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
