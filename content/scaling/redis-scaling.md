---
id: redis-scaling
title: Scaling Redis
zone: scaling
edges:
  to:
    - id: connection-pooling
      question: Redis is clustered and stable. Now the database is complaining — every app server is maintaining its own connection pool and I'm hitting the connection limit.
      detail: >-
        Fixing Redis took the session pressure off. But now I have a fleet of
        app servers and each one maintains its own persistent connection pool
        to the database. The connection count grows faster than the load, and
        I keep hitting Postgres's hard max_connections ceiling.
difficulty: 2
tags:
  - redis
  - redis-cluster
  - elasticache
  - memorystore
  - gcp
  - aws
  - high-availability
  - scaling
category: practice
milestones:
  - Understand why a single Redis node has memory and throughput limits
  - Set up an ElastiCache Redis Cluster (AWS) or Memorystore cluster (GCP)
  - Understand how Redis Cluster shards data across nodes
  - Understand what happens to sessions when a Redis node fails
  - Know the difference between Redis Cluster and Redis Sentinel
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
