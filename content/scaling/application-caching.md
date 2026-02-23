---
id: application-caching
title: Application Caching with Memcache
zone: scaling
edges:
  to:
    - id: vm-scaling-pain-points
      question: >-
        The stack is solid. App, sessions, database, cache — LocalMart handles
        serious traffic. What's still painful?
      detail: >-
        I've added horizontal scaling, sessions, and caching — the stack handles
        real traffic now. But I keep running into the same categories of pain.
        Provisioning new VMs is slow. Configuration drift keeps creeping in.
        Something always needs manual intervention. Are these fundamental VM
        problems, or am I just doing it wrong?
    - id: cache-aside-pattern
      question: How exactly does my app code use Memcache? What's the pattern?
      detail: >-
        The mechanics of using a cache correctly have a name: cache-aside (or
        lazy loading). Check the cache first, fall back to the database on a
        miss, populate the cache for next time. Getting this right — including
        TTLs — is where most of the nuance lives.
    - id: cache-invalidation
      question: >-
        What happens when the underlying data changes? How do I keep the cache
        consistent?
      detail: >-
        Adding a cache is easy. Keeping it fresh is where things get hard. If a
        product price changes in MySQL but the old price is still in Memcache,
        users see stale data. Cache invalidation is one of the genuinely hard
        problems in distributed systems.
difficulty: 2
tags:
  - memcache
  - memcached
  - caching
  - elasticache
  - memorystore
  - gcp
  - aws
  - object-cache
  - performance
category: practice
milestones:
  - Set up ElastiCache Memcached (AWS) or Memorystore Memcached (GCP)
  - Implement cache-aside for product listing and product detail pages
  - Measure the latency difference between a cache hit and a cache miss
  - Set appropriate TTLs for different types of data
  - Understand when to use Memcache vs Redis for object caching
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
