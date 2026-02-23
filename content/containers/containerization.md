---
id: containerization
title: What Is Containerization?
zone: containers
edges:
  to:
    - id: writing-a-dockerfile
      question: I get it. How do I build a container for my app?
      detail: >-
        I understand what containers are in theory, but I have no idea where to
        start making one for my own code. What actually goes in that Dockerfile,
        and how do I know if I've got it right?
    - id: docker-first-container
      question: I've never actually used Docker before. Where do I start?
      detail: >-
        All of this makes sense conceptually but I haven't actually run a container
        yet. I don't know what commands to use or how any of it works in practice.
    - id: container-isolation
      question: How does Docker actually isolate containers from each other and from the host?
      detail: >-
        I keep hearing that containers aren't VMs but I don't really understand what
        that means. What's actually stopping one container from seeing another
        container's processes, or from accessing the host filesystem?
difficulty: 1
tags:
  - containers
  - docker
  - containerization
  - concept
category: concept
milestones:
  - Understand the problem containers solve
  - Know the difference between an image and a container
  - Understand why container images solve the 'works on my machine' problem
  - Know what a container runtime is
---

Before containers, deploying software meant carefully recreating a specific environment on every machine it needed to run on — the right OS version, the right runtime, the right system libraries, all installed in the right order. A bug that only appeared on the staging server but not on anyone's laptop was often a missing library, a different Python version, or a subtly misconfigured dependency. This was called **dependency hell**, and it made deployments slow, brittle, and hard to reason about.

A container packages an application together with everything it needs to run: the runtime, libraries, config, and code. The resulting artifact is a **container image** — a self-contained, immutable snapshot. A **container** is what you get when you run that image: a live process with its own isolated view of the system. The image never changes; you can run dozens of containers from the same image simultaneously. This is why containers solve the "works on my machine" problem — the machine is shipped with the code.

<!-- DEEP_DIVE -->

## The problem before containers

The classic deployment workflow went something like this: a developer writes code on their laptop running macOS, tests it against a locally installed Postgres 14, and ships it. The staging server runs Ubuntu 20.04 with Postgres 13. Production runs CentOS with a slightly different glibc. Each environment was set up manually, months or years apart, by different people following slightly different runbooks.

This created a category of bugs that were infuriating precisely because they were environmental rather than logical — the code was correct, but the context around it differed. **Environment drift** compounds over time: the longer a server runs, the further it drifts from its original state and from every other server in the fleet.

The solution before containers was to invest heavily in configuration management (Chef, Puppet, Ansible) to keep environments in sync. That helped, but it was still specifying the environment separately from the code. Containers took a different approach: bundle the environment into the artifact itself.

## Images vs containers

A **container image** is a static, read-only artifact. It contains your application code, the language runtime it needs, system libraries, and any other files required to run. It's built once and can be stored in a registry (like Docker Hub or a private registry) and pulled anywhere.

A **container** is a running instance of an image. When you run an image, the container runtime creates a new process with an isolated view of the filesystem, network, and process tree. The container has a thin writable layer on top of the read-only image layers — writes go there, not into the image itself.

The relationship: one image → many containers. You can run ten instances of an nginx image simultaneously; each is an independent container sharing the same underlying image layers. When you stop and delete a container, the image is untouched and its writable layer is discarded.

Building and running are distinct operations: `docker build` produces an image, `docker run` instantiates a container from it.

## The container runtime

Docker is the most familiar name, but it's not the only option. Docker itself is built on **containerd**, a container runtime that handles the low-level work of pulling images, managing container lifecycles, and interfacing with the kernel. The **OCI (Open Container Initiative)** standard defines the image format and runtime interface — which means an image built with Docker will run on Kubernetes, Podman, or any OCI-compliant runtime without modification.

When you run `docker run nginx`, the runtime pulls the image if needed, creates a set of Linux **namespaces** (giving the container its own isolated process tree, network stack, and filesystem view) and **cgroups** (limiting what CPU and memory it can consume), and then starts the process. From the container's perspective, it has its own system. From the host's perspective, it's just a process with some kernel-enforced boundaries around it.

The isolation mechanisms (namespaces) and resource controls (cgroups) are covered in depth in later nodes — the important thing to understand here is that containers are a kernel feature that Docker exposes, not magic that Docker invented.

## What containers are not

Containers are often confused with virtual machines, but the underlying mechanics are very different. A **VM** runs a full OS kernel on top of a hypervisor. Each VM has its own kernel, its own device drivers, its own init system — which is why VMs take tens of seconds to boot and use gigabytes of disk per instance.

Containers share the host kernel. There is no second OS, no hypervisor. This makes containers start in milliseconds, use far less disk, and have near-zero overhead. The tradeoff is isolation: a VM's kernel is fully separate from the host; a container's process isolation relies on kernel namespaces, which have a larger attack surface.

A practical consequence: **you cannot run Windows containers on a Linux host**, because there is no Windows kernel. (Docker Desktop on macOS and Windows handles this by running a lightweight Linux VM under the hood.) Containers give you process isolation, not OS-level virtualization.

<!-- RESOURCES -->

- [What is a container? — Docker Docs](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)
- [OCI Image Format Specification](https://specs.opencontainers.org/image-spec/)
- [OCI Runtime Specification](https://specs.opencontainers.org/runtime-spec/)
