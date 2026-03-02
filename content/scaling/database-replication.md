---
id: database-replication
title: Database Replication
zone: scaling
edges:
  to:
    - id: replication-internals
      question: >-
        How does the replica actually stay in sync? What's happening under the
        hood?
      detail: >-
        When you add a read replica, the database engine streams every write
        from the primary using a binary log. Understanding this mechanism —
        replication lag, async vs sync, what 'eventually consistent' really
        means — helps you reason about what you can and can't do with replicas.
    - id: database-write-scaling
      question: Read replicas handle my reads. But write traffic is growing and the primary is showing CPU pressure. Adding more replicas doesn't help writes at all. What are my options?
      detail: >-
        All writes still go to one primary. I've offloaded reads to replicas
        but the primary is now the bottleneck — CPU is climbing, replication
        lag is growing. I can't just add another primary the way I added
        replicas. What does horizontal write scaling actually look like?
difficulty: 2
tags:
  - replication
  - database
  - read-replicas
  - multi-az
  - failover
  - lag
  - consistency
category: concept
milestones:
  - Explain the difference between synchronous and asynchronous replication
  - Describe what replication lag is and when it matters
  - Understand what happens to in-flight writes during a Multi-AZ failover
  - >-
    Know why you can't use a read replica as a direct failover target without
    promotion
---

Database replication creates additional copies of your database that stay in sync with the primary. Read replicas let you distribute read-heavy queries across multiple database servers — product listings, search queries, reporting — while all writes still go to the primary. Multi-AZ deployments create a standby in another availability zone that can take over if the primary fails. Understanding the difference between these and how they interact is essential for building a database tier that handles real traffic.

<!-- DEEP_DIVE -->

## Read replicas

A read replica receives a continuous stream of changes from the primary and applies them, maintaining a copy of the data that is slightly behind the primary (replication lag). You configure your application to send reads to one or more replicas and writes to the primary.

```python
# Write to primary
primary_db.execute("INSERT INTO orders ...")

# Read from replica for non-critical reads
replica_db.execute("SELECT * FROM products WHERE ...")
```

On RDS, creating a read replica is a few clicks. RDS gives the replica its own endpoint (different hostname from the primary). You configure this in your application's database settings.

The key property: read replicas are **asynchronous**. Data written to the primary doesn't immediately appear on the replica — there's a delay (usually milliseconds, sometimes seconds under load). This is called **replication lag**.

## Multi-AZ

Multi-AZ is different from a read replica. With Multi-AZ enabled:
- RDS maintains a **standby** in a second availability zone
- Replication to the standby is **synchronous** — a write isn't acknowledged to your application until it's confirmed on both the primary and standby
- You **cannot** read from the standby — it exists only for failover
- If the primary fails (hardware failure, AZ outage), RDS automatically promotes the standby and updates the DNS endpoint — typically in 60-120 seconds

Multi-AZ increases write latency slightly (the synchronous replication adds a small amount of time for each write), but gives you automatic failover without data loss.

## The critical distinction

**Multi-AZ is for availability (surviving failures). Read replicas are for performance (distributing read load).** They're different features addressing different problems. In production, you typically want both:
- Multi-AZ for the primary: so a failure doesn't take you offline
- Read replicas for read scaling: so your product listing queries don't compete with your checkout queries

## Replication lag matters

Replication lag means replicas can serve slightly stale data. For most read patterns — browsing product listings, searching — this is acceptable. For others, it can cause bugs:

**The "read your own writes" problem**: a user submits a review, you confirm it and redirect them to the product page. If the product page reads from a replica that hasn't received the insert yet, the review isn't there. The user thinks their submission was lost.

Solutions:
- After a write, read from the primary for a brief window (1-2 seconds)
- Track which replica is "caught up enough" using `Seconds_Behind_Master`
- For critical reads after writes, always go to the primary

## Monitoring replication lag

Watch `ReplicaLag` (RDS CloudWatch metric) for your read replicas. It should normally be under 1 second. Spikes indicate the replica is falling behind — usually because a large write transaction hit the primary, or the replica instance is undersized. Sustained high lag means your replica is not safe to read from for any data that changes frequently.

<!-- RESOURCES -->

- [AWS RDS Read Replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html) -- type: docs, time: 20m
- [AWS RDS Multi-AZ vs Read Replicas](https://aws.amazon.com/rds/features/multi-az/) -- type: article, time: 10m
- [Postgres Replication Lag - pganalyze](https://pganalyze.com/docs/log-insights/server/S10) -- type: article, time: 10m
