---
id: "ssh-into-your-server"
title: "SSH Into Your Server"
zone: "self-hosting"
edges:
  from:
    - id: "install-proxmox"
      question: "Proxmox is running and I have a Debian VM — now what?"
    - id: "bare-metal-linux"
      question: "Debian is installed — now what?"
  to:
    - id: "docker-or-native"
      question: "I'm in. How do I actually install software on this thing?"
      detail: "You have a shell on a fresh Linux machine. The next question is how to run services — and there are two paths."
difficulty: 1
tags: ["self-hosting", "ssh", "linux", "terminal"]
category: "practice"
milestones:
  - "SSH into your server from your laptop"
  - "Know your server's IP address"
  - "Create a non-root user and add it to sudoers"
  - "Set up SSH key authentication"
---

TODO: Write content for this node. Cover:
- What SSH is (one sentence) and why we use it (headless server, no monitor needed)
- `ssh user@ip-address` — the basic command
- Finding your server's IP (router admin page, or `ip a` on the server)
- SSH keys: `ssh-keygen`, `ssh-copy-id` — why passwords are worse
- Creating a non-root user with sudo (don't run everything as root)
- Optional: disable password auth in sshd_config once keys are set up

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
