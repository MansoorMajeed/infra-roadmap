---
id: "systemd-and-services"
title: "systemd & Services"
zone: "foundations"
edges:
  from:
    - id: "signals-and-ipc"
      question: "I know how processes communicate. Who manages all the services?"
      detail: "You understand signals — how to tell a process to stop, reload, or terminate. But on a real server, dozens of services need to start in the right order at boot, restart if they crash, and shut down gracefully. Something needs to orchestrate all of this. That something is the init system, and on modern Linux, it is systemd. It uses the same signals you just learned about, but wraps them in a service management framework."
    - id: "linux-and-distros"
      question: "Linux runs services. What manages them?"
      detail: "You know that Linux servers run dozens of services — web servers, databases, monitoring agents, cron daemons. But who starts them when the machine boots? Who restarts them when they crash? Who makes sure they start in the right order? The init system handles all of this, and on virtually every modern Linux distribution, that init system is systemd. Understanding systemd is essential for managing any Linux server."
  to:
    - id: "log-files"
      question: "Services are running. How do I see what they are doing?"
      detail: "My service is running — great. But when something goes wrong I have no idea where to look. It crashed and restarted but I don't know why. There must be output from it somewhere, some record of what happened. How do I find that and actually make sense of it?"
difficulty: 1
tags: ["systemd", "systemctl", "journalctl", "services", "init", "units", "daemons"]
category: "concept"
milestones:
  - "Use systemctl to start, stop, restart, and check the status of a service"
  - "Read service logs with journalctl"
  - "Explain what a systemd unit file is and what its key sections do"
---

When a Linux server boots, something needs to start all the services that make it useful — the SSH daemon so you can log in, the web server to handle requests, the database to store data, the monitoring agent to report health. That something is the **init system**, and on virtually every modern Linux distribution, it is **systemd**. It is PID 1 — the first process that starts, the parent of all other processes, and the orchestrator that keeps your services running. As an SRE, `systemctl` and `journalctl` will be among your most-used commands.

<!-- DEEP_DIVE -->

**What systemd does.** At its core, systemd manages **units** — and a unit can be a service, a timer, a mount point, a socket, or several other things. The most common unit type is a **service**, which represents a daemon (a long-running background process). When you run `systemctl start nginx`, systemd reads Nginx's unit file, starts the process, and begins monitoring it. If Nginx crashes, systemd can automatically restart it (if configured to do so). When the system shuts down, systemd sends SIGTERM to all services, waits for them to exit gracefully, and then sends SIGKILL to anything still running — this is the signal knowledge from the previous node in action.

**systemctl — the command you will use daily.**

- `systemctl start nginx` — start a service
- `systemctl stop nginx` — stop a service (sends SIGTERM, then SIGKILL after a timeout)
- `systemctl restart nginx` — stop then start
- `systemctl reload nginx` — send SIGHUP to reload config without restarting (not all services support this)
- `systemctl status nginx` — show whether the service is running, its PID, recent log lines, and how long it has been up
- `systemctl enable nginx` — start this service automatically at boot
- `systemctl disable nginx` — do not start at boot
- `systemctl list-units --type=service` — list all loaded services and their states

The `status` command is especially valuable during incidents. It shows you at a glance whether the service is running, when it last started, and the most recent log output. Often that is enough to diagnose the problem without digging further.

**Unit files.** Every service has a unit file, typically at `/etc/systemd/system/` (for custom services) or `/lib/systemd/system/` (for distribution-provided ones). A basic service unit file looks like this:

```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myapp
ExecStart=/usr/bin/myapp --config /etc/myapp/config.yaml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

The key sections: `[Unit]` describes the service and its dependencies (`After=network.target` means "start this after networking is up"). `[Service]` defines how to run it — what command to execute, which user to run as, and what to do if it crashes (`Restart=on-failure` means systemd will automatically restart it if it exits with a non-zero status). `[Install]` controls what happens when you `enable` the service. As an SRE, you will read and write unit files regularly — every custom application you deploy needs one.

**journalctl — reading logs through systemd.** systemd captures the stdout and stderr of every service it manages and stores it in a structured journal. `journalctl -u nginx` shows all logs for Nginx. `journalctl -u nginx --since "1 hour ago"` filters by time. `journalctl -u nginx -f` follows the log in real time (like `tail -f`). `journalctl -p err` shows only error-level messages across all services. The journal is indexed and searchable, which makes it significantly more powerful than manually grepping through log files — though traditional log files in `/var/log/` still exist alongside it.

**Dependencies and ordering.** One of systemd's strengths is managing the order in which services start. Your application might need the database to be running first, and the database might need the filesystem mounted. Unit files express these dependencies with `After=`, `Requires=`, and `Wants=` directives. When something fails to start, `systemctl list-dependencies myservice` shows you the full dependency tree, which often reveals that a dependency failed first.

**Timers — the modern cron.** systemd also provides timers, which are a replacement for cron jobs. A timer unit triggers a service unit on a schedule. The advantage over cron is that timer execution is logged in the journal, missed runs can be handled, and you get all of systemd's service management features (resource limits, dependency ordering, restart policies). You will encounter both cron and systemd timers in production.

<!-- RESOURCES -->

- [systemd for Beginners - DigitalOcean](https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal) -- type: tutorial, time: 30m
- [Understanding systemd Units and Unit Files](https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files) -- type: tutorial, time: 30m
- [journalctl Guide - Linuxize](https://linuxize.com/post/using-journalctl/) -- type: tutorial, time: 20m
- [Arch Wiki - systemd (comprehensive reference)](https://wiki.archlinux.org/title/Systemd) -- type: reference, time: varies
- [systemd by Example](https://systemd-by-example.com/) -- type: tutorial, time: 1h
