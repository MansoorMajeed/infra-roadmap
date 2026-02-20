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

TODO: Write content for this node. Cover:
- What virtualization actually is (your machine runs a hypervisor; the hypervisor runs VMs; each VM is an isolated OS)
- The key concern: performance overhead. Address it directly — for self-hosting workloads it's negligible.
- Why Proxmox for homelabs: snapshots, easy rollback, run multiple isolated services, web UI
- When bare metal makes sense: single-purpose machine, keeping it simple, Raspberry Pi

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
