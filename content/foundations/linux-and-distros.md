---
id: linux-and-distros
title: Linux & Distributions
zone: foundations
edges:
  to:
    - id: the-terminal
      question: I understand Linux. How do I actually use it?
      detail: >-
        I've been reading about Linux and I get the theory. But reading about it
        isn't the same as actually using it. Where do I even start — there's no
        GUI, no icons, just a blinking cursor and no idea what to type.
    - id: users-and-permissions
      question: Linux is multi-user. Who controls what?
      detail: >-
        I've already hit "permission denied" and just slapped sudo in front of
        things to make them go away. But I don't really know what's happening —
        why am I being blocked? Is it about who I am, or what the file is? And
        if I'm the only one on this server, why does any of it matter?
difficulty: 1
tags:
  - linux
  - distributions
  - ubuntu
  - debian
  - rhel
  - server-os
  - desktop-os
category: concept
milestones:
  - Explain the difference between the Linux kernel and a distribution
  - Name three server-focused distributions and when you would use each
  - Explain why servers do not run desktop operating systems
---

You know that an operating system sits between your programs and the hardware. But which operating system? If you are going into SRE or DevOps, the answer is Linux. Not sometimes, not mostly — almost always. The overwhelming majority of servers, containers, and cloud instances on the internet run Linux. Understanding what Linux actually is, why it won, and how its ecosystem of distributions works is essential context for everything that follows.

<!-- DEEP_DIVE -->

First, let us clear up a common confusion: **Linux is a kernel, not an operating system**. The kernel is the core piece — it manages CPU scheduling, memory, devices, and system calls. What people casually call "Linux" is actually a **distribution** (or "distro") — a complete operating system built around the Linux kernel, bundled with a package manager, system utilities, default configurations, and sometimes a desktop environment. Ubuntu, Debian, Red Hat Enterprise Linux (RHEL), CentOS, Fedora, Arch, Alpine — these are all distributions. They all use the same Linux kernel but differ in how they package software, how often they update, and what they prioritize.

**Why Linux dominates servers.** Three reasons. First, it is free and open source — you can run it on a thousand servers without paying a licensing fee. Second, it is incredibly stable and efficient. A Linux server can run for years without a reboot. It does not need a graphical interface, so it uses minimal resources — all the CPU and RAM go to actually running your applications. Third, the entire cloud ecosystem is built around it. AWS, GCP, and Azure all default to Linux. Docker containers are Linux containers — they use Linux kernel features (namespaces and cgroups) to work. Kubernetes runs on Linux. The tools you will use daily (Nginx, PostgreSQL, Redis, Prometheus) are all Linux-first.

**Server OS vs Desktop OS.** A desktop operating system (Windows, macOS, Ubuntu Desktop) is built for a human sitting in front of a screen — it has a GUI, a window manager, audio, Bluetooth, and a bunch of software you will never need on a server. A server OS strips all of that away. No GUI, no desktop environment, no wasted resources. You interact with it entirely through a text-based terminal over SSH. Server distributions like Ubuntu Server, Debian, RHEL, and Amazon Linux are optimized for this — small footprint, long-term stability, security updates without reboots when possible.

**The major distributions you will encounter as an SRE:**

- **Ubuntu Server** — the most popular choice for getting started and for many production environments. Based on Debian, huge community, excellent documentation. LTS (Long Term Support) releases get five years of updates.
- **Debian** — the upstream of Ubuntu. Known for rock-solid stability. Slower release cycle, which is a feature when you want predictability in production.
- **RHEL / CentOS Stream / Rocky Linux / AlmaLinux** — the Red Hat ecosystem. RHEL is the enterprise standard with paid support. CentOS used to be the free clone; after Red Hat changed its model, Rocky Linux and AlmaLinux filled that gap. You will encounter these in enterprise environments constantly.
- **Amazon Linux** — AWS's own distribution, optimized for running on EC2. If you are in an AWS shop, you will likely see this.
- **Alpine Linux** — tiny (5 MB base image), used heavily in Docker containers where image size matters. Uses `musl` instead of `glibc` and `apk` instead of `apt` — you will run into compatibility quirks.

You do not need to master all of these. Pick one (Ubuntu Server is the best starting point) and get comfortable. The core concepts — the filesystem layout, process management, networking, package management — are the same across all of them. The differences are mostly in package managers (`apt` vs `yum`/`dnf` vs `apk`) and default configurations.

**A note on Windows and macOS servers.** They exist, but they are niche. Windows Server is used in enterprises with heavy Microsoft dependencies (Active Directory, .NET, SQL Server). macOS Server is effectively dead. As an SRE, you might occasionally deal with a Windows server, but your bread and butter will be Linux. If you are on a Mac, the good news is that macOS is Unix-based and shares many concepts with Linux — most terminal commands work the same way.

<!-- RESOURCES -->

- [Linux Journey - Getting Started](https://linuxjourney.com/) -- type: tutorial, time: 2h
- [DistroWatch - Compare Linux Distributions](https://distrowatch.com/) -- type: reference, time: 30m
- [The Linux Foundation - Introduction to Linux (free course)](https://training.linuxfoundation.org/training/introduction-to-linux/) -- type: course, time: 10h
- [Ubuntu Server Guide](https://ubuntu.com/server/docs) -- type: reference, time: varies
- [Red Hat vs Debian: A Comparison](https://www.redhat.com/en/topics/linux/whats-the-best-linux-distro-for-you) -- type: article, time: 15m
