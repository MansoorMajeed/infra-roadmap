---
id: why-kubernetes
title: Why Kubernetes?
zone: kubernetes
edges:
  to:
    - id: pods
      question: Kubernetes makes sense. How do I actually run a container on it?
      detail: >-
        Okay, I want to run my container on this cluster. I know Docker, I know
        docker run — but how do I do the equivalent in Kubernetes? kubectl run?
        A YAML file? And what is this 'Pod' thing I keep seeing in the docs — is
        that just a fancy word for a container?
    - id: namespaces
      question: >-
        Before I run anything — how does Kubernetes keep different teams, apps,
        and environments from interfering with each other?
      detail: >-
        If staging and production both run on the same cluster, and teammates
        are deploying their stuff too — what stops everything from getting
        tangled together? I need some kind of separation before this becomes a
        mess.
difficulty: 1
tags:
  - kubernetes
  - orchestration
  - containers
  - docker
  - k8s
  - devops
category: concept
milestones:
  - Explain what problems Kubernetes solves that Docker Compose alone doesn't
  - Understand the control plane vs worker node distinction
  - Know what kubectl is and how to connect it to a cluster
  - Run a local cluster with kind or minikube
---

Running containers in production means answering hard questions: which server does this container go on? What happens when it crashes? How do you ship a new version without dropping traffic? Kubernetes is the system that answers all of them — and has become the de facto standard for running containers at scale.

<!-- DEEP_DIVE -->

## The problem Kubernetes solves

Docker Compose runs containers on one machine. That works fine for a single server, but production systems have harder problems. You need containers to survive machine failures. You need to run more of them during traffic spikes and fewer when it's quiet. You need to ship new versions without downtime. You need to restart them when they crash. Someone — or something — has to coordinate all of that.

That coordinator is called an **orchestrator**. Kubernetes is the dominant one. It started inside Google (where a similar internal system called Borg had been running for years), was open-sourced in 2014, and became the standard quickly enough that cloud providers essentially had to offer it as a managed service. Today, "container orchestration" and "Kubernetes" are nearly synonymous.

## What Kubernetes actually does

Kubernetes runs your containers on a cluster of machines and continuously works to keep the cluster matching the state you declared. You don't say "run this container on server 3." You say "I want 5 copies of this container running, each with at least 500MB of RAM." Kubernetes picks the servers, starts the containers, and if one crashes, automatically replaces it. If a server dies, the workloads from that server are rescheduled onto healthy ones.

This model — declare the desired state, let the system reconcile reality to match it — is what makes Kubernetes powerful. And it's the source of most of its complexity.

## The control plane and worker nodes

A Kubernetes cluster is split into two parts:

- **Control plane** — the brain. Runs the API server, scheduler, controller manager, and etcd (the cluster's key-value store). The control plane makes decisions: where to schedule a Pod, when to replace a failed one, how to roll out an update.
- **Worker nodes** — the muscle. These are the machines that actually run your containers. Each node runs `kubelet` (communicates with the control plane), `kube-proxy` (handles networking), and a container runtime (usually containerd).

When you use a managed Kubernetes service like EKS, GKE, or AKS, the cloud provider runs the control plane for you. You manage the worker nodes — or let the provider manage those too with managed node groups.

## kubectl — the control plane's interface

Everything you do with Kubernetes goes through `kubectl`, the command-line tool that talks to the Kubernetes API server. `kubectl apply -f deployment.yaml` sends your manifest to the API server. `kubectl get pods` asks the API server for the current pod list. `kubectl logs my-pod` streams logs from the kubelet on whichever node that pod is running.

To use `kubectl`, it needs to know which cluster to talk to — this is configured in `~/.kube/config`. When you use a managed cluster, the cloud provider's CLI typically writes the right config for you (`aws eks update-kubeconfig`, `gcloud container clusters get-credentials`).

## Running locally first

Before running Kubernetes in production, run it on your laptop. The two most common tools:

- **kind** (Kubernetes IN Docker) — runs a full cluster using Docker containers as nodes. Lightweight, fast to start, great for CI and local development.
- **minikube** — starts a VM or container with a single-node cluster. Slightly heavier but has built-in addons for common tools.

Both give you a real Kubernetes cluster locally. Start with kind — it's the faster path to "I have a working cluster."

<!-- RESOURCES -->

- [Kubernetes Documentation - What is Kubernetes](https://kubernetes.io/docs/concepts/overview/) -- type: docs, time: 20m
- [kind - Kubernetes in Docker](https://kind.sigs.k8s.io/) -- type: tool, time: 15m
- [minikube - Run Kubernetes Locally](https://minikube.sigs.k8s.io/docs/start/) -- type: tool, time: 15m
- [The Illustrated Children's Guide to Kubernetes](https://www.cncf.io/phippy/the-childrens-illustrated-guide-to-kubernetes/) -- type: article, time: 15m
- [Kubernetes the Hard Way (Kelsey Hightower)](https://github.com/kelseyhightower/kubernetes-the-hard-way) -- type: tutorial, time: 4h
