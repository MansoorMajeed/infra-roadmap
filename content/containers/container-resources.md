---
id: container-resources
title: Limiting Container Resources with cgroups
zone: containers
edges:
  to:
    - id: container-filesystem
      question: Namespaces and cgroups explain isolation and limits — but how do image layers actually work on disk?
      detail: >-
        I understand processes are isolated and resources are capped. But I'm
        curious how Docker stores images — every image seems to share layers with
        others and I don't understand how that works or what it means for my disk.
difficulty: 2
tags:
  - containers
  - linux
  - cgroups
  - internals
  - resources
category: concept
milestones:
  - Understand what cgroups are and what problem they solve
  - Know how Docker uses cgroups to enforce --memory and --cpus limits
  - Understand what happens when a container hits its memory limit (OOM kill)
  - Know how to inspect a container's resource usage with docker stats
  - Understand why resource limits matter in shared environments
---

Namespaces give each container an isolated view of the system, but isolation alone doesn't prevent a container from consuming everything the host has. A container with no limits is just a process — it can allocate as much memory as it wants, and if it leaks or spikes, it can take down the entire host. The kernel feature that solves this is **cgroups** (control groups), and Docker uses them to enforce every `--memory` and `--cpus` limit you set.

Understanding cgroups isn't about memorizing kernel internals — it's about knowing what the limits actually do, what happens when they're hit, and why running containers without them in shared environments is asking for trouble.

<!-- DEEP_DIVE -->

## The problem without limits

On a server running multiple containers, all processes compete for the same physical CPU and RAM. A container with a memory leak will keep allocating until the kernel's out-of-memory killer steps in — at which point it starts killing processes across the host, not just inside the offending container. A CPU-heavy container can consume all available cores and starve everything else, including health checks, monitoring agents, and the container runtime itself.

This is a real operational risk. A single misbehaving container can cascade into the rest of the workload. In a production environment running dozens of containers on a host, limits aren't optional — they're what makes the system predictable.

## What cgroups are

A **cgroup** is a kernel mechanism for grouping processes together and applying resource constraints to the group. The kernel tracks resource consumption per cgroup and enforces configured limits.

When Docker starts a container, it creates a cgroup for that container's processes. Every process spawned inside the container belongs to the same cgroup. The kernel enforces the limits you set against that group as a whole.

Cgroups control more than just CPU and memory: they also handle disk I/O bandwidth, network priority, and device access. Docker exposes the most commonly needed controls through standard flags.

## Setting limits with Docker

```bash
docker run -m 512m --cpus 0.5 nginx
```

**Memory** (`-m` or `--memory`): a hard limit. If the container's processes collectively try to allocate more than 512 MB, the kernel's OOM killer fires and terminates a process inside the container. The container may exit or restart depending on its restart policy.

**CPU** (`--cpus`): a soft limit expressed as a number of CPU cores. `--cpus 0.5` means the container can use at most half a core on average. Unlike the memory limit, this isn't a hard cap — the container can **burst** above the limit when the host has idle CPU capacity, but it will be throttled back under contention. This makes it suitable for bursty workloads without wasting resources when the host is quiet.

You can also set `--memory-swap` to control how much swap a container can use, and `--cpu-shares` for relative priority weighting between containers rather than a fixed limit.

**Always set memory limits in production.** Unbounded memory growth is one of the most common causes of host-level incidents in containerized environments.

## OOM kills

When a container exceeds its memory limit, the kernel sends **SIGKILL** to a process in the cgroup. The container exits with **exit code 137** (128 + 9, where 9 is the signal number for SIGKILL).

Exit code 137 doesn't always mean OOM — it can also be a manual `docker kill` — but it's the first thing to check. Confirm it:

```bash
docker inspect <container> --format '{{.State.OOMKilled}}'
```

If this returns `true`, the container was OOM killed. The causes are either:

1. The memory limit is set too low for the workload.
2. There's a memory leak in the application.

In both cases, `docker stats` (below) is the right starting point for investigation.

## Inspecting resource usage

```bash
docker stats
```

This shows a live, refreshing table of all running containers with their current CPU usage, memory consumption vs. limit, network I/O, and block I/O. It's the fastest way to see what's happening across all containers on a host.

```bash
docker stats <container-name>
```

Scope it to a single container for a focused view.

Key things to watch:

- **MEM USAGE / LIMIT**: if a container is consistently using 80%+ of its memory limit, either the limit is too tight or there's a leak worth investigating before it becomes an OOM kill.
- **CPU %**: values over 100% on a multi-core host are normal (100% = 1 full core). A container pegged at exactly its `--cpus` limit under load is being actively throttled.
- `docker stats` shows instantaneous usage — for trends over time, you need a monitoring system (Prometheus + cAdvisor is the standard approach).

## cgroups v1 vs v2

Linux supports two versions of the cgroups interface. **cgroups v1** uses a separate hierarchy per resource type (memory, cpu, blkio each have their own tree under `/sys/fs/cgroup/`). **cgroups v2** uses a single unified hierarchy and fixes several edge cases in v1's behavior.

Most current Linux distributions (Ubuntu 22.04+, Fedora 31+, Debian 11+) default to cgroups v2. Docker supports both transparently — the flags (`-m`, `--cpus`) behave the same from the user's perspective regardless of which version the host uses.

If you ever need to inspect a container's cgroup directly:

```bash
# cgroups v2
cat /sys/fs/cgroup/system.slice/docker-<container-id>.scope/memory.current
```

This shows the container's current memory usage in bytes, directly from the kernel's accounting. Useful for debugging discrepancies between `docker stats` and what you expect.

<!-- RESOURCES -->

- [Runtime options with Memory, CPUs, and GPUs — Docker Docs](https://docs.docker.com/config/containers/resource_constraints/)
- [Control Groups — kernel.org documentation](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html)
