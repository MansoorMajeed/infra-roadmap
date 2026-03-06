---
id: beszel
title: 'Beszel: Simple Server Monitoring'
zone: self-hosting
difficulty: 1
tags:
  - self-hosting
  - monitoring
  - beszel
  - docker
category: tool
milestones:
  - Deploy Beszel with Docker Compose
  - Add your server as a monitored host
  - See CPU, memory, disk, and network stats in the dashboard
  - Set up a basic alert for disk usage
---

Beszel is a lightweight server monitoring tool that runs as a single Docker container. It gives you a clean web dashboard showing CPU, memory, disk, network, and container stats for each of your servers. No complicated setup, no YAML config files to wrestle with — deploy it, add your hosts, and you have monitoring.

For a homelab with one or two servers, this is often all you need.

<!-- DEEP_DIVE -->

## How it works

Beszel has two parts:

- **Hub** — the web UI and data collector. This runs on one machine (wherever you want to view your dashboard).
- **Agent** — a tiny binary that runs on each machine you want to monitor. It collects system metrics and sends them to the hub.

The agent is lightweight — it uses minimal CPU and memory, and you won't notice it running.

## Deploying the hub

```yaml
# docker-compose.yml
services:
  beszel:
    image: henrygd/beszel
    container_name: beszel
    restart: unless-stopped
    ports:
      - "8090:8090"
    volumes:
      - ./beszel-data:/beszel_data
```

```bash
docker compose up -d
```

Open `http://YOUR-SERVER-IP:8090` and create your admin account.

## Adding a server

In the Beszel web UI, click to add a new system. It gives you a command to run the agent — either as a Docker container or a standalone binary. For Docker:

```yaml
services:
  beszel-agent:
    image: henrygd/beszel-agent
    container_name: beszel-agent
    restart: unless-stopped
    network_mode: host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      PORT: 45876
      KEY: "<your-key-from-the-ui>"
```

The agent starts reporting immediately. Within seconds you'll see your server's stats in the dashboard.

## What you get

The dashboard shows real-time and recent historical data for each host:

- **CPU** — usage percentage, per-core breakdown
- **Memory** — used, available, swap
- **Disk** — usage per mount, read/write rates
- **Network** — bandwidth in/out
- **Docker containers** — CPU and memory per container, running status

It also supports basic alerting — you can set thresholds (e.g., disk usage above 90%) and get notified.

## When Beszel isn't enough

Beszel is great for "is my server healthy right now?" It's less suited for:

- Long-term metric storage and trend analysis
- Custom application metrics (e.g., request latency from your reverse proxy)
- Complex alerting rules with multiple conditions
- Monitoring across many servers with aggregated views

If you find yourself wanting these, Prometheus + Grafana is the next step.

<!-- RESOURCES -->

- [Simple Monitoring with Beszel](https://blog.esc.sh/simple-monitoring-with-beszel/) -- type: guide, time: 15min
- [Beszel on GitHub](https://github.com/henrygd/beszel) -- type: reference, time: 5min
