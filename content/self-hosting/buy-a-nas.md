---
id: buy-a-nas
title: Buying a Pre-Built NAS
zone: self-hosting
difficulty: 1
tags:
  - self-hosting
  - storage
  - nas
  - synology
  - qnap
category: concept
milestones:
  - Know what to look for in a pre-built NAS (bays, CPU, RAM)
  - Understand the Synology vs QNAP landscape
  - Set up a NAS and create a shared folder
  - Mount a network share from your server
---

A pre-built NAS is a small, purpose-built box. You buy the unit, slide in your own hard drives, and follow a setup wizard. Within an hour you have redundant, networked storage with a web UI, mobile apps, and often built-in features like photo management and backup scheduling.

You pay more upfront than building your own, but you get polished software and less tinkering.

<!-- DEEP_DIVE -->

## Synology vs QNAP vs Others

These two dominate the consumer/prosumer NAS market. Both are solid, but the communities lean heavily toward Synology for home use.

**Synology** — Known for DiskStation Manager (DSM), their operating system. It's clean, reliable, and has a large ecosystem of first-party apps (Synology Photos, Hyper Backup, Surveillance Station). The community is huge, which means more guides and troubleshooting help. Downsides: hardware is often underpowered for the price, and they've been pushing their own branded drives.

**QNAP** — Generally better hardware specs per dollar. More flexible for power users — better Docker support, more RAM options, PCIe expansion slots on some models. The software (QTS) is less polished than DSM and has had more security vulnerabilities historically. If you plan to do more than just file sharing, QNAP gives you more room to grow.

**For most people:** If you are unsure, I would say, Synology. The software experience is smoother and you'll spend less time troubleshooting. I personally use Synology and never had a single issue (anecdot, so don't hold me accountable)

## What to look for

**Number of bays** — How many drives it holds. A 2-bay NAS with mirroring gives you the capacity of one drive with redundancy. A 4-bay NAS with RAID 5 gives you three drives of usable space. Start with what you need now; getting a bay or two extra is wise if you think you'll grow.

**CPU** — Matters if you plan to run Docker containers, transcode video (Plex/Jellyfin), or use resource-intensive apps. Intel/AMD CPUs are better for transcoding than ARM-based models. For pure file storage, even an ARM chip is fine.

**RAM** — 2GB works for basic file sharing. If you want to run Docker containers or VMs on the NAS, 4GB minimum, 8GB+ preferred. Some models let you upgrade RAM later, some don't — check before buying.

**Network** — Most NAS devices come with 1GbE. If you're transferring large files regularly (video editing, large media libraries), look for 2.5GbE or 10GbE. For typical homelab use, 1GbE is fine.


## Initial setup

The setup process is similar across brands:

1. Install drives (tool-less trays on most models)
2. Power on and find the NAS on your network (Synology: `find.synology.com`, QNAP: `install.qnap.com`)
3. Follow the web-based wizard — it installs the OS, creates your storage pool, and sets up an admin account
4. Create a shared folder and set permissions
5. Mount the share on your server:

```bash
# NFS mount from Synology/QNAP
sudo apt install nfs-common
sudo mkdir -p /mnt/nas
sudo mount nas-ip:/volume1/shared /mnt/nas

# Add to /etc/fstab for persistence
echo "nas-ip:/volume1/shared /mnt/nas nfs defaults 0 0" | sudo tee -a /etc/fstab
```

## Running Docker on the NAS?

Both Synology and QNAP support Docker containers natively. This can be tempting — run everything on one box. It works for lightweight services, but NAS hardware is usually underpowered compared to a dedicated server. The NAS is best at what it's built for: storing and serving files. Let your server handle the compute.

The exception: if you have a higher-end NAS with a decent CPU and enough RAM, running a few containers (like Plex or a download client) directly on the NAS is perfectly fine and simplifies your setup.

<!-- RESOURCES -->

- [Synology Product Lineup](https://www.synology.com/en-us/products?bays=2,4) -- type: reference, time: 10min
- [QNAP Product Lineup](https://www.qnap.com/en/product?tab=702) -- type: reference, time: 10min
