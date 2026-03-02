---
id: cron-and-scheduling
title: Cron & Task Scheduling
zone: foundations
edges:
  to:
    - id: scripting-bash-python
      question: My cron jobs are getting complicated. When should I write a real script instead?
      detail: >-
        I started with simple one-liners in cron, but now I'm chaining five
        commands together, handling errors, and it's getting hard to read. At
        what point does this stop being a cron job and start being something
        that deserves a proper script? And what does that even look like?
difficulty: 1
tags:
  - cron
  - crontab
  - scheduling
  - automation
  - systemd-timers
category: practice
milestones:
  - Write a crontab entry that runs a script on a schedule
  - Explain the five cron time fields and read any cron expression
  - Capture cron job output and debug a job that isn't running
---

Some tasks need to happen on a schedule — clean up old files every night, run a database backup every hour, send a health check ping every five minutes. You do not want to do these by hand. **cron** is the standard Linux tool for scheduling recurring tasks, and it has been around since the 1970s. You will encounter it everywhere: on servers you manage, in applications you inherit, in containers you debug. Understanding how it works and where it fails is a practical necessity.

<!-- DEEP_DIVE -->

## How cron works

`crond` is a daemon that runs in the background and wakes up every minute to check if any scheduled jobs need to run. Jobs are defined in **crontab** files — one per user, managed with the `crontab` command.

```bash
crontab -e    # open your crontab for editing
crontab -l    # list your current crontab
crontab -r    # remove your crontab (careful — no confirmation)
```

Each line in a crontab defines one job. The format is:

```
minute  hour  day-of-month  month  day-of-week  command
```

Five time fields, then the command. The fields:

| Field | Range | Special |
|---|---|---|
| minute | 0–59 | |
| hour | 0–23 | |
| day of month | 1–31 | |
| month | 1–12 | |
| day of week | 0–7 | 0 and 7 both mean Sunday |

`*` in a field means "every". Special values:
- `*/5` — every 5 (e.g., every 5 minutes)
- `1,15` — at 1 and 15
- `1-5` — 1 through 5

## Reading cron expressions

```
# Run at 2:30 AM every day
30 2 * * * /opt/scripts/backup.sh

# Run every 5 minutes
*/5 * * * * /opt/scripts/healthcheck.sh

# Run at midnight on the 1st of every month
0 0 1 * * /opt/scripts/monthly-report.sh

# Run at 9 AM Monday through Friday
0 9 * * 1-5 /opt/scripts/morning-checks.sh

# Run every hour
0 * * * * /opt/scripts/cleanup.sh
```

Use [crontab.guru](https://crontab.guru/) to check your expressions interactively — paste in any cron schedule and it tells you in plain English when it will run.

## Special strings

These shortcuts replace the five time fields:

- `@daily` — run once a day at midnight (same as `0 0 * * *`)
- `@hourly` — run once an hour at the start of the hour
- `@weekly` — once a week, Sunday at midnight
- `@monthly` — once a month, the 1st at midnight
- `@reboot` — run once when the system boots. Useful for one-time setup after a restart.

## System-wide cron

Beyond per-user crontabs, there are system-wide locations:

- `/etc/crontab` — the system crontab. Has an extra field for the username to run as.
- `/etc/cron.d/` — directory for cron files, typically dropped there by packages. Same format as `/etc/crontab`.
- `/etc/cron.daily/`, `/etc/cron.hourly/`, `/etc/cron.weekly/`, `/etc/cron.monthly/` — just drop a script in the right directory and it runs on that schedule. No cron syntax needed.

When you install a package that needs scheduled maintenance (like certbot for TLS certificate renewal), it typically puts a file in `/etc/cron.d/` or `/etc/cron.daily/`. This is worth knowing when you are trying to understand where a job came from.

## The most common cron problems

**The job runs manually but not from cron.** Almost always a `PATH` issue. Cron runs with a minimal environment — it does not source your shell profile, so commands that work in your terminal may not be found. Fix it by using absolute paths in your cron commands:

```bash
# Fragile — relies on PATH
*/5 * * * * backup.sh

# Correct — absolute path
*/5 * * * * /opt/scripts/backup.sh

# Or set PATH explicitly at the top of your crontab
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
```

**You never find out when a job fails.** By default, cron emails output to the local user, which goes nowhere on most servers. Redirect output to a log file so you can check it:

```bash
*/5 * * * * /opt/scripts/healthcheck.sh >> /var/log/healthcheck.log 2>&1
```

`2>&1` redirects stderr to stdout, so both go to the log file. Without it, errors silently disappear.

**The job runs as the wrong user.** User crontabs run as that user. If your script needs root privileges, edit root's crontab (`sudo crontab -e`) or use `/etc/cron.d/` with an explicit user field.

**Overlapping runs.** If a job takes longer than its interval, a new instance starts before the previous one finishes. This can cause data corruption. Use a lock file or a tool like `flock`:

```bash
*/5 * * * * flock -n /tmp/myjob.lock /opt/scripts/myjob.sh
```

## systemd timers — the alternative

systemd provides timers as an alternative to cron. A timer unit triggers a service unit on a schedule. The advantages: execution is logged in the journal, you can see when a timer last ran with `systemctl list-timers`, missed runs can be caught up, and you get all of systemd's process management features.

```bash
systemctl list-timers          # show all active timers and when they last/next ran
systemctl status myapp.timer   # status of a specific timer
```

For simple scheduled tasks, cron is fine and much simpler to set up. For anything complex — jobs that need resource limits, dependency ordering, reliable logging, or restart-on-failure — systemd timers are worth the extra setup. Both approaches are common in production; you need to be comfortable with both.

<!-- RESOURCES -->

- [crontab.guru - Interactive cron expression editor](https://crontab.guru/) -- type: tool, time: 5m
- [Cron How-To - Ubuntu](https://help.ubuntu.com/community/CronHowto) -- type: tutorial, time: 20m
- [systemd Timers - Arch Wiki](https://wiki.archlinux.org/title/Systemd/Timers) -- type: reference, time: 30m
- [A Cron Tutorial for Beginners - DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-ubuntu-1804) -- type: tutorial, time: 25m
