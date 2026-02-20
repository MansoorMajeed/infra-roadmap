---
id: "own-hardware"
title: "Running on Your Own Hardware"
zone: "running"
edges:
  from:
    - id: "where-do-i-run-this"
      question: "What if I don't want to rent a server — I want to use my own machine?"
      detail: "Cloud and datacenters are the default answer for most people. But what if you have a Raspberry Pi, an old laptop, or a spare PC sitting around? You can run a Linux server on hardware you own. The trade-offs are real, but so are the advantages — and the skills are the same either way."
  to:
    - id: "ssh"
      question: "I have a Linux machine running at home. How do I connect to it?"
      detail: "Whether your server is in a datacenter or under your desk, the interface is the same: SSH. You get a terminal that runs on the remote machine, and every command you type executes there. The only difference is where the hardware lives."
    - id: "what-is-self-hosting"
      question: "I have my own hardware. What can I actually run on it?"
      detail: "A Linux box at home is the foundation for self-hosting — running your own file sync, media server, home automation hub, and more. You own the hardware, you own the data, and there are no monthly fees. The rabbit hole goes deep."
difficulty: 1
tags: ["self-hosting", "home-server", "raspberry-pi", "bare-metal", "homelab", "linux"]
category: "concept"
milestones:
  - "Choose hardware suitable for a home server (Pi, mini PC, old laptop or desktop)"
  - "Install Linux on bare metal (not just picking a cloud image)"
  - "Assign a static local IP to your machine from your router"
  - "SSH into your home server from another machine on the same network"
---

You don't have to rent a server. You can take an old PC, a Raspberry Pi, a used mini PC you found for $80 on eBay, and turn it into a Linux server that runs 24/7 in your home. This is the other answer to "where do I run this?" — and it's a completely valid one.

The skills are the same as a VPS. The hardware is yours.

<!-- DEEP_DIVE -->

**What hardware should you use?**

Almost anything running Linux works. Here are the most common choices:

| Hardware | Cost | Power | Use case |
|---|---|---|---|
| **Raspberry Pi 4/5** | $60–90 | ~5W | Light workloads, learning, IoT |
| **Mini PC** (Beelink, Intel NUC, used ThinkCentre) | $80–250 | 10–35W | The sweet spot for most home servers |
| **Old laptop** | Free (you may already have one) | 15–45W | Gets you started immediately |
| **Old desktop** | Free–$100 | 65–150W | Lots of storage, noisier, more power |
| **Used rackmount server** | $100–500 | 150–400W | Serious homelab, loud, hot |

For most people starting out: **a used mini PC is the best choice**. They're quiet, energy-efficient, have enough CPU and RAM for most home services, and cost less than two months of a VPS.

**Installing Linux on bare metal**

With a VPS, you pick an OS from a dropdown and the hypervisor handles the rest. With your own hardware, you do it yourself:

1. Download an Ubuntu Server ISO from ubuntu.com
2. Flash it to a USB drive with a tool like Balena Etcher or `dd`
3. Boot your machine from the USB (change boot order in BIOS/UEFI)
4. Walk through the installer — set a username, configure disk, enable SSH server
5. Pull out the USB, reboot, and you have a headless Linux machine

```bash
# Flash the ISO to a USB drive (on macOS/Linux)
# Replace /dev/sdX with your USB device — double check with lsblk
sudo dd if=ubuntu-24.04-server.iso of=/dev/sdX bs=4M status=progress
```

After install, you never need a monitor plugged in again. SSH is your interface.

**Setting a static local IP**

By default, your router assigns IP addresses dynamically via DHCP. Every time your server reboots, it might get a different IP, which means your SSH commands break. Fix this by reserving a static IP.

The easiest way is a **DHCP reservation** in your router settings (sometimes called "static IP" or "address binding"). Find your server's MAC address, and tell the router to always give it the same IP:

```bash
# Find your server's MAC address
ip link show
# Look for your ethernet interface (eth0, enp3s0, etc.)
# The MAC address looks like: aa:bb:cc:dd:ee:ff
```

Go into your router admin panel (usually `192.168.1.1` or `192.168.0.1`), find DHCP settings, and add a reservation. Now your server always gets, say, `192.168.1.100`.

**How your home server differs from a VPS**

This is the important part. Your home server has some real constraints compared to a cloud VM:

| | VPS | Home Server |
|---|---|---|
| **Public IP** | Static, assigned to you | Dynamic — changes when your ISP feels like it |
| **Network** | Direct, no NAT | Behind your home router (NAT) |
| **Uptime** | Datacenter-grade power + cooling | Your home electricity + internet |
| **Access from outside** | Direct via public IP | Requires extra setup (port forwarding or VPN) |
| **Cost** | Monthly fee forever | Hardware cost once, electricity ongoing |
| **Data** | Provider's disks | Your disks, your responsibility |

The **NAT problem** is the big one: your home router has a single public IP, and your server sits behind it with a private IP (`192.168.x.x`). The internet can't reach your server directly. If you want services accessible from outside your home, you need to deal with this — either through port forwarding, a VPN tunnel (Tailscale is the easiest modern solution), or a reverse proxy in the cloud.

The **dynamic IP problem** compounds this: your ISP can change your home's public IP at any time (usually every few days or on router restart). Services like DuckDNS or Cloudflare's free DNS can automatically update a domain name to point at your current IP (Dynamic DNS / DDNS).

These sound like blockers. They're not — they're just things you learn to handle. The self-hosting community has solved all of them, and the solutions are well-documented.

**Why do this at all?**

- **You own the data.** Your files on your server are on your hardware. No company can read them, sell them, or delete your account.
- **No subscriptions.** Run Nextcloud instead of Google Drive, Jellyfin instead of Netflix, Immich instead of Google Photos — for the cost of electricity.
- **Real learning.** You will break things, fix them, understand why. No managed service insulates you from the interesting parts.
- **It's fun.** The homelab community is massive and enthusiastic. There's always another service to run, another thing to optimize.

The path from here is the same as any other Linux server: SSH in, learn the basics, start running services. The difference is what those services are — and who they're for.

<!-- RESOURCES -->

- [LinuxServer.io](https://www.linuxserver.io/) -- type: reference, time: ongoing
- [r/selfhosted](https://www.reddit.com/r/selfhosted/) -- type: community, time: ongoing
- [Perfect Media Server](https://perfectmediaserver.com/) -- type: guide, time: 60m
- [Raspberry Pi Official Docs](https://www.raspberrypi.com/documentation/) -- type: reference, time: varies
