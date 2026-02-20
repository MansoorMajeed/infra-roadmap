---
id: "install-proxmox"
title: "Installing Proxmox and Creating Your First VM"
zone: "self-hosting"
edges:
  from:
    - id: "what-is-virtualization"
      question: "Proxmox sounds good — I'll use that"
  to:
    - id: "ssh-into-your-server"
      question: "Proxmox is running and I have a Debian VM — now what?"
      detail: "Your VM is a fresh Debian install. Time to log in and start using it."
difficulty: 2
tags: ["self-hosting", "proxmox", "virtualization", "homelab", "vm"]
category: "practice"
milestones:
  - "Download and flash the Proxmox ISO"
  - "Complete the Proxmox installer"
  - "Access the Proxmox web UI"
  - "Create a Debian VM and boot it"
  - "SSH into the VM successfully"
---

TODO: Write content for this node. Cover:
- Download Proxmox VE ISO, flash to USB (Balena Etcher or dd)
- Walk through the installer (IP, gateway, DNS, hostname)
- Accessing the web UI (https://your-ip:8006)
- Dismiss the "no valid subscription" warning
- Upload Debian ISO to Proxmox, create a VM with reasonable defaults
- Install Debian in the VM (minimal, no desktop)
- Note about LXC containers as an alternative to full VMs (link to future node)

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
