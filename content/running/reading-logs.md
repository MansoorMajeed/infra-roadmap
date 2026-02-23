---
id: "reading-logs"
title: "Reading Logs"
zone: "running"
edges:
  from:
    - id: "process-management"
      question: "My app is running as a systemd service. How do I see its output and errors?"
      detail: "Your app is running. But when something goes wrong — a crash, an unexpected error, a request that returns 500 — how do you know? systemd captures all stdout and stderr from your service into the journal. Learning to read logs is how you find out what is happening inside your running app."
    - id: "web-servers"
      question: "Nginx is running and serving traffic. How do I see what requests are coming in?"
      detail: "Nginx logs every request it handles and every error it encounters. These logs are your window into what users are actually doing — what URLs they are hitting, what errors they are getting, and what Nginx cannot handle. Reading access logs and error logs is a core skill."
  to:
    - id: "troubleshooting-basics"
      question: "I can read logs. How do I use them to systematically debug problems?"
      detail: "I can find and read logs now. But when something breaks I still end up randomly restarting things and hoping it helps. I need a more systematic approach — a way to narrow down which part of the stack is actually broken instead of just guessing."
difficulty: 1
tags: ["logs", "journalctl", "nginx", "tail", "grep", "debugging", "stdout", "stderr"]
category: "practice"
milestones:
  - "Use journalctl to view live and filtered logs for a systemd service"
  - "Find and read the Nginx access log and error log"
  - "Filter logs by time range and search for specific error messages"
---

Your app is running, Nginx is serving traffic, and then something breaks. A page returns 500. An image is not loading. The app is crashing every few minutes. The first thing you do is look at the logs.

Logs are the record of what your system did. Every request Nginx handled. Every error your app threw. Every time systemd restarted a service. Learning to find and read logs is the most important debugging skill you have.

<!-- DEEP_DIVE -->

**Two log systems to know**

On a modern Ubuntu server, logs come from two places:

1. **journald** — systemd's log collector. Captures stdout/stderr from every systemd service. Accessed via `journalctl`.
2. **Log files on disk** — traditional log files in `/var/log/`. Nginx, syslog, auth logs, and others write here.

**journalctl — your app's logs**

If your app runs as a systemd service, all its output goes to journald:

```bash
# All logs for your service
sudo journalctl -u mystore

# Follow live output — like tail -f, shows new entries as they arrive
sudo journalctl -u mystore -f

# Last N lines
sudo journalctl -u mystore -n 50

# Logs since a time
sudo journalctl -u mystore --since "1 hour ago"
sudo journalctl -u mystore --since "2024-01-15 10:00:00"

# Only errors and above (filters out INFO/DEBUG)
sudo journalctl -u mystore -p err

# Logs since the last boot (useful after a server restart)
sudo journalctl -u mystore -b

# All services, not just yours — useful when debugging boot problems
sudo journalctl -f
```

**Nginx logs**

Nginx writes two log files:

```bash
# Access log — one line per request
sudo tail -f /var/log/nginx/access.log

# Error log — problems Nginx encountered
sudo tail -f /var/log/nginx/error.log

# Both at once
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

The access log format looks like:

```
143.198.100.50 - - [15/Jan/2024:10:00:01 +0000] "GET /products HTTP/1.1" 200 4523 "https://mystore.com/" "Mozilla/5.0 ..."
                                                  [method] [path]          [status] [bytes sent]
```

Key things to look for:
- **Status 4xx** — client errors (404 = not found, 403 = forbidden, 429 = rate limited)
- **Status 5xx** — server errors (500 = your app threw an exception, 502 = Nginx cannot reach your app, 504 = your app is too slow)
- **502 Bad Gateway** — means Nginx is running but your app is not, or is not listening on the expected port
- **Repeated requests from one IP** — could be a scanner or a stuck client

**Filtering logs with grep**

```bash
# Find all 500 errors in the Nginx access log
sudo grep " 500 " /var/log/nginx/access.log

# Find all errors from a specific IP
sudo grep "1.2.3.4" /var/log/nginx/access.log

# Find errors in your app's logs
sudo journalctl -u mystore | grep -i "error\|exception\|traceback"

# Count how many 502 errors occurred
sudo grep -c " 502 " /var/log/nginx/access.log
```

**Auth logs — who is trying to get in**

```bash
# See SSH login attempts (successful and failed)
sudo tail -f /var/log/auth.log

# Count failed login attempts
sudo grep "Failed password" /var/log/auth.log | wc -l
# If this number is in the thousands, someone is actively brute-forcing you
# Make sure PasswordAuthentication is set to no in sshd_config
```

**Syslog — system-level events**

```bash
# General system log
sudo tail -f /var/log/syslog

# Kernel messages — hardware issues, OOM kills, etc.
sudo dmesg | tail -20
```

**Following multiple logs at once**

When debugging a request that goes through multiple layers (Nginx → your app → database), watching all logs simultaneously helps:

```bash
# Open multiple terminals, or use tmux
# Terminal 1: Nginx access log
sudo tail -f /var/log/nginx/access.log

# Terminal 2: Your app's logs
sudo journalctl -u mystore -f

# Terminal 3: Run your test request
curl http://localhost/some-endpoint
```

**Reading Python tracebacks in logs**

When your Python app crashes, you get a traceback in the logs. Read it from the bottom up — the last line tells you what went wrong, the lines above show how you got there:

```
Traceback (most recent call last):
  File "/home/deploy/mystore/app.py", line 42, in get_products
    results = db.execute(query)
  File "/home/deploy/mystore/db.py", line 15, in execute
    return self.conn.execute(sql)
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server
```

Bottom line: `could not connect to server` — the database is down or unreachable. The lines above show the call path.

<!-- RESOURCES -->

- [journalctl man page](https://man7.org/linux/man-pages/man1/journalctl.1.html) -- type: reference, time: 10m
- [Nginx log format documentation](https://nginx.org/en/docs/http/ngx_http_log_module.html) -- type: reference, time: 10m
- [DigitalOcean - Understanding Nginx Log Files](https://www.digitalocean.com/community/tutorials/how-to-configure-logging-and-log-rotation-in-nginx-on-an-ubuntu-vps) -- type: tutorial, time: 15m
