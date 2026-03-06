---
id: unraid
title: 'Unraid: Storage, VMs, and Docker in One Box'
zone: self-hosting
edges:
  to:
    - id: ssh-into-your-server
      question: Unraid is running — how do I get into it and start setting things up?
      detail: >-
        The web UI is up and I can see my drives. But I want to SSH in and
        start running services. How does that work on Unraid — is it just
        Linux underneath?
difficulty: 2
tags:
  - self-hosting
  - unraid
  - storage
  - virtualization
  - docker
category: tool
milestones:
  - Understand how Unraid's storage model differs from traditional RAID
  - Know when Unraid makes sense vs Proxmox + separate NAS
  - Install Unraid and configure your array
  - Run your first Docker container through the Unraid UI
---

Unraid is an operating system for your server that combines storage management, Docker containers, and virtual machines in a single package. You install it on a USB drive, boot from it, and manage everything through a web UI.

What makes it different from Proxmox or bare-metal Linux is the storage model. Unraid lets you mix and match drives of different sizes — no matching pairs required — and adds parity protection so you can survive drive failures. It's particularly popular with media server builders and people who want one box that does everything.

<!-- DEEP_DIVE -->

## How Unraid storage works

Traditional RAID requires identical (or similar) drives and stripes data across all of them. Unraid takes a different approach:

**The array** — Your data drives don't form a stripe. Each file lives on exactly one drive, written as a normal filesystem (XFS or BTRFS). You can pull any single drive from the array and read its files on another Linux machine. This is fundamentally different from RAID, where no single drive is readable on its own.

**Parity drives** — One or two drives are designated as parity. They store calculated data that lets Unraid reconstruct any single failed drive's contents. One parity drive protects against one drive failure. Two parity drives protect against two simultaneous failures.

**Mix and match** — Your data drives can be different sizes and brands. A 4TB, an 8TB, and a 12TB can all coexist in the same array. The only rule: each parity drive must be as large as the biggest data drive.

**The cache pool** — A fast SSD (or pool of SSDs) that acts as a write buffer. New files land on the cache first, then get moved to the array on a schedule ("mover"). This means writes are fast (SSD speed) even though the array uses slower spinning drives. Docker containers and VMs typically run on the cache pool for performance.

## Unraid vs Proxmox

They solve different problems and have different strengths:

| | Unraid | Proxmox |
|---|---|---|
| **Primary strength** | Storage management | Virtualization |
| **Storage model** | Mix-and-match drives with parity | Uses whatever the OS underneath uses |
| **Docker** | Built-in, GUI-managed | Run inside VMs |
| **VMs** | Supported via KVM/libvirt | First-class, full-featured |
| **Price** | $59–$129 license (one-time) | Free (open source) |
| **Best for** | All-in-one server (storage + services) | Multi-VM environments, clustering |

**Choose Unraid if:** You want one machine that handles storage and runs your Docker services, and you have a bunch of mismatched drives. Unraid excels as the single-box homelab.

**Choose Proxmox if:** You want proper VM isolation, might add more physical nodes later, or already have dedicated storage (NAS). Proxmox excels at managing compute.

## Installing Unraid

1. Download the [Unraid USB Creator](https://unraid.net/download) and flash it to a USB drive (the USB drive becomes the boot device permanently — use a quality one)
2. Boot from the USB — Unraid loads entirely into RAM
3. Access the web UI at `http://tower.local` or the machine's IP
4. Enter your license key (you can start a free trial)
5. Assign drives: select parity drive(s) and data drive(s)
6. Start the array — Unraid formats and initializes the drives

## Running Docker on Unraid

Unraid has a built-in Docker management UI. The Community Applications (CA) plugin is essentially an app store — search for an app (Vaultwarden, Jellyfin, Nextcloud), click install, fill in a few fields, and it pulls and runs the container.

For custom containers, you can add them manually through the UI or use Docker Compose via a plugin. Under the hood it's standard Docker — you can SSH in and use the CLI if you prefer.

## The catch

Unraid is not free. The license costs $59 (Basic, up to 6 drives), $89 (Plus, up to 12), or $129 (Pro, unlimited). It's a one-time purchase with lifetime updates. For what you get — a polished all-in-one OS with excellent community support — most users find it worth the cost.

The other consideration: because Unraid writes each file to a single drive (not striped), read speeds are limited to the speed of that one drive. For media streaming this is fine. For workloads that need high sequential read throughput across large files, traditional RAID or ZFS might be better.

<!-- RESOURCES -->

- [Unraid Documentation](https://docs.unraid.net/) -- type: reference, time: ongoing
- [Unraid Community Forums](https://forums.unraid.net/) -- type: reference, time: ongoing
- [SpaceInvader One YouTube Channel](https://www.youtube.com/@SpaceinvaderOne) -- type: video, time: ongoing
