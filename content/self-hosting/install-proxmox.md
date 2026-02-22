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

Proxmox installs directly onto your hardware like any operating system — you boot from a USB drive, run through the installer, and the machine becomes a hypervisor. After that, you manage everything from a web browser.

Follow the [official Proxmox installation guide](https://pve.proxmox.com/wiki/Installation) for the full walkthrough. What follows here is the practical overview.

<!-- DEEP_DIVE -->

**Step 1: Create a bootable USB**

Download the Proxmox VE ISO from [proxmox.com/downloads](https://www.proxmox.com/en/downloads). Flash it to a USB drive using [Balena Etcher](https://www.balena.io/etcher/) (Windows/Mac) or `dd` on Linux:

```bash
dd if=proxmox-ve_*.iso of=/dev/sdX bs=4M status=progress
```

Replace `/dev/sdX` with your USB device (use `lsblk` to find it).

**Step 2: Install**

Boot from the USB (usually F2, F12, or Del at startup to get the boot menu). The installer is straightforward:

- Select target disk — this erases everything on it
- Set country, timezone, keyboard layout
- Set a root password and email (the email is for alerts; any valid address works)
- **Network config**: set a static IP that's outside your router's DHCP range (e.g., `192.168.1.10`). Proxmox needs a fixed IP.
- Hostname: something like `pve.local` works fine

After install, the machine reboots and you're done.

**Step 3: Access the web UI**

Open a browser and go to `https://YOUR-IP:8006`. You'll get a certificate warning (expected — it's using a self-signed cert). Proceed anyway.

Log in with username `root` and the password you set.

**The "no valid subscription" warning**

Proxmox is free and open-source. When you log in, it shows a popup saying you have no active subscription. Click OK and ignore it. This is their enterprise support upsell — it does not affect any functionality. The community edition you're running is fully featured.

If the popup annoys you, there are scripts to remove it, but it really doesn't matter.

**Step 4: Upload a Debian ISO**

You need a Debian ISO to create a VM. In the web UI:

1. Click your node name in the left panel (e.g., "pve")
2. Go to **local** → **ISO Images** → **Download from URL**
3. Paste the Debian netinstall ISO URL from [debian.org/distrib/netinst](https://www.debian.org/distrib/netinst) (grab the amd64 netinst link)
4. Click **Query URL** then **Download**

**Step 5: Create a VM**

Click **Create VM** in the top right. Reasonable defaults for a self-hosting VM:

| Setting | Value |
|---|---|
| OS | Choose the Debian ISO you uploaded |
| Disk | 32GB is plenty for most services |
| CPU | 2 cores |
| RAM | 2048MB (2GB) — add more if needed later |
| Network | Default (VirtIO, on the bridge) |

Start the VM and open its console (the **Console** button in the sidebar). You'll see the Debian installer boot up.

**Step 6: Install Debian in the VM**

The Debian installer is text-based. Key choices:
- **No graphical desktop** — just a server. When it asks about software, uncheck everything except **SSH server** and **standard system utilities**
- Set a hostname, create a user with a password
- Let it partition the disk automatically

After install, the VM reboots into a running Debian system.

**A note on LXC containers**

Proxmox also supports LXC containers — lighter than VMs because they share the host kernel. Many homelabbers prefer LXC for simple services like Pi-hole or small databases. For now, VMs are simpler to reason about. You can explore LXC later once you're comfortable with the basics.

<!-- RESOURCES -->

- [Proxmox VE Installation Guide](https://pve.proxmox.com/wiki/Installation) -- type: guide, time: 30min
- [Balena Etcher](https://www.balena.io/etcher/) -- type: tool, time: 5min
- [tteck's Proxmox Helper Scripts](https://tteck.github.io/Proxmox/) -- type: tool, time: ongoing
