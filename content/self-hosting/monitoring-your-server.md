---
id: monitoring-your-server
title: How Do I Know If Something Breaks?
zone: self-hosting
edges:
  to:
    - id: beszel
      question: I just want something simple that tells me when things are down
      detail: >-
        I don't need fancy dashboards or historical data. I want to open one
        page and see green or red — are my services up, is my disk getting
        full, is the CPU pegged. That's it.
    - id: prometheus-grafana
      question: I want real dashboards, metrics history, and alerting
      detail: >-
        I want to see graphs over time — when did memory usage spike, how has
        disk space trended over the last month, which container is eating all
        the CPU. And I want alerts when things go wrong, not just a status page.
difficulty: 1
tags:
  - self-hosting
  - monitoring
  - observability
  - uptime
category: concept
milestones:
  - Understand what server monitoring actually means (uptime, resources, logs)
  - Know the difference between simple monitoring and full observability
  - Decide which approach fits your needs
---

You find out Jellyfin is down because someone texts you "the stream isn't working." You discover your disk is full because a new container won't start. You realize the server rebooted three days ago because the uptime counter reset.

This is monitoring by accident. It works until it doesn't — and when it doesn't, it's usually at the worst time.

<!-- DEEP_DIVE -->

## What monitoring actually means

At its simplest, monitoring answers three questions:

1. **Is it up?** — Are my services responding? Did something crash?
2. **Is it healthy?** — CPU, memory, disk — are any of them maxed out or trending toward trouble?
3. **What happened?** — When did the problem start? What changed?

You can answer these at different levels of depth, from "just tell me if something's down" to "show me every metric over the last 90 days with alerting rules."

## Simple monitoring vs full observability

**Simple monitoring** is a lightweight dashboard that shows you the current state of your server: CPU usage, memory, disk space, network, and whether your services are responding. You check it when you want, or it pings you when something's wrong. Beszel is a great example — one Docker container, minimal configuration, covers the basics.

**Full observability** means collecting metrics over time, storing them, querying them, building dashboards, and setting up alerts. Prometheus scrapes metrics from your services on a schedule, stores them in a time-series database, and Grafana turns that data into dashboards and alerts. It's more work to set up but gives you historical data and much more flexibility.

## Which do you need?

Be honest about this. If you have one server running a handful of services, Beszel or something similar is probably all you need. You'll know if something's down, you'll see if disk space is getting tight, and you won't spend a weekend configuring dashboards.

If you have multiple servers, want to track specific application metrics, or just enjoy building dashboards (no judgment), Prometheus + Grafana is the way to go. It's also what you'll encounter in professional environments, so there's learning value beyond the homelab.

Both are free, both run in Docker, and you can always start simple and upgrade later.

<!-- RESOURCES -->
