---
id: proxmox-backup-server
title: Proxmox Backup Server
zone: self-hosting
edges:
  to:
    - id: cloud-backups
      question: This covers local backups — but what about offsite?
      detail: >-
        PBS backs up my VMs to another machine on my network, but that's
        still in my house. If I want a copy somewhere else entirely, how
        do I do that?
difficulty: 2
tags:
  - self-hosting
  - backups
  - proxmox
  - pbs
category: tool
milestones:
  - Understand what Proxmox Backup Server does and how it integrates with Proxmox VE
  - Install PBS (on a separate machine or VM)
  - Configure a backup job for your VMs and containers
  - Test restoring a VM from backup
---

Proxmox Backup Server (PBS) is Proxmox's dedicated backup solution. It integrates directly with Proxmox VE — you add it as a storage target and schedule backup jobs from the same web UI you already use to manage your VMs. Backups are incremental and deduplicated, so after the first full backup, subsequent runs are fast and space-efficient.

If you're running Proxmox, this is the most natural way to back up your entire setup.

<!-- DEEP_DIVE -->

## What PBS actually does

PBS backs up at the VM/container level. When you back up a VM, it captures the entire disk image — the OS, your Docker setup, your volumes, everything. When you restore, you get the whole VM back exactly as it was. No need to figure out which files to back up or worry about database consistency — the snapshot is atomic.

It's also smart about storage. After the initial full backup, PBS uses changed-block tracking to only transfer what's different. Deduplication means identical blocks across multiple VMs are stored only once. A typical homelab with a few VMs might use surprisingly little backup space.

## Where to install PBS

PBS needs to run somewhere separate from what it's backing up. Options:

**A separate physical machine** — Ideal. An old laptop or mini PC with a large disk works perfectly. If your main Proxmox host dies, your backups are on a completely independent machine.

**A VM on the same Proxmox host** — Works, but understand the limitation: if the host's disk fails, you lose both the VMs and the backups. This is still useful for protecting against accidental deletions and botched upgrades, just not hardware failure. Pair it with offsite backups to cover that gap.

**On your NAS** — If you have a NAS that can run PBS (TrueNAS can run it in a VM or jail), this gives you both separation and redundant storage. I personally do this. I run PBS on a VM in my Synology NAS

## Setting it up

Install PBS from the [official ISO](https://www.proxmox.com/en/downloads) the same way you installed Proxmox VE — flash to USB, boot, install. It gets its own web UI on port 8007.

Once PBS is running:

1. **Create a datastore** in the PBS web UI — this is where backups are stored. Point it at a directory with enough space.

2. **Add PBS as storage in Proxmox VE** — In your Proxmox VE web UI, go to Datacenter → Storage → Add → Proxmox Backup Server. Enter the PBS IP, credentials, and datastore name.

3. **Schedule backup jobs** — Datacenter → Backup → Add. Select which VMs/containers to back up, the schedule (daily is typical), and retention policy (how many backups to keep).

That's it. Backups run automatically on schedule.

## Retention and pruning

PBS lets you define retention policies: keep the last 7 daily backups, the last 4 weekly, the last 6 monthly — whatever makes sense for you. Old backups are pruned automatically. A reasonable starting point:

- Keep last 3 daily
- Keep last 2 weekly
- Keep last 1 monthly

You can always adjust once you see how much space you're using.

## Testing restores

A backup you've never tested is a backup you can't trust. After your first backup completes, try restoring a VM to verify it works. In Proxmox VE, go to the backup storage, select a backup, and click Restore. You can restore to a new VM ID so you don't overwrite the running one.

Do this once. It takes five minutes and saves you from finding out your backups are broken when you actually need them.

<!-- RESOURCES -->

- [Proxmox Backup Server Documentation](https://pbs.proxmox.com/docs/) -- type: reference, time: ongoing
- [PBS Installation Guide](https://pbs.proxmox.com/docs/installation.html) -- type: guide, time: 30min
