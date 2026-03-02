---
id: your-store-takes-off
title: Your Store Takes Off
zone: scaling
edges:
  to:
    - id: one-server-is-not-enough
      question: >-
        The store gets press coverage. Thousands of users show up at once. What
        breaks?
      detail: >-
        A single server has hard ceilings on CPU, memory, and connections. And
        if it crashes at 3 AM, the store is just down. Let's look at exactly
        what goes wrong — and why it goes wrong — before we talk about
        solutions.
difficulty: 1
tags:
  - example
  - python
  - mysql
  - single-vm
  - ecommerce
  - architecture
category: concept
milestones:
  - 'Understand the baseline stack: Python (Flask/FastAPI), MySQL, single VM'
  - Identify what each component does and why it exists
  - Understand why this setup works fine at small scale
---

You have a working e-commerce store. It runs on a single Linux VM: a Python web app (Flask or FastAPI), MySQL for the database, and Nginx in front. Everything is on one machine. Traffic is light, the app is fast, and life is good. This zone follows that store as it grows — and breaks — and gets rebuilt into something that can actually handle scale.

<!-- DEEP_DIVE -->

## The baseline stack

The store is a classic three-tier web application collapsed onto one box. Nginx receives incoming HTTP requests and proxies them to the Python app (running under Gunicorn or Uvicorn). The Python app does the business logic — looking up products, adding items to cart, processing checkouts. MySQL holds all the data: products, users, orders, inventory.

This setup works fine for hundreds of concurrent users. MySQL is fast for well-indexed relational queries. Python handles requests quickly enough. A single VM with 4 vCPUs and 8 GB of RAM can sustain surprising load if the app is reasonably efficient.

## Why single-server is fine — until it isn't

The fundamental problem with running everything on one machine is that it has hard limits. There's only so much CPU, memory, and network bandwidth. When you're at 10% utilization those limits feel irrelevant. When you're at 90% they feel very real, and you have no good options.

The second problem is reliability. If that one server has a bad disk, a kernel panic, a runaway process, or just needs an OS update — the store is down. There's no failover, no redundancy, no "the other server will take over." A single server is a single point of failure for every component simultaneously.

## What this zone covers

This zone works through the scaling problems you'd actually encounter as that store grows — adding a load balancer, solving the session problem, setting up auto-scaling, caching in multiple layers, scaling the database, handling background jobs, and protecting the API. Each node in the graph is a real problem you'll hit in roughly the order you'd hit it.

<!-- RESOURCES -->

- [AWS Well-Architected Framework - Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) -- type: docs, time: 30m
- [High Scalability - Real-world architecture case studies](http://highscalability.com/) -- type: article, time: varies
- [Designing Data-Intensive Applications (Kleppmann) - Chapter 1](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) -- type: book, time: 1h
