---
id: container-isolation
title: How Containers Isolate Processes
zone: containers
edges:
  to:
    - id: container-resources
      question: Okay, so processes are isolated — but what stops a container from using all the CPU and RAM?
      detail: >-
        I get that containers have their own process tree and network stack, but
        isolation alone doesn't stop a runaway container from starving everything
        else on the host. How does Docker limit what a container can actually consume?
difficulty: 2
tags:
  - containers
  - linux
  - namespaces
  - internals
category: concept
milestones:
  - Understand what Linux namespaces are and why they exist
  - "Know the six namespace types: PID, net, mnt, user, UTS, IPC"
  - Understand how PID namespaces make process 1 inside a container
  - Know what network namespace isolation means for container networking
  - Be able to explain why containers aren't VMs
---

When people say "containers aren't VMs," they mean something specific about the kernel. A VM runs its own OS kernel on a hypervisor, completely separated from the host. A container is just a process — or a group of processes — running on the host kernel, but wrapped in a set of Linux kernel features that give it a private view of the system. That mechanism is **namespaces**.

Namespaces don't create a new kernel or a new OS. They partition existing global resources — process IDs, network interfaces, mount points — so that each container sees only its own slice. Understanding the six namespace types is understanding exactly what "isolated" means and, equally importantly, what it doesn't mean.

<!-- DEEP_DIVE -->

## The problem isolation solves

Without isolation, every process on a system shares the same global resources. Every process can see every other process in `ps`. Every process shares the same network stack, which means two processes trying to listen on port 80 conflict directly. Every process has access to the same filesystem tree from `/`.

This makes running multiple applications on a shared host messy. Port conflicts are common. A misconfigured process can see — and potentially interfere with — another application's processes. Dependency versions collide at the system level.

VMs solve this completely by running separate kernels: each VM has its own isolated OS, its own network stack, its own filesystem. The tradeoff is cost — each VM needs its own kernel, its own init system, its own copy of every shared library. Containers solve the same problem more efficiently by partitioning the existing kernel's resources rather than duplicating them.

## Linux namespaces

A **namespace** wraps a global system resource and gives a process its own private instance of it. Processes inside the namespace see the namespaced resource as if it were theirs alone; processes outside see their own separate instance.

Namespaces are a kernel feature, entirely independent of Docker. The `unshare` command lets you create namespaces manually from the command line. Docker's main job, at the process level, is to call the right kernel APIs to create a set of namespaces for each container and then start the container process inside them.

## The six namespace types

**PID** — Each container gets its own process ID tree. The first process inside the container gets PID 1, regardless of what PID it holds on the host. From inside the container, `ps aux` shows only the container's processes. From the host, the same process has a regular host PID and is visible alongside everything else. This is why a container can have its own init process at PID 1 without conflicting with the host's init.

**net** — Each container gets its own network stack: its own virtual network interfaces, its own IP address, its own routing table, and its own port space. Port 80 inside the container is completely separate from port 80 inside a different container or on the host. This is why port mapping (`-p 8080:80`) is necessary — it creates a rule connecting a host port to a container's private port.

**mnt** — Each container gets its own set of mount points. The container sees its image layers as its root filesystem (`/`), completely separate from the host's `/`. Bind mounts and volumes punch deliberate holes through this boundary.

**UTS** — Each container can have its own hostname. This is why `hostname` inside a container returns the container ID by default rather than the host's hostname.

**user** — Allows mapping container UIDs/GIDs to different UIDs/GIDs on the host. This enables "rootless containers" where a process that appears to be root inside the container maps to an unprivileged user on the host. This namespace is **not enabled by default** in standard Docker configurations and requires additional setup.

**IPC** — Each container gets its own inter-process communication namespace — its own shared memory segments and POSIX message queues. This prevents containers from accidentally communicating or interfering through IPC mechanisms.

## Why containers aren't VMs

The key difference is the kernel. A VM runs a **full guest OS kernel** on top of a hypervisor (VMware, KVM, Hyper-V). The guest kernel is completely separate — it handles its own system calls, its own scheduling, its own memory management. Even if two VMs run the same Linux distribution, their kernels don't interact.

A container has no guest kernel. Its processes make system calls directly to the **host kernel**, which enforces the namespace boundaries. There is no hypervisor, no kernel boot sequence, no duplicate OS. This is why containers start in milliseconds (no kernel boot) and are much smaller on disk (no OS image).

The isolation tradeoff: namespace isolation is a feature of the host kernel, which means it's only as strong as the kernel's implementation. A kernel vulnerability can potentially allow a container to escape its namespaces. VMs have a larger boundary — escaping a VM means compromising the hypervisor, which is a much harder target. For most workloads the practical difference doesn't matter; for high-security multi-tenant environments (running untrusted code), the distinction is significant.

A practical consequence: you cannot mix kernels. A container that requires a Linux kernel cannot run on a Windows host without a Linux VM underneath it. Docker Desktop on macOS and Windows handles this transparently by running a lightweight Linux VM, which is why Docker works on those platforms — but the containers are still running on a Linux kernel inside that VM.

## Seeing it yourself

You can inspect the namespace files that Docker creates for a running container:

```bash
docker run -d --name test nginx
docker inspect test --format '{{.State.Pid}}'
# outputs something like: 12345
ls -la /proc/12345/ns/
```

Each file in `/proc/<pid>/ns/` is a handle to a namespace. You'll see entries for `net`, `pid`, `mnt`, `uts`, `user`, and `ipc`. Two containers that share a namespace (which you can configure explicitly) will have symlinks pointing to the same inode. Two containers with separate namespaces will have different inodes.

This makes the abstraction concrete: namespaces are real kernel objects, and Docker's job is to create and manage them.

<!-- RESOURCES -->

- [Linux namespaces — man7.org](https://man7.org/linux/man-pages/man7/namespaces.7.html)
- [unshare(1) — man7.org](https://man7.org/linux/man-pages/man1/unshare.1.html)
- [Namespaces in operation — LWN.net series](https://lwn.net/Articles/531114/)
