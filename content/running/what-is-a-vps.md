---
id: "what-is-a-vps"
title: "What Is a VPS?"
zone: "running"
edges:
  from:
    - id: "cloud-providers"
      question: "What am I actually renting when I create a cloud server?"
      detail: "You picked a cloud provider and clicked 'Create Droplet' or 'Launch Instance'. But what did you just create? A VPS — a Virtual Private Server — is a virtualized slice of a physical machine. Understanding what you rented helps you reason about its limits, its isolation, and why it behaves differently from your laptop."
    - id: "datacenters"
      question: "Servers live in datacenters. How do I actually get one without going there?"
      detail: "Datacenters are full of physical machines. But you are not renting an entire machine — you are renting a virtualized slice of one. Cloud providers carve up their hardware into hundreds of virtual machines and rent them individually. This is what makes cloud computing affordable."
  to:
    - id: "ssh"
      question: "I have a VPS. How do I connect to it and run commands?"
      detail: "Your VPS is running in a datacenter somewhere. You do not have a monitor or keyboard plugged into it. The only way to interact with it is over the network, using SSH — a protocol that gives you a secure terminal session on a remote machine. Everything you do on the server goes through SSH."
difficulty: 1
tags: ["vps", "virtualization", "cloud", "vm", "hypervisor"]
category: "concept"
milestones:
  - "Explain what a hypervisor does and how a VPS differs from a dedicated server"
  - "Understand what resources a VPS has and why they are shared with other tenants"
  - "Know what a disk image / snapshot is and why it matters"
---

When you click "Create Droplet" on DigitalOcean or "Launch Instance" on AWS, you get a VPS — a Virtual Private Server. It looks and behaves like a real computer: it has a CPU, RAM, disk, and a public IP address. But it is not a physical machine. It is a software-defined slice of a much larger physical server, running alongside dozens of other virtual machines owned by other customers.

Understanding what a VPS actually is helps you reason about performance, limits, cost, and why the server behaves the way it does.

<!-- DEEP_DIVE -->

**Virtualization and hypervisors**

The physical servers in a datacenter are powerful machines — 64 cores, 512 GB of RAM, multiple terabytes of disk. Running a single customer's workload on that hardware would be massively wasteful. Instead, a piece of software called a **hypervisor** runs directly on the hardware and carves it up into isolated virtual machines.

Each VM gets a guaranteed slice: "this VM has 2 CPU cores, 4 GB of RAM, 80 GB of disk." The hypervisor enforces this isolation. Your VM cannot use more RAM than it was allocated, and it cannot see the other VMs' memory or disk.

Common hypervisors: KVM (used by DigitalOcean, Linode), Xen (used by AWS EC2 originally), VMware ESXi (enterprise).

```
Physical Server (64 cores, 512 GB RAM)
┌─────────────────────────────────────────────┐
│  Hypervisor (KVM)                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Your VPS  │ │ Someone   │ │ Someone   │  │
│  │ 2 cores   │ │ else's VM │ │ else's VM │  │
│  │ 4 GB RAM  │ │ 4 cores   │ │ 1 core    │  │
│  │ 80 GB SSD │ │ 8 GB RAM  │ │ 2 GB RAM  │  │
│  └───────────┘ └───────────┘ └───────────┘  │
└─────────────────────────────────────────────┘
```

**What you actually get**

When you provision a VPS, you choose:
- **CPU** — number of virtual cores (vCPUs). These map to threads on the host's physical CPU.
- **RAM** — dedicated memory. If your app leaks memory and uses it all, only your VM is affected.
- **Disk** — a virtual disk, usually backed by SSDs in a SAN (storage area network) or local NVMe drives.
- **Network** — a virtual network interface with a public IPv4 address (and often IPv6). Bandwidth is throttled per plan.
- **OS image** — you pick an operating system (Ubuntu 22.04 LTS is the most common choice). The hypervisor installs it from a pre-built image.

**VPS vs. dedicated server vs. shared hosting**

| | Shared Hosting | VPS | Dedicated Server |
|--|--|--|--|
| Hardware | Shared with hundreds | Shared (virtualized) | Yours alone |
| Root access | No | Yes | Yes |
| Isolation | Weak | Strong (VM boundary) | Complete |
| Cost | $5–15/mo | $5–100/mo | $100–500+/mo |
| Control | Almost none | Full | Full |

A VPS is the sweet spot: you get root access and full control, at a fraction of the cost of dedicated hardware.

**The ephemeral nature of a VPS**

Unlike your laptop, a VPS is designed to be disposable. You can:
- **Destroy it** — delete the VM and all its data permanently
- **Snapshot it** — take a point-in-time image of the entire disk. If you break something, you can restore to a known-good state.
- **Resize it** — many providers let you upgrade to a bigger plan (more RAM, more CPU) with minimal downtime
- **Rebuild it** — wipe the disk and reinstall a fresh OS image

This means you should treat your server's **configuration as code** — not something you type once and hope you remember. If your server is destroyed and you cannot recreate it from scratch in an hour, something is wrong.

**Practical implications**

- **You have root** — you are the administrator. You can install anything, break anything, and no one will stop you.
- **CPU and RAM limits are real** — if your app uses more RAM than you have, the kernel will start killing processes (OOM killer). If you max out CPU, everything slows down.
- **Disk is not infinite** — a typical entry-level VPS has 25–80 GB. Logs, uploaded files, and database growth can fill it.
- **The public IP is yours** — until you destroy the VM. After that, someone else gets it. Don't hardcode your server's IP anywhere important.
- **Nothing is backed up by default** — most providers offer optional backup services. If you do not enable them and your disk fails, your data is gone.

<!-- RESOURCES -->

- [DigitalOcean - What is a VPS?](https://www.digitalocean.com/community/tutorials/what-is-a-vps-virtual-private-server) -- type: article, time: 10m
- [How Virtualization Works (KVM)](https://www.linux-kvm.org/page/FAQ) -- type: reference, time: 15m
