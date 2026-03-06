---
id: backup-strategy
title: You Need Backups — Here's How to Think About It
zone: self-hosting
edges:
  to:
    - id: proxmox-backup-server
      question: I'm running Proxmox — can I back up my entire VMs?
      detail: >-
        I have everything in VMs and containers on Proxmox. If I could just
        snapshot the whole thing and restore it if something goes wrong, that
        would be way easier than backing up individual files inside each VM.
    - id: rsync-backups
      question: I just want to copy my important files to another machine
      detail: >-
        I know which folders matter — my Docker volumes, my configs, my
        databases. I just need a reliable way to copy them somewhere else
        on a schedule. What's the simplest way to do that?
    - id: cloud-backups
      question: What if something happens to my house? I need a copy somewhere else
      detail: >-
        A backup on another drive in the same room doesn't help if there's a
        fire or a break-in. How do I get a copy of my data somewhere offsite
        without it costing a fortune?
difficulty: 1
tags:
  - self-hosting
  - backups
  - data-protection
  - 3-2-1
category: concept
milestones:
  - Understand the 3-2-1 backup rule
  - Know what to back up (configs, volumes, databases — not the containers themselves)
  - Think about how much data loss you can tolerate
  - Pick a backup approach that fits your setup
---

You've been building your self-hosted setup — Vaultwarden, maybe Immich, maybe Jellyfin. Your passwords are in there. Your photos are in there. And right now, all of it lives on one disk in one machine. If that disk dies tonight, it's all gone.

Backups are the thing everyone knows they should do and nobody does until they lose something. Let's fix that before it happens.

<!-- DEEP_DIVE -->

## The 3-2-1 rule

The simplest backup strategy that actually works:

- **3** copies of your data (the original + 2 backups)
- **2** different types of storage (e.g., your server's SSD + an external drive or NAS)
- **1** copy offsite (somewhere physically different — a cloud provider, a friend's house, a VPS)

You don't need all three on day one. A single backup to another machine in your house is already infinitely better than nothing. But the goal is to get to 3-2-1 over time.

## What to back up

Not everything on your server is equally important, and you don't need to back up the entire filesystem.

**Always back up:**
- Docker volumes (your actual data — Vaultwarden's `/data`, Immich's library, database files)
- Docker Compose files and `.env` files (your service configuration)
- Any config files you've customized (`traefik.yml`, `prometheus.yml`, etc.)

**Don't bother backing up:**
- Docker images — they're pulled from registries, not unique to you
- The OS itself — reinstalling Debian takes 10 minutes
- Log files — nice to have but rarely critical

**Special case — databases:**
Don't just copy a running database's files. A SQLite file might be fine, but PostgreSQL or MariaDB files copied mid-write can be corrupted. Dump the database first (`pg_dump`, `mysqldump`), then back up the dump.

## How much can you afford to lose?

Think about this honestly. If your backup runs once a day at midnight, and your server dies at 11pm, you lose almost 24 hours of data. For a password manager, that might be one or two new entries. For a photo library, it could be a day's worth of photos.

For most self-hosters, daily backups are fine. If you're running something where losing even an hour matters, you need more frequent backups — but that's rare for home use.

## The approaches

There are three main paths, and they're not mutually exclusive — most solid setups combine two or three:

**Proxmox Backup Server** — If you're running Proxmox, PBS backs up entire VMs and containers at the hypervisor level. Incremental, deduplicated, and restores the whole machine state. The easiest "back up everything" approach if you're in the Proxmox ecosystem.

**rsync** — The universal file-level backup tool. Copy specific directories to another machine on your network, a NAS, or an external drive. Simple, scriptable, works everywhere. This is the right tool when you know exactly what files matter.

**Cloud/offsite backups** — Get a copy out of your house entirely. Backblaze B2, rsync.net, Hetzner Storage Box — all cheap for the amount of data most self-hosters have. Tools like restic and rclone make this straightforward and encrypted.

Pick the one that matches where you are right now. You can always add the others later.

<!-- RESOURCES -->
