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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
