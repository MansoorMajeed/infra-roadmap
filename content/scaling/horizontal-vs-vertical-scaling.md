---
id: horizontal-vs-vertical-scaling
title: Vertical vs Horizontal Scaling
zone: scaling
edges:
  to:
    - id: load-balancers
      question: >-
        Horizontal scaling sounds right. What do I need before I can add more
        servers?
      detail: >-
        If I add more servers, how does traffic actually get to them? I can't
        point my domain at ten IPs and hope it works out. Something has to sit
        in front and distribute requests. I don't really understand what that
        thing is or how it works.
difficulty: 1
tags:
  - scaling
  - vertical-scaling
  - horizontal-scaling
  - capacity-planning
  - architecture
category: concept
milestones:
  - Explain the ceiling problem with vertical scaling
  - Describe why horizontal scaling requires stateless application design
  - >-
    Give an example of a workload better suited to vertical vs horizontal
    scaling
---

When a server can't handle the load, you have two options: make the server bigger, or add more servers. These are called vertical scaling (scale up) and horizontal scaling (scale out). They have different costs, different limits, and different implications for how you design your application.

<!-- DEEP_DIVE -->

## Vertical scaling: make it bigger

Vertical scaling means upgrading the machine — more CPU cores, more RAM, faster disk. If you're on AWS, this means stopping the instance and changing to a larger instance type. This is the path of least resistance. You don't change any code, you don't change your architecture, you just pay more for a bigger box.

The problem is the ceiling. There is a largest VM in any cloud provider's catalog. You will hit it. And even before you hit the absolute limit, you run into diminishing returns: doubling CPU doesn't double throughput if your bottleneck is database queries, network I/O, or something else.

Vertical scaling also doesn't solve availability. A very powerful server that goes down is still down.

## Horizontal scaling: add more servers

Horizontal scaling means running the same application on multiple identical servers simultaneously and distributing traffic across them. This is the architecture that can theoretically scale to any load — you just keep adding servers.

But horizontal scaling has a prerequisite that vertical scaling doesn't: **your application must be stateless**.

If each server stores any local state — session data in files, user-uploaded images on disk, cached computation results in memory — then routing the same user to a different server breaks things. Two servers can't share local state. The application has to be written so that any server can handle any request at any time, because with a load balancer you can't control which server handles which request.

## What stateless means in practice

A stateless application stores all persistent state in shared, external systems:
- **Sessions** in Redis or a database (not in a file on the server's filesystem)
- **Uploaded files** in object storage (S3, GCS) (not on the server's local disk)
- **Application configuration** via environment variables or a config service (not hardcoded per-instance)

The server itself becomes disposable. You can start it, kill it, replace it, and it doesn't matter — it has no unique state that would be lost.

## When to use which

Vertical scaling is appropriate for stateful workloads that are hard to distribute: databases, certain caches, memory-intensive batch jobs. You can't just add another Postgres primary — distributed databases require significant application changes. Vertical scaling buys you time.

Horizontal scaling is appropriate for stateless web application tiers. Once you've made your app stateless, running three servers instead of one is straightforward and gives you both more capacity and automatic redundancy.

Most production systems use both: vertical scaling for databases (within limits), horizontal scaling for application servers.

<!-- RESOURCES -->

- [Scaling Up vs Scaling Out - Digital Ocean](https://www.digitalocean.com/community/tutorials/5-common-server-setups-for-your-web-application) -- type: article, time: 15m
- [The Twelve-Factor App - Processes](https://12factor.net/processes) -- type: article, time: 10m
- [Designing Data-Intensive Applications - Chapter 1 (Reliability, Scalability, Maintainability)](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) -- type: book, time: 45m
