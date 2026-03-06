---
id: cloud-backups
title: 'Offsite Backups: Getting a Copy Off-Site'
zone: self-hosting
difficulty: 1
tags:
  - self-hosting
  - backups
  - offsite
  - cloud
  - restic
  - rclone
  - backblaze
category: concept
milestones:
  - Understand why offsite backups matter (the "1" in 3-2-1)
  - Know the major options (Backblaze B2, rsync.net, Hetzner Storage Box)
  - Encrypt your backups before uploading
  - Set up automated offsite backups with restic or rclone
  - Test restoring from an offsite backup
---

Local backups protect you from disk failures, accidental deletions, and botched upgrades. They don't protect you from a power surge that fries everything on your desk, a flood, a fire, or a break-in. For that, you need a copy somewhere physically separate.

The good news: offsite backup for self-hosters is cheap and straightforward. Most homelab setups have relatively small amounts of critical data — gigabytes, not terabytes — and cloud storage pricing has gotten very reasonable.

<!-- DEEP_DIVE -->

## Where to store offsite backups

**Backblaze B2** — $6/TB/month for storage, $0.01/GB for downloads. The most popular choice for self-hosters. S3-compatible API, so it works with nearly every backup tool. Free egress through their CDN partnership with Cloudflare. For most homelabs, you're looking at well under $1/month.

**Hetzner Storage Box** — Starts at a few euros/month for 1TB. Accessible via SSH/SFTP/rsync/SMB. Based in Europe. Simple pricing, no per-request fees. You can rsync directly to it without any special tooling.

**rsync.net** — SSH-based storage, priced per GB. More expensive than B2 but dead simple — it's just a remote filesystem you rsync to. They also offer special pricing for restic/borg users.

**A friend's house** — Seriously. If you have a friend who also self-hosts, trade backup space. You rsync to a machine at their place, they rsync to yours. Free, offsite, and you both benefit.

## Encrypt before uploading

Never upload unencrypted backups to a third party. Your Vaultwarden data, your personal photos, your configs with passwords in `.env` files — all of that should be encrypted before it leaves your network.

The tools below handle encryption automatically. Don't roll your own.

## restic — the recommended approach

restic is a backup program that handles encryption, deduplication, and incremental backups. It works with local paths, SFTP, and S3-compatible storage (including Backblaze B2).

```bash
# Install
sudo apt install restic

# Initialize a repository on Backblaze B2
export B2_ACCOUNT_ID="your-account-id"
export B2_ACCOUNT_KEY="your-account-key"
restic -r b2:your-bucket-name:backups init

# Run a backup
restic -r b2:your-bucket-name:backups backup ~/docker/ /tmp/postgres.sql

# List snapshots
restic -r b2:your-bucket-name:backups snapshots

# Restore
restic -r b2:your-bucket-name:backups restore latest --target /tmp/restore/
```

restic encrypts everything client-side with a password you set during `init`. Even if someone gets access to your B2 bucket, they can't read the data.

After the first full backup, subsequent runs are fast — restic deduplicates at the block level, so only changed chunks are uploaded.

## rclone — the Swiss Army knife

rclone is a file sync tool that supports dozens of cloud providers. It's not a backup tool per se — it doesn't do deduplication or snapshotting — but it's great for syncing files to cloud storage.

```bash
# Install
sudo apt install rclone

# Configure a remote (interactive)
rclone config

# Sync a directory to B2
rclone sync ~/docker/ b2:your-bucket/docker/ --b2-hard-delete

# With encryption (using rclone crypt)
rclone sync ~/docker/ secret-b2:docker/
```

rclone's `crypt` overlay encrypts filenames and content transparently. You set it up once during `rclone config` and then use the encrypted remote like any other.

Use rclone if you want a simple mirror of your files in the cloud. Use restic if you want versioned snapshots with deduplication.

## Automating offsite backups

Same pattern as local backups — a script and a cron job:

```bash
#!/bin/bash
# /usr/local/bin/offsite-backup.sh

export B2_ACCOUNT_ID="your-account-id"
export B2_ACCOUNT_KEY="your-account-key"
REPO="b2:your-bucket-name:backups"

# Run restic backup
restic -r "$REPO" backup ~/docker/ /tmp/postgres.sql --quiet

# Prune old snapshots: keep 7 daily, 4 weekly, 6 monthly
restic -r "$REPO" forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune --quiet
```

```bash
crontab -e
# Run after local backup completes, e.g., 4am
0 4 * * * /usr/local/bin/offsite-backup.sh
```

## How much does it cost?

For reference, here's what typical self-hosted data costs on Backblaze B2:

| Data size | Monthly cost |
|---|---|
| 10 GB | ~$0.06 |
| 50 GB | ~$0.30 |
| 100 GB | ~$0.60 |
| 500 GB | ~$3.00 |

Most self-hosters (excluding media libraries) have well under 50 GB of critical data. If you're backing up a large media library, you might want to be selective — back up the irreplaceable stuff (photos, documents) and accept that movies and TV shows can be re-downloaded.

<!-- RESOURCES -->

- [restic Documentation](https://restic.readthedocs.io/) -- type: reference, time: ongoing
- [rclone Documentation](https://rclone.org/docs/) -- type: reference, time: ongoing
- [Backblaze B2 Pricing](https://www.backblaze.com/cloud-storage/pricing) -- type: reference, time: 5min
