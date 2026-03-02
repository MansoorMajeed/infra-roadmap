---
id: database-write-scaling
title: Scaling Database Writes
zone: scaling
edges:
  to:
    - id: application-caching
      question: Writes are distributed. But I'm still hitting the database on every request for the same product listings and user profiles. How do I stop that?
      detail: >-
        Sharding took the write pressure off any single node. But reads are
        still hammering the database on every request — the same product
        listing query, the same user profile fetch, over and over. The next
        lever is keeping hot data in memory so it never reaches the database
        at all.
difficulty: 3
tags:
  - sharding
  - partitioning
  - database
  - write-scaling
  - postgres
  - mysql
  - distributed-systems
category: concept
milestones:
  - Explain what a write bottleneck looks like (CPU on primary, growing replication lag)
  - Know the difference between horizontal partitioning (sharding) and vertical partitioning
  - Explain what a shard key is and why choosing it badly is a one-way door
  - Understand what cross-shard queries are and why they are expensive
  - Know what to try before sharding (connection pooling, read replicas, caching)
  - Know how managed databases (Aurora, CockroachDB, Spanner) abstract some of this
---

Read replicas address the read side of database scaling, but all writes still go to one primary. At some point — and this point comes much later than most people expect, usually after they've exhausted caching, connection pooling, and query optimization — the primary becomes a bottleneck. Write scaling is genuinely hard. The options involve significant trade-offs and architectural complexity.

<!-- DEEP_DIVE -->

## Before you shard: exhaust other options

Sharding is a one-way door with serious long-term costs. Before going there:

**Connection pooling** (PgBouncer): each application server maintains its own connection pool, but many connections from many servers quickly hit Postgres's max_connections. PgBouncer multiplexes many application connections onto far fewer database connections, dramatically reducing connection overhead on the primary.

**Query optimization**: a slow query that scans a table of 100M rows and takes 500ms on every request is a much bigger write bottleneck than the writes themselves. Profile your query patterns. Add indexes. Rewrite N+1 queries.

**Caching**: every read you serve from Memcache or Redis is a read that doesn't hit the database, freeing CPU on the primary for writes. High read-to-write ratios make caching the most effective scaling lever.

**Vertical scaling**: upgrading the primary to a larger instance (more CPU, faster disk, more RAM for buffer cache) is often the right short-term answer. Managed databases like Aurora can handle very large workloads on a single primary.

## Horizontal write scaling: partitioning

When the primary truly cannot keep up and vertical scaling has limits, horizontal write scaling means distributing data across multiple database nodes — each node owns a subset of the data.

**Vertical partitioning** (sometimes called functional partitioning): move different tables to different databases. User data on one cluster, product catalog on another, orders on a third. Each database handles a subset of the write workload. This is the least invasive approach — application code routes writes to the right database by domain, but each database is a standard, unsharded Postgres.

**Horizontal partitioning (sharding)**: split a single large table across multiple nodes by a shard key. Orders with user_id < 1,000,000 go to shard 1; orders with user_id >= 1,000,000 go to shard 2. Each shard is an independent database that knows nothing about the others.

## The shard key problem

Choosing a shard key is the most consequential decision in a sharded architecture. A bad shard key is nearly impossible to change later.

Good shard keys distribute writes evenly. Bad ones create hotspots: if you shard orders by `created_at` date, all writes today go to the "today" shard while old shards sit idle.

**Cross-shard queries**: sharding breaks any query that needs data from multiple shards. A `JOIN` between orders and users is trivial in a single database; in a sharded system it requires the application to query multiple shards and merge results. Reporting, aggregations, and analytics become dramatically harder.

## Managed alternatives to DIY sharding

**Amazon Aurora**: Postgres/MySQL-compatible with a custom distributed storage layer. Supports up to 128 TB and separates read/write scaling. Not true multi-primary sharding, but handles far larger workloads than standard RDS.

**CockroachDB / Google Spanner**: distributed SQL databases that handle sharding transparently. Writes scale across nodes; you still write standard SQL; cross-shard queries work. The trade-off is higher latency for strongly-consistent operations.

For most applications at realistic scale, exhausting caching and connection pooling, combined with Aurora for its extended storage ceiling, is the right path. Reserve manual sharding for the small number of workloads that genuinely need it.

<!-- RESOURCES -->

- [Designing Data-Intensive Applications - Ch. 6 (Partitioning)](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) -- type: book, time: 1h
- [Amazon Aurora Overview](https://aws.amazon.com/rds/aurora/) -- type: article, time: 15m
- [CockroachDB - How It Works](https://www.cockroachlabs.com/docs/stable/architecture/overview.html) -- type: docs, time: 20m
- [Instagram Sharding at Scale (engineering blog)](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c) -- type: article, time: 10m
