---
id: storage-planning
title: Where Does All This Data Go?
zone: self-hosting
edges:
  to:
    - id: build-a-nas
      question: I want to build my own storage server from spare parts
      detail: >-
        I have an old PC sitting around and some drives. Can I turn that into
        a proper storage box? What software do I put on it, and how do I make
        sure I don't lose data if a drive dies?
    - id: buy-a-nas
      question: I'd rather just buy something that works out of the box
      detail: >-
        I don't want another project — I want to plug something in, put drives
        in it, and have it work. What should I be looking at and how much is
        this going to cost me?
difficulty: 1
tags:
  - self-hosting
  - storage
  - nas
  - data
category: concept
milestones:
  - Understand why separating storage from compute matters
  - Know the difference between DAS, NAS, and just using local disks
  - Decide whether to build, buy, or keep it simple
---

Right now your data lives on the same disk your server boots from. Docker volumes, photos, media files, databases — all sharing space with the OS. This works fine when you're starting out, but it has problems that show up over time.

The disk fills up. You can't easily move data to a bigger drive. If the disk fails, you lose everything — the OS and your data. And if you want a second server, there's no shared storage between them.

Separating storage from compute solves all of these. Your server runs services, your storage holds data, and they talk over the network.

<!-- DEEP_DIVE -->

## Do you actually need a NAS?

Not everyone does. If you have a single server with a few small services (Vaultwarden, Pi-hole, a small Nextcloud), the boot disk is fine. Add a second internal drive if you need more space and mount it for your Docker volumes. That's perfectly valid and much simpler than a NAS.

A dedicated storage device starts making sense when:

- You have more data than fits on one or two drives
- You want redundancy (a drive can fail without losing data)
- Multiple machines need access to the same files
- You're running a media server with a large library

## How NAS storage works

A NAS (Network Attached Storage) is a dedicated machine — purpose-built or repurposed — that serves files over the network. Your server mounts a network share (NFS or SMB) and reads/writes to it as if it were a local directory.

From your Docker containers' perspective, nothing changes. You point a volume at the mounted share instead of a local directory. The data lives on the NAS, which has its own redundancy and can be backed up independently.

## RAID: redundancy, not backup

Most NAS setups use some form of RAID — multiple disks working together so that one (or more) can fail without data loss. Common options:

- **Mirror (RAID 1)** — two disks, identical copies. One fails, the other has everything. You lose half your total capacity.
- **RAID 5 / RAIDZ1** — three or more disks, one can fail. Better capacity efficiency than mirroring.
- **RAID 6 / RAIDZ2** — four or more disks, two can fail. More protection, more overhead.

**RAID is not a backup.** It protects against a single disk failing. It does not protect against accidental deletion, ransomware, fire, or the RAID controller itself failing. You still need backups.

## The two paths

**Build a NAS** — Take an old PC, add drives, install TrueNAS or OpenMediaVault. More work, more control, cheaper if you already have spare hardware. You learn a lot in the process.

**Buy a NAS** — Synology, QNAP, or similar. Pop in drives, follow the setup wizard, done. Costs more upfront but saves time and comes with polished software for file sharing, photo management, and more.

Neither is objectively better. It depends on whether you want another project or just want storage that works.

<!-- RESOURCES -->
