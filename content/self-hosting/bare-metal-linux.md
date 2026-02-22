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
      detail: "The installer finished and the machine rebooted. I'm looking at a login prompt with no idea what to do next. I don't plan to keep a monitor plugged in — how am I supposed to actually use this thing?"
difficulty: 1
tags: ["self-hosting", "linux", "debian", "bare-metal"]
category: "practice"
milestones:
  - "Download and flash the Debian ISO"
  - "Complete the Debian installer (minimal, no desktop)"
  - "Note the machine's IP address"
  - "SSH in successfully"
---

We're installing **Debian 13 (Trixie)**. Not Ubuntu, not Fedora, not Arch. Debian. It's stable, boring, extremely well-documented, and has rock-solid Docker support. Ubuntu is a fine choice too — it's built on Debian — but we're making an opinionated call here and sticking with it.

Follow the [official Debian installation guide](https://www.debian.org/releases/trixie/amd64/) for complete documentation. This is the practical walkthrough.

<!-- DEEP_DIVE -->

**Step 1: Download and flash the ISO**

Get the **netinstall** ISO from [debian.org/distrib/netinst](https://www.debian.org/distrib/netinst). This is a small image that downloads packages over the network during install — it always gives you the latest package versions.

Flash it to a USB drive with [Balena Etcher](https://www.balena.io/etcher/) or `dd`:

```bash
dd if=debian-*-amd64-netinst.iso of=/dev/sdX bs=4M status=progress
```

**Step 2: Boot and install**

Plug the USB into your machine and boot from it (F2, F12, or Del to get the boot menu). Use the **graphical installer** — it's easier to navigate.

Key choices during install:

- **Hostname**: something simple like `homelab` or `server`
- **User account**: create a non-root user (e.g., your name). You'll use this to log in and `sudo` for admin commands.
- **Disk partitioning**: "Guided - use entire disk" with a single partition is fine for a server
- **Software selection**: this is important — **uncheck everything** except:
  - ☑ SSH server
  - ☑ standard system utilities
  - Everything else (desktop environments, web server, etc.) — leave unchecked

A server with no GUI uses less RAM and has fewer moving parts. You'll access it via SSH.

**Step 3: First boot and setup**

After install, the machine reboots into a bare Debian system. Log in with the user you created.

Run the first update:

```bash
sudo apt update && sudo apt upgrade -y
```

Note the machine's IP address:

```bash
ip a
```

Look for something like `192.168.1.x` on your main network interface. Write it down.

**Static IP vs DHCP reservation**

Your router assigns IPs via DHCP. By default, your server might get a different IP after each reboot. That's annoying — you need to know where to SSH.

The recommended approach is a **DHCP reservation** (sometimes called "static DHCP" or "address reservation") in your router settings. You tell the router "always give this MAC address this IP". The machine still uses DHCP, but always gets the same address. It's cleaner than configuring a static IP inside Linux.

Find this in your router's web interface under something like DHCP settings → Static leases / Address reservations. You'll need the machine's MAC address:

```bash
ip link show
```

Look for the `link/ether` line — that's the MAC address.

<!-- RESOURCES -->

- [Debian 13 Installation Guide](https://www.debian.org/releases/trixie/amd64/) -- type: guide, time: 30min
- [Balena Etcher](https://www.balena.io/etcher/) -- type: tool, time: 5min
