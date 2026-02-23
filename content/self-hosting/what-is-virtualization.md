---
id: what-is-virtualization
title: What Is Virtualization?
zone: self-hosting
edges:
  to:
    - id: install-proxmox
      question: Proxmox sounds good — I'll use that
      detail: >-
        Will it wipe what's currently on the machine? And after it's installed,
        how do I actually get a working Linux system I can SSH into and run
        things on?
    - id: bare-metal-linux
      question: I don't want virtualization — just Linux directly on the hardware
      detail: >-
        I don't need VMs for what I'm doing right now. But am I going to regret
        this later? What am I actually giving up by skipping virtualization?
difficulty: 1
tags:
  - self-hosting
  - virtualization
  - proxmox
  - vms
  - hypervisor
category: concept
milestones:
  - Understand what a hypervisor does
  - Know why Proxmox is recommended over bare metal for homelabs
  - 'Make the call: Proxmox or bare metal'
---

Virtualization means running multiple isolated operating systems on a single physical machine. Instead of installing Linux directly on your hardware, you install a **hypervisor** — software that manages the hardware and runs virtual machines (VMs) on top of it.

Each VM is a fully isolated system: its own kernel, its own processes, its own network interface. From inside the VM, it looks and behaves exactly like a real machine. From the hypervisor's perspective, it's just a process it controls.

<!-- DEEP_DIVE -->

## Why would you want this for a homelab?

You might be thinking: "I'm running everything in Docker anyway, doesn't that already isolate my services?" It does — but that's not why Virtualization (Example: Proxmox) is worth it. The real reasons are about what happens to the machine itself.

### Snapshots and backups

This is the biggest one. Before you do anything risky — try a new configuration, mess with networking — you take a snapshot. If something breaks, you restore. The whole VM state, including the OS and all your Docker volumes, is back exactly as it was. On bare metal, "backup" means figuring out your own rsync scripts. In Proxmox, it's one click.

### Safe experimentation

Want to try something new — a different service, a beta version, a config change you're unsure about? Spin up a new VM. Break it, learn from it, delete it. Your running services on other VMs are completely untouched. On bare metal, experimenting on your production server means you're gambling with your uptime.

### Logical grouping, not one-VM-per-service

You don't run one VM per Docker container — that defeats the purpose. A realistic setup: one VM for your stable, always-on services (Vaultwarden, Immich, Jellyfin), and a separate VM for things you're actively tinkering with. Or one VM you leave alone for months at a time, another you upgrade aggressively. The boundary is between groups of services that have different risk profiles, not individual apps.

### Resource limits and flexibility

You can cap how much CPU and RAM each VM can use. If one service starts misbehaving — a runaway process, a Jellyfin transcode job eating everything — it can't starve the rest of your server.

You can also resize on the fly: give a VM more RAM when a service needs it, shrink it back when you're done. And when you outgrow a single machine, clustering lets you add another node and live-migrate VMs to it — no downtime, no reinstalling anything.

## The performance question

The most common concern: "won't VMs be slower?"

For self-hosting workloads, the overhead is negligible. Modern hypervisors use hardware virtualization (Intel VT-x/AMD-V) which means the CPU runs VM instructions at near-native speed. Memory overhead is a few percent. For Vaultwarden, Nextcloud, Jellyfin — you will not notice.

## Proxmox: the homelab standard

[Proxmox VE](https://www.proxmox.com/en/proxmox-ve) is a free, open-source hypervisor that runs on your hardware. You install it like an OS, then manage everything through a web UI. It's what the majority of homelabbers run, and for good reason:

- **Web UI**: create VMs, manage resources, view console — all from your browser
- **Snapshots**: one click to save state, one click to restore
- **LXC containers**: lightweight Linux containers (like VMs but sharing the host kernel) — less resource-intensive for simple services
- **Clustering**: add more physical machines later and Proxmox ties them into a single cluster — move VMs between nodes, balance load across machines, or add capacity without rebuilding anything
- **Community**: enormous amount of tutorials, scripts (like [tteck's Proxmox scripts](https://tteck.github.io/Proxmox/)), and documentation

## When to skip Proxmox

Bare metal Linux is simpler and perfectly valid if:
- You have a Raspberry Pi (Proxmox has limited Pi support)
- You want to run exactly one thing and don't care about isolation
- You want the simplest possible setup and don't anticipate expanding

For everyone else: the recommendation here is Proxmox.

<!-- RESOURCES -->

- [Proxmox VE Documentation](https://pve.proxmox.com/pve-docs/) -- type: reference, time: ongoing
- [tteck's Proxmox Helper Scripts](https://tteck.github.io/Proxmox/) -- type: tool, time: ongoing
