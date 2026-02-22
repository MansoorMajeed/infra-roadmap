---
id: "bare-machine-now-what"
title: "I Have a Bare Machine — Now What?"
zone: "self-hosting"
edges:
  from:
    - id: "i-need-hardware"
      question: "I have an old PC or laptop sitting around"
    - id: "buying-homelab-hardware"
      question: "I got something — now what do I do with it?"
  to:
    - id: "what-is-virtualization"
      question: "What OS should I install? What's all this Proxmox stuff?"
      detail: "I keep seeing Proxmox mentioned everywhere but I don't know what it is. Is it an OS? Something that runs on top of one? And why does it matter which one I pick?"
difficulty: 1
tags: ["self-hosting", "hardware", "linux", "os"]
category: "concept"
milestones:
  - "Understand the decision you're about to make: virtualized vs bare metal"
---

You have a machine. It probably has Windows on it, or nothing at all. The instinct is to Google "how to install Linux" and get started. That's not wrong — but there's one question worth asking first, because it changes what you install.

**Do you want to run one thing on this machine, or many things?**

If you plug in a USB and install Linux directly, you get a Linux server. Simple, straightforward, and perfectly fine. But if you ever want to run a second service that needs its own isolated environment — or experiment without breaking what's working — you'll wish you had virtualization.

Before you reach for an ISO, read the next section on what virtualization is. It takes five minutes to understand, and it'll shape every decision you make about this machine.

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
