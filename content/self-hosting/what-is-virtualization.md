---
id: "what-is-virtualization"
title: "What Is Virtualization?"
zone: "self-hosting"
edges:
  from:
    - id: "bare-machine-now-what"
      question: "What OS should I install? What's all this Proxmox stuff?"
  to:
    - id: "install-proxmox"
      question: "Proxmox sounds good — I'll use that"
      detail: "Proxmox is a bare-metal hypervisor: you install it directly on your machine, and then create VMs and containers on top of it. It has a web UI, snapshot support, and is what most homelabbers run."
    - id: "bare-metal-linux"
      question: "I don't want virtualization — just Linux directly on the hardware"
      detail: "Totally valid. Install Debian, skip the complexity of VMs. You'll lose some flexibility but gain simplicity."
difficulty: 1
tags: ["self-hosting", "virtualization", "proxmox", "vms", "hypervisor"]
category: "concept"
milestones:
  - "Understand what a hypervisor does"
  - "Know why Proxmox is recommended over bare metal for homelabs"
  - "Make the call: Proxmox or bare metal"
---

Virtualization means running multiple isolated operating systems on a single physical machine. Instead of installing Linux directly on your hardware, you install a **hypervisor** — software that manages the hardware and runs virtual machines (VMs) on top of it.

Each VM is a fully isolated system: its own kernel, its own processes, its own network interface. From inside the VM, it looks and behaves exactly like a real machine. From the hypervisor's perspective, it's just a process it controls.

<!-- DEEP_DIVE -->

**Why would you want this for a homelab?**

Imagine you want to run Vaultwarden, Immich, and Home Assistant. Without virtualization, they all share the same operating system. A bad update to one can break others. Experimenting with configuration can leave your server in an unpredictable state.

With virtualization, each service (or group of services) lives in its own VM:
- One VM for your password manager
- One VM for your photo library
- One VM for everything else

If you break the Immich VM, your Vaultwarden keeps running. You can snapshot a VM before making changes, and roll back if something goes wrong. You can delete a VM and start fresh without touching anything else.

**The performance question**

The most common concern: "won't VMs be slower?"

For self-hosting workloads, the overhead is negligible. Modern hypervisors use hardware virtualization (Intel VT-x/AMD-V) which means the CPU runs VM instructions at near-native speed. Memory overhead is a few percent. For Vaultwarden, Nextcloud, Jellyfin — you will not notice.

The only workload where it could matter is hardware transcoding in Jellyfin — passing your GPU/iGPU through to a VM requires extra configuration (PCIe passthrough). It's doable, but it's more advanced than this guide covers.

**Proxmox: the homelab standard**

[Proxmox VE](https://www.proxmox.com/en/proxmox-ve) is a free, open-source hypervisor that runs on your hardware. You install it like an OS, then manage everything through a web UI. It's what the majority of homelabbers run, and for good reason:

- **Web UI**: create VMs, manage resources, view console — all from your browser
- **Snapshots**: one click to save state, one click to restore
- **LXC containers**: lightweight Linux containers (like VMs but sharing the host kernel) — less resource-intensive for simple services
- **Community**: enormous amount of tutorials, scripts (like [tteck's Proxmox scripts](https://tteck.github.io/Proxmox/)), and documentation

**When to skip Proxmox**

Bare metal Linux is simpler and perfectly valid if:
- You have a Raspberry Pi (Proxmox has limited Pi support)
- You want to run exactly one thing and don't care about isolation
- You want the simplest possible setup and don't anticipate expanding

For everyone else: the recommendation here is Proxmox.

<!-- RESOURCES -->

- [Proxmox VE Documentation](https://pve.proxmox.com/pve-docs/) -- type: reference, time: ongoing
- [tteck's Proxmox Helper Scripts](https://tteck.github.io/Proxmox/) -- type: tool, time: ongoing
