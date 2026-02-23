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

The Kubernetes control plane — the API server, etcd, the scheduler, the controller manager — is the most operationally demanding part of the system. Managed Kubernetes services like EKS, GKE, and AKS run the control plane for you. Self-managed means you own all of it. The choice determines how much of your time goes to Kubernetes infrastructure versus the workloads running on it.

<!-- DEEP_DIVE -->

## What the control plane actually is

The control plane is the brain of the cluster. When you run `kubectl apply`, the request goes to the API server. The scheduler decides which node gets the pod. The controller manager reconciles the desired state (3 replicas) against reality (2 running). etcd is the distributed key-value store that holds all cluster state.

Running this yourself means:
- Provisioning and maintaining multiple API server instances for HA
- Operating an etcd cluster (etcd has its own failure modes and backup requirements)
- Handling control plane upgrades without dropping the API surface
- Monitoring the control plane health separately from your workloads

None of these are insurmountable, but they're a full-time concern. etcd especially — a corrupted or lost etcd cluster is a total cluster loss.

## What managed clusters give you

EKS (AWS), GKE (Google Cloud), and AKS (Azure) all:
- Run and maintain the control plane in their infrastructure
- Handle HA across availability zones automatically
- Manage etcd backups
- Handle control plane version upgrades (to varying degrees)
- Integrate with cloud IAM, load balancers, and storage

You still own: your nodes, your workloads, add-on components (CNI, ingress controllers, monitoring), and node version upgrades. But the hardest operational piece is off your plate.

## EKS vs GKE vs AKS

These three are not equivalent in UX or features.

**GKE** is the most polished. Autopilot mode abstracts node management entirely. Built-in integration with Cloud Logging, Cloud Monitoring, and Google's networking stack. Generally considered the easiest experience.

**EKS** is the most widely deployed. AWS ecosystem integration is strong (IAM, ALB, EFS, Fargate). The experience is more DIY than GKE — more decisions left to you. Node group management is more manual.

**AKS** is strong if you're already in Azure. Azure AD integration, Windows node support. Generally considered between GKE and EKS in operational simplicity.

If you're cloud-agnostic, GKE. If you're already on AWS, EKS. If you're on Azure, AKS. The choice is usually determined by where the rest of your infrastructure lives.

## When self-managed makes sense

Self-managed Kubernetes (kubeadm, k3s, RKE2) makes sense when:
- You're on-premises with no managed option
- You're running at a scale where the per-cluster control plane cost matters ($150–$300/month for managed control planes adds up at hundreds of clusters)
- You have very specific Kubernetes API customization requirements
- You're at a large org with a dedicated platform team that wants full control

For most teams, managed is correct. The time cost of running a control plane yourself exceeds the money saved unless you have specific reasons to go self-managed.

## The real cost calculation

Managed isn't free — GKE, EKS, and AKS charge for the control plane even if it's just one cluster. But engineer time is expensive. Spending 20% of a senior engineer's time managing Kubernetes infrastructure instead of working on product quickly exceeds the cost of a managed cluster.

The honest rule: if you don't have someone who wants to specialize in Kubernetes operations, use a managed cluster.

<!-- RESOURCES -->

- [Kubernetes Docs - Production Environment](https://kubernetes.io/docs/setup/production-environment/) -- type: docs, time: 15m
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html) -- type: docs, time: 20m
- [GKE Overview](https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview) -- type: docs, time: 15m
