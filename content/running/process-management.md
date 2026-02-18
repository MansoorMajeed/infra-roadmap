---
id: "process-management"
title: "Keeping Your App Running with systemd"
zone: "running"
edges:
  from:
    - id: "environment-variables"
      question: "My app is configured. How do I keep it running reliably after I close SSH?"
      detail: "Your app starts and works correctly. But if you close your SSH session, the process dies. If the server reboots, your app does not come back. You need a process manager — a system that keeps your app running, restarts it if it crashes, and starts it automatically on boot."
  to:
    - id: "web-servers"
      question: "My app is running as a managed service. What handles incoming HTTP traffic?"
      detail: "Your application is running and managed by systemd — it will restart if it crashes and come back after reboots. But it is only listening on a local port. You need Nginx in front of it to handle real HTTP/HTTPS traffic from the internet, serve static files, and proxy requests to your app."
    - id: "reading-logs"
      question: "My app is running as a systemd service. How do I see its output and errors?"
      detail: "Your app is running. But when something goes wrong — a crash, an unexpected error, a request that returns 500 — how do you know? systemd captures all stdout and stderr from your service into the journal. Learning to read logs is how you find out what is happening inside your running app."
difficulty: 1
tags: ["systemd", "process-management", "service", "daemon", "journald", "gunicorn", "pm2"]
category: "practice"
milestones:
  - "Write a systemd service file for a Python or Node.js application"
  - "Enable the service to start on boot and verify it restarts after a crash"
  - "Use journalctl to view live and historical logs for your service"
---

You run your app: `python3 app.py`. It works. You close your SSH session. The process is gone — it was a child of your shell, and when the shell ended, so did the app. You reboot the server. Your app does not come back.

A process manager solves this. It runs your application as a background service, independent of any shell session. If the app crashes, the process manager restarts it. When the server boots, the process manager starts it automatically. On Linux, that process manager is `systemd`.

<!-- DEEP_DIVE -->

**Why not just use `nohup` or `screen`?**

You might have heard of workarounds:

```bash
# nohup — keeps the process running after logout, but no auto-restart
nohup python3 app.py &

# screen / tmux — keep a persistent session, but fragile and manual
screen -S myapp
python3 app.py
# Ctrl+A, D to detach
```

These work for testing but are bad for production. If your app crashes, it stays dead. If the server reboots, you have to SSH in and manually start it again. Do not use these for anything that matters.

**systemd services**

systemd is the init system on modern Linux — the first process that starts on boot, responsible for starting everything else. Any long-running process should be a systemd service. You define it in a `.service` file:

```ini
# /etc/systemd/system/mystore.service

[Unit]
Description=My Store Application
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/mystore
EnvironmentFile=/home/deploy/mystore/.env
ExecStart=/home/deploy/mystore/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Breaking down the important fields:

| Field | What it does |
|-------|-------------|
| `After=network.target` | Do not start until the network is up |
| `User=deploy` | Run as this user (not root) |
| `WorkingDirectory=` | The process's working directory |
| `EnvironmentFile=` | Load environment variables from this file |
| `ExecStart=` | The command to run your app |
| `Restart=always` | Restart if the process exits for any reason |
| `RestartSec=5` | Wait 5 seconds between restart attempts |
| `WantedBy=multi-user.target` | Start this service in normal multi-user mode |

**For a Node.js app:**

```ini
[Unit]
Description=My Node App
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/mynodeapp
EnvironmentFile=/home/deploy/mynodeapp/.env
ExecStart=/usr/bin/node /home/deploy/mynodeapp/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Enabling and starting the service**

```bash
# Copy the service file to the right location (or create it there directly)
sudo nano /etc/systemd/system/mystore.service

# Tell systemd to reload its service file list
sudo systemctl daemon-reload

# Enable: start automatically on boot
sudo systemctl enable mystore

# Start: run it right now
sudo systemctl start mystore

# Check status
sudo systemctl status mystore
```

The status output looks like:

```
● mystore.service - My Store Application
     Loaded: loaded (/etc/systemd/system/mystore.service; enabled)
     Active: active (running) since Mon 2024-01-15 10:00:00 UTC; 5min ago
   Main PID: 12345 (gunicorn)
      Tasks: 5 (limit: 2340)
     Memory: 85.3M
        CPU: 1.234s
     CGroup: /system.slice/mystore.service
             ├─12345 /home/deploy/mystore/venv/bin/python3 -c ...
             └─12346 ...
```

**Managing a running service**

```bash
# Stop the service
sudo systemctl stop mystore

# Restart (stop then start) — use this after updating your code
sudo systemctl restart mystore

# Reload (if the app supports it — sends SIGHUP)
sudo systemctl reload mystore

# Check if it will start on boot
sudo systemctl is-enabled mystore

# Disable autostart
sudo systemctl disable mystore
```

**Viewing logs**

systemd captures all stdout and stderr from your service:

```bash
# All logs for your service
sudo journalctl -u mystore

# Follow live output (like tail -f)
sudo journalctl -u mystore -f

# Last 100 lines
sudo journalctl -u mystore -n 100

# Since a specific time
sudo journalctl -u mystore --since "1 hour ago"
sudo journalctl -u mystore --since "2024-01-15 10:00:00"
```

**Testing that restart works**

```bash
# Get your app's process ID
sudo systemctl status mystore | grep "Main PID"
# Main PID: 12345

# Kill the process — systemd should restart it within RestartSec seconds
sudo kill 12345

# Check status — it should show as restarted
sudo systemctl status mystore
```

**The deploy workflow with systemd**

After you update your code:

```bash
ssh deploy@your-server
cd /home/deploy/mystore
git pull origin main
source venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart mystore
sudo systemctl status mystore
```

One restart command. systemd handles stopping the old process and starting the new one.

<!-- RESOURCES -->

- [systemd service documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html) -- type: reference, time: 15m
- [DigitalOcean - systemd Units and Services](https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files) -- type: tutorial, time: 20m
- [journalctl man page](https://man7.org/linux/man-pages/man1/journalctl.1.html) -- type: reference, time: 10m
