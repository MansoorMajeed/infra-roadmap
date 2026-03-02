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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
