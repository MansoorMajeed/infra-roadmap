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

A single Redis node handles millions of operations per second and stores data entirely in memory. For most applications, a single node with a replica is sufficient for years. But Redis is in-memory — there's a hard memory ceiling on any single machine. And a single Redis node with no replica is a single point of failure. When your session store or cache goes down, every user on the site is affected immediately.

<!-- DEEP_DIVE -->

## Why a single Redis node is eventually not enough

**Memory**: Redis is bounded by the RAM of the instance. A single `cache.r7g.large` ElastiCache node has 13 GB of memory. If your session store and application cache together need more than that — or if you want memory headroom to avoid eviction — you need to either upgrade to a larger instance or distribute data across multiple nodes.

**Throughput**: a single Redis node can handle hundreds of thousands of operations per second. This is a very high ceiling — most applications never hit it. But if you're caching every database result and handling millions of requests per minute, you can get there.

**Availability**: a single Redis node with no replica is a single point of failure. When it restarts (for maintenance, a crash, or an AZ event), your session store disappears. Every user on the site is logged out simultaneously. Your cache is empty, flooding the database.

## Redis replication: primary + replica

The simplest reliability improvement is a single replica with automatic failover. ElastiCache calls this "cluster mode disabled with replication" — one primary plus one or more read replicas in different AZs, with automatic failover.

If the primary fails, ElastiCache promotes a replica to primary and updates the configuration endpoint within minutes. Sessions that were active during the failover are lost (the primary's recent writes that hadn't replicated yet), but the store recovers automatically.

This is the right starting point for most production workloads.

## Redis Cluster: sharding across nodes

When you need more memory than one node provides, Redis Cluster distributes data across multiple primary nodes. Each primary owns a range of hash slots (Redis divides the keyspace into 16,384 slots). A key is deterministically assigned to a slot based on its name, and thus to a specific primary.

ElastiCache cluster mode enabled supports Redis Cluster. You specify how many shards (primaries) you want and how many replicas per shard. Data is automatically distributed. If one shard fails, its replica takes over.

The trade-off: Redis Cluster doesn't support multi-key operations across shards. Commands like `MGET` with keys on different shards fail. Lua scripts and transactions that touch multiple keys work only if all the keys hash to the same slot (use hash tags: `{user:123}:session` and `{user:123}:cart` both hash to the slot for `user:123`).

## Redis Sentinel

Redis Sentinel is an alternative high-availability approach for non-clustered Redis: a set of Sentinel processes monitors the primary and replicas, detects failures, and performs automatic failover without the application needing Redis Cluster. Sentinel is useful for self-managed Redis deployments. With ElastiCache, the managed service handles this — you don't configure Sentinel yourself.

## When to start worrying about scaling Redis

For session storage: the memory footprint per session is small (a few hundred bytes to a few KB). An `r7g.medium` with 6 GB can hold millions of sessions. You need to scale before you hit memory, not after — watch the `BytesUsedForCache` CloudWatch metric.

For application caching: monitor `CacheHits`, `CacheMisses`, and `Evictions`. When evictions start occurring frequently, Redis is running low on memory and evicting old keys to make room for new ones. Increase the instance size or add shards before this degrades your database hit rate.

<!-- RESOURCES -->

- [Redis Cluster Specification](https://redis.io/docs/reference/cluster-spec/) -- type: docs, time: 30m
- [AWS ElastiCache - Choosing Between Cluster Mode On and Off](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/Replication.Redis-RedisCluster.html) -- type: docs, time: 15m
- [Redis Sentinel Documentation](https://redis.io/docs/management/sentinel/) -- type: docs, time: 20m
