---
id: "bare-metal-linux"
title: "Installing Linux Directly (Bare Metal)"
zone: "self-hosting"
edges:
  from:
    - id: "what-is-virtualization"
      question: "I don't want virtualization — just Linux directly on the hardware"
  to:
    - id: "ssh-into-your-server"
      question: "Debian is installed — now what?"
      detail: "You have a running Debian machine. Time to SSH in and start using it."
difficulty: 1
tags: ["self-hosting", "linux", "debian", "bare-metal"]
category: "practice"
milestones:
  - "Download and flash the Debian ISO"
  - "Complete the Debian installer (minimal, no desktop)"
  - "Note the machine's IP address"
  - "SSH in successfully"
---

TODO: Write content for this node. Cover:
- Why Debian 13 (stable, boring, well-documented, docker support is great)
- Ubuntu is great too, but we will stick with debian
- Download Debian netinstall ISO, flash to USB
- Key installer choices: no desktop environment, only SSH server + standard utilities
- also link to the official doc https://www.debian.org/releases/trixie/riscv64/
- we can also give a short install instructions, no need to go crazy.
- Static IP vs DHCP reservation (recommend DHCP reservation via your router)
- After install: `apt update && apt upgrade`, note the IP

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
