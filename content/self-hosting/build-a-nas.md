---
id: build-a-nas
title: Building a NAS from Scratch
zone: self-hosting
difficulty: 2
tags:
  - self-hosting
  - storage
  - nas
  - truenas
  - zfs
category: practice
milestones:
  - Understand RAID levels and why RAID is not a backup
  - Know the difference between TrueNAS and OpenMediaVault
  - Set up a basic NAS with redundant storage
  - Mount a network share from your server
---

Building your own NAS means taking a machine — an old PC, a mini server, or purpose-built hardware — adding drives to it, and installing NAS software that manages the storage, shares it over the network, and handles redundancy.

It's more hands-on than buying a Synology, but it's cheaper, more flexible, and you end up understanding exactly how your storage works.

<!-- DEEP_DIVE -->

## What hardware do you need?

**The machine** — Any PC with enough SATA ports for your drives works. An old desktop is fine. If you're buying specifically for this, a used mini server or a case with many drive bays is ideal. You don't need a powerful CPU — NAS workloads are mostly I/O, not compute.

**RAM** — 8GB minimum. If you're using ZFS (which you should consider), more RAM helps — ZFS uses RAM for caching (ARC). 16GB is comfortable for a homelab NAS.

**The ECC debate** — ECC (Error-Correcting Code) RAM catches and fixes memory bit flips. ZFS purists will tell you it's mandatory. In practice, non-ECC RAM works fine for a homelab. ECC is nice to have, not a dealbreaker.

**Drives** — NAS-rated drives (WD Red Plus, Seagate IronWolf) are designed for 24/7 operation and vibration tolerance in multi-drive setups. They cost a bit more than desktop drives but last longer in NAS use. For a homelab, regular drives work too — just keep backups.

**HBA cards** — If your motherboard doesn't have enough SATA ports, a Host Bus Adapter adds more. Look for cards based on the LSI SAS2008 chipset (commonly Dell H200, H310 flashed to IT mode). They're cheap on eBay and well-supported.

## TrueNAS vs OpenMediaVault

**TrueNAS (SCALE)** — Based on Debian Linux with ZFS as the filesystem. ZFS gives you data integrity verification, snapshots, compression, and flexible RAID (RAIDZ). TrueNAS has a polished web UI for managing pools, shares, snapshots, and even Docker containers and VMs. The downside: ZFS wants more RAM and has a learning curve.

**OpenMediaVault (OMV)** — Debian-based, lighter weight, works with traditional Linux filesystems (ext4, XFS) and mdadm software RAID. Simpler to set up, lower resource requirements, plugin-based. A good choice if you want a straightforward NAS without the ZFS complexity.

**The recommendation:** If you have 16GB+ RAM and want the best data protection, TrueNAS with ZFS. If you have limited hardware or just want simple network shares, OpenMediaVault.

## Setting up TrueNAS SCALE

1. Download the [TrueNAS SCALE ISO](https://www.truenas.com/download-truenas-scale/) and flash it to USB
2. Install it — it takes over the boot drive (use a small SSD, not one of your data drives)
3. Access the web UI at the machine's IP address
4. Create a **storage pool** — select your data drives and choose a RAID level:
   - 2 drives → Mirror (RAIDZ is not an option with only 2 drives)
   - 3 drives → RAIDZ1 (one drive can fail)
   - 4+ drives → RAIDZ2 (two drives can fail) recommended

5. Create a **dataset** — a logical partition within the pool
6. Create an **NFS or SMB share** pointing to the dataset

## Mounting the share on your server

On your Docker server, mount the NAS share so containers can use it:

```bash
# Install NFS client
sudo apt install nfs-common

# Create a mount point
sudo mkdir -p /mnt/nas

# Mount the NFS share
sudo mount nas-ip:/mnt/pool/dataset /mnt/nas

# Make it permanent (add to /etc/fstab)
echo "nas-ip:/mnt/pool/dataset /mnt/nas nfs defaults 0 0" | sudo tee -a /etc/fstab
```

Now point your Docker volumes at `/mnt/nas/` subdirectories:

```yaml
services:
  jellyfin:
    volumes:
      - /mnt/nas/media:/media:ro
```

## ZFS snapshots

One of ZFS's best features: you can take instant, space-efficient snapshots of your data. Before a risky operation, snapshot. If something goes wrong, roll back in seconds. TrueNAS can schedule automatic snapshots — daily or hourly — as cheap insurance.

Snapshots are not backups (they're on the same disks), but they protect against accidental deletion and bad updates.

<!-- RESOURCES -->

- [TrueNAS SCALE Documentation](https://www.truenas.com/docs/scale/) -- type: reference, time: ongoing
- [OpenMediaVault Documentation](https://docs.openmediavault.org/) -- type: reference, time: ongoing
