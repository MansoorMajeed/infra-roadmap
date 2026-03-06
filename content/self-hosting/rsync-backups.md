---
id: rsync-backups
title: Backing Up with rsync
zone: self-hosting
edges:
  to:
    - id: cloud-backups
      question: My local backups are solid — but what about offsite?
      detail: >-
        I'm rsyncing to another machine on my network, which is great. But
        both machines are in the same building. How do I get a copy somewhere
        far away without overcomplicating things?
difficulty: 2
tags:
  - self-hosting
  - backups
  - rsync
  - linux
  - cron
category: practice
milestones:
  - Understand how rsync works (incremental, delta transfer)
  - Back up Docker volumes and config directories to another machine
  - Dump a database before backing it up (don't rsync a live DB)
  - Automate backups with cron
  - Verify you can actually restore from a backup
---

rsync copies files from one place to another, and it's smart about it — it only transfers what's changed since the last run. It works over SSH, so you can back up to any machine you can SSH into. It's been around for decades, it's rock solid, and it's already installed on most Linux systems.

For file-level backups of your self-hosted services, rsync is the simplest tool that does the job well.

<!-- DEEP_DIVE -->

## What to back up

You don't need to rsync your entire server. Focus on what's irreplaceable:

```bash
# Your Docker Compose files and configs
~/docker/

# Or wherever your compose files and volumes live
/opt/services/

# Specific volume paths if you use named volumes
/var/lib/docker/volumes/
```

The key directories are your Compose files, `.env` files, and the bind-mount directories where your services store data.

## Basic rsync usage

Copy a directory to another machine on your network:

```bash
rsync -avz --delete ~/docker/ backup-server:/backups/docker/
```

What the flags do:
- `-a`: archive mode — preserves permissions, timestamps, symlinks
- `-v`: verbose — shows what's being transferred
- `-z`: compress during transfer
- `--delete`: remove files from the destination that no longer exist on the source (keeps your backup a true mirror)

The first run copies everything. Every run after that only transfers changed files.

## The database problem

If you rsync a PostgreSQL or MariaDB data directory while the database is running, the files might be in an inconsistent state. The backup could be corrupted.

The fix: dump the database first, then back up the dump file.

```bash
#!/bin/bash
# Dump databases before rsync
docker exec postgres pg_dumpall -U postgres > ~/backups/postgres.sql
docker exec mariadb mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases > ~/backups/mariadb.sql

# Now rsync everything
rsync -avz --delete ~/docker/ backup-server:/backups/docker/
rsync -avz --delete ~/backups/ backup-server:/backups/dumps/
```

SQLite databases (used by Vaultwarden, many smaller apps) are more forgiving — a single-file copy is usually fine if the app isn't actively writing. But if you want to be safe, use `sqlite3 database.db ".backup backup.db"` first.

## Automating with cron

Create a backup script:

```bash
#!/bin/bash
# /usr/local/bin/backup.sh

set -euo pipefail

BACKUP_HOST="backup-server"
BACKUP_DIR="/backups/$(hostname)"

# Dump databases
docker exec postgres pg_dumpall -U postgres > /tmp/postgres.sql 2>/dev/null || true

# Sync everything
rsync -az --delete ~/docker/ "${BACKUP_HOST}:${BACKUP_DIR}/docker/"
rsync -az --delete /tmp/postgres.sql "${BACKUP_HOST}:${BACKUP_DIR}/postgres.sql"

echo "Backup completed: $(date)" >> /var/log/backup.log
```

Schedule it with cron:

```bash
crontab -e
# Run daily at 3am
0 3 * * * /usr/local/bin/backup.sh
```

Make sure SSH key authentication is set up between your server and the backup target so rsync can connect without a password prompt.

## Backup destination options

**Another machine on your network** — An old PC, a NAS, anything with SSH and disk space. This is the easiest starting point.

**An external USB drive** — Plug it in, mount it, rsync to it. Simple but manual. Good as a secondary backup, not great as your only one (you have to remember to plug it in).

**Your NAS** — If you have a Synology, QNAP, or TrueNAS box, rsync to it over SSH. Most NAS devices support SSH out of the box.

## Verify your backups

At least once, try restoring from your backup. Copy the files back, start the containers, and make sure everything works. A backup script that's been silently failing for months is worse than no backup at all — at least with no backup you know where you stand.

<!-- RESOURCES -->

- [rsync man page](https://linux.die.net/man/1/rsync) -- type: reference, time: 10min
