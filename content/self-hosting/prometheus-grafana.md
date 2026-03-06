---
id: prometheus-grafana
title: 'Prometheus + Grafana: Full Observability Stack'
zone: self-hosting
difficulty: 2
tags:
  - self-hosting
  - monitoring
  - prometheus
  - grafana
  - observability
category: tool
milestones:
  - Understand what Prometheus does (scraping, storing, querying metrics)
  - Deploy Prometheus and Grafana with Docker Compose
  - Add node_exporter to monitor your server's hardware
  - Import a pre-built Grafana dashboard
  - Write a basic alerting rule
---

Prometheus collects metrics from your services on a schedule, stores them as time-series data, and lets you query them. Grafana takes that data and turns it into dashboards and alerts. Together, they're the standard monitoring stack used everywhere from homelabs to production infrastructure at scale.

It's more involved to set up than a simple monitoring tool, but once running, you get historical data, custom dashboards, and alerting that can notify you through almost any channel.

<!-- DEEP_DIVE -->

## How the pieces fit together

```
Your services → exporters → Prometheus (scrape + store) → Grafana (visualize + alert)
```

**Prometheus** doesn't collect metrics by pushing them from your services. Instead, it *pulls* (scrapes) metrics from HTTP endpoints on a schedule (usually every 15 seconds). Each service exposes a `/metrics` endpoint that Prometheus reads.

**Exporters** are small programs that expose metrics for things that don't natively speak Prometheus. The most common is `node_exporter`, which exposes hardware and OS metrics (CPU, memory, disk, network) for Linux machines.

**Grafana** connects to Prometheus as a data source and lets you build dashboards, set alert rules, and send notifications to Slack, Discord, email, or whatever you use.

## Deploying the stack

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter
    container_name: node-exporter
    restart: unless-stopped
    pid: host
    network_mode: host
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus-data:
  grafana-data:
```

## Configuring Prometheus

Create `prometheus.yml` next to your Compose file:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['host.docker.internal:9100']
```

This tells Prometheus to scrape `node_exporter` every 15 seconds. Add more targets as you add exporters for other services.

```bash
docker compose up -d
```

Prometheus is now at `http://YOUR-SERVER-IP:9090`, Grafana at `http://YOUR-SERVER-IP:3000`.

## Setting up Grafana

1. Log in to Grafana (default: `admin`/`admin`, it'll ask you to change the password)
2. Go to Connections → Data Sources → Add → Prometheus
3. Set the URL to `http://prometheus:9090` (Docker's internal DNS)
4. Save and test

Now import a dashboard. Go to Dashboards → Import, and enter dashboard ID `1860` (the "Node Exporter Full" community dashboard). Select your Prometheus data source. You'll immediately see CPU, memory, disk, network, and dozens of other metrics with historical graphs.

## Adding more exporters

The power of Prometheus is that almost everything has an exporter:

- **cAdvisor** — per-container CPU, memory, network metrics
- **Traefik** — has built-in Prometheus metrics (request counts, latency, error rates)
- **Blackbox exporter** — probe endpoints for uptime monitoring (HTTP, TCP, ICMP)

Each exporter gets a `targets` entry in `prometheus.yml`. The ecosystem is huge.

## Alerting

Grafana can send alerts based on metric thresholds. Common examples:

- Disk usage above 85% → send a Discord notification
- A service's HTTP endpoint returns non-200 for 5 minutes → send an email
- CPU sustained above 90% for 10 minutes → alert

Set these up in Grafana under Alerting → Alert rules. You define the query, the threshold, and where to send the notification (Grafana calls these "contact points").

## Is this overkill for a homelab?

Maybe. If you have one server and five services, Beszel is simpler and covers the basics. But if you enjoy dashboards, want to learn a tool used across the industry, or plan to grow your setup — Prometheus + Grafana is worth the investment. Once it's running, it mostly takes care of itself.

<!-- RESOURCES -->

- [Prometheus and Grafana Setup](https://blog.esc.sh/prometheus-grafana/) -- type: guide, time: 30min
- [Prometheus Documentation](https://prometheus.io/docs/) -- type: reference, time: ongoing
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/) -- type: reference, time: ongoing
- [Node Exporter Full Dashboard](https://grafana.com/grafana/dashboards/1860-node-exporter-full/) -- type: reference, time: 5min
