---
id: log-files
title: Log Files & Logging
zone: foundations
edges:
  to: []
difficulty: 1
tags:
  - logs
  - syslog
  - journalctl
  - var-log
  - log-rotation
  - debugging
category: concept
milestones:
  - Find and read relevant logs in /var/log for a running service
  - 'Use journalctl to filter logs by service, time, and severity'
  - Explain what log rotation is and why it matters
---

When a server is misbehaving, the first thing you do as an SRE is check the logs. Logs are the running diary of everything happening on a system — every request handled, every error thrown, every service started or stopped. They are almost always the fastest path from "something is broken" to "I know what is broken." Knowing where logs live, how to read them efficiently, and how to search through gigabytes of log data is arguably the single most practical skill in this entire roadmap.

<!-- DEEP_DIVE -->

**Where logs live.** On Linux, logs are primarily in two places:

- **`/var/log/`** — the traditional log directory. Inside you will find:
  - `/var/log/syslog` or `/var/log/messages` — the main system log, containing messages from the kernel, system services, and anything that uses the syslog protocol.
  - `/var/log/auth.log` — authentication events: SSH logins (successful and failed), sudo usage, user creation. Check this first if you suspect unauthorized access.
  - `/var/log/kern.log` — kernel messages, including hardware errors and OOM kills.
  - `/var/log/nginx/`, `/var/log/apache2/`, `/var/log/mysql/` — application-specific logs, typically in their own subdirectories.
  - `/var/log/dmesg` — boot-time kernel messages, useful for diagnosing hardware and driver issues.

- **The systemd journal** — a structured, binary log managed by `journald`. Every service managed by systemd has its output captured here. Access it with `journalctl`.

**journalctl — your log Swiss Army knife.**

- `journalctl -u nginx` — all logs for the Nginx service
- `journalctl -u nginx --since "2 hours ago"` — filtered by time
- `journalctl -u nginx --since "2024-01-15 10:00" --until "2024-01-15 11:00"` — specific time range
- `journalctl -u nginx -f` — follow logs in real time (like `tail -f`)
- `journalctl -p err` — only error-level messages across all services
- `journalctl -b` — all logs from the current boot
- `journalctl -b -1` — logs from the previous boot (essential for diagnosing why a machine rebooted)
- `journalctl --disk-usage` — how much space the journal is using

The journal is structured data, not just text. Each log entry has metadata: timestamp, service name, PID, priority level. This makes it far more searchable than flat text files.

**Reading logs during an incident.** When you get paged at 3 AM because a service is down, here is a practical workflow:

1. `systemctl status myservice` — is it running? When did it last start? First few log lines right there.
2. `journalctl -u myservice --since "30 min ago"` — what happened leading up to the failure?
3. Look for patterns: is it one error repeated, or a cascade? Is there an OOM kill in `journalctl -p err`?
4. Check related services: `journalctl -u postgresql --since "30 min ago"` — maybe the database went down first.
5. Check system-level events: `dmesg | tail -50` — hardware errors? disk full? OOM killer?

**Searching logs with command-line tools.** This is where pipes and redirection pay off:

- `grep "ERROR" /var/log/myapp/app.log` — find all errors
- `grep -c "500" /var/log/nginx/access.log` — count 500 errors
- `tail -f /var/log/nginx/access.log | grep --line-buffered "POST /api"` — watch POST requests in real time
- `zgrep "timeout" /var/log/myapp/app.log.2.gz` — search through compressed rotated logs

**Log rotation.** Logs grow. A busy web server can produce gigabytes of log data per day. Without management, logs will fill up your disk and crash the server. **logrotate** is the standard tool for this — it automatically rotates logs (renames `app.log` to `app.log.1`, compresses old files, and deletes files older than a configured age). Most services configure logrotate automatically when you install them. The config lives in `/etc/logrotate.conf` and `/etc/logrotate.d/`. A full disk caused by unmanaged logs is one of the most common preventable outages — always make sure log rotation is configured.

**Log levels.** Most logging systems use standard severity levels: DEBUG, INFO, WARNING, ERROR, CRITICAL (or similar names). In production, you typically run at INFO or WARNING level — DEBUG produces too much output. But when diagnosing a tricky issue, temporarily increasing the log level to DEBUG can reveal exactly what is happening. Understanding how to change log levels for the services you manage (usually a config file change and a SIGHUP or restart) is a practical skill you will use regularly.

<!-- RESOURCES -->

- [Linux Logging Basics - Loggly](https://www.loggly.com/ultimate-guide/linux-logging-basics/) -- type: tutorial, time: 30m
- [journalctl Cheat Sheet - Red Hat](https://www.redhat.com/sysadmin/journalctl-cheat-sheet) -- type: reference, time: 10m
- [Understanding /var/log - DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-view-and-configure-linux-logs-on-ubuntu-and-centos) -- type: tutorial, time: 25m
- [logrotate Guide - Linuxize](https://linuxize.com/post/logrotate/) -- type: tutorial, time: 20m
- [Logging Best Practices for SREs - Google SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/) -- type: book, time: 30m
