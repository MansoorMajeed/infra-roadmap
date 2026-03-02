---
id: application-caching
title: Application Caching with Memcache
zone: scaling
edges:
  to:
    - id: cache-aside-pattern
      question: How exactly does my app code use Memcache? What's the pattern?
      detail: >-
        I have Memcache running but I'm not confident my code is using it
        correctly. Do I check the cache before every query? What happens on a
        miss? How long should I keep things cached before they go stale? I feel
        like I'm winging it and I'll regret it later.
    - id: cache-invalidation
      question: >-
        What happens when the underlying data changes? How do I keep the cache
        consistent?
      detail: >-
        We updated a product price and users were still seeing the old one for
        minutes. I flushed the cache to fix it, but that tanked the database
        immediately. I don't have a good mental model for how to keep cached
        data in sync when the source changes — and I'm worried it's going to
        bite us again.
    - id: reverse-proxy-caching
      question: Object caching requires instrumenting every query in my code. But a lot of traffic is for the exact same pages — can I cache full HTTP responses without touching application code?
      detail: >-
        Memcache requires me to touch every database call manually — it's not
        a small refactor, I have to instrument every query I want cached. But
        the homepage and top category pages are almost identical for every
        visitor and get hit thousands of times a minute. It feels wrong to run
        all of that through my Python processes when the response barely ever
        changes.
    - id: browser-caching
      question: My servers are still sending the same images, CSS, and JS on every single request. Can the browser just keep those?
      detail: >-
        Every page load fetches the same logo, stylesheet, and JavaScript bundle
        — even if nothing has changed since yesterday. There has to be a way to
        tell the browser it already has these and doesn't need to download them
        again.
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

The database is where most web applications hit their first serious performance wall. Every product listing page runs a query. Every product detail page runs a query. If the same 100 products appear on the homepage and are requested by thousands of users per minute, the database answers the same query thousands of times with the same result. Application caching breaks this pattern by keeping hot data in memory so the database never gets asked the same question twice.

<!-- DEEP_DIVE -->

## What Memcache is

Memcache (specifically the Memcached daemon) is a simple, extremely fast in-memory key-value store. It stores arbitrary data keyed by a string — product listings, user profiles, rendered HTML fragments, whatever you want — entirely in RAM. A Memcache read is typically under 1 millisecond versus tens of milliseconds for a database query. It has no persistence and no disk I/O — everything lives in memory.

AWS offers Memcached as ElastiCache for Memcached. GCP has Memorystore for Memcached. Both are managed: you pick a node type, click create, and get a host:port to connect to.

## Object caching in practice

The pattern is: check cache first, fall back to the database on a miss, populate the cache for next time. For a product listing:

```python
cache_key = "product_list_page_1"
result = memcache_client.get(cache_key)

if result is None:
    result = db.query("SELECT * FROM products ORDER BY id LIMIT 20")
    memcache_client.set(cache_key, result, expire=300)  # cache for 5 minutes

return result
```

This is the cache-aside pattern, covered in its own node. The main decision here is how long to cache things (the TTL — time-to-live). Product listings that change infrequently can be cached for minutes. User-specific data like cart contents should not be cached this way at all.

## What to cache and what not to

Good candidates for object caching:
- Product listings and detail pages (same data for all users, changes infrequently)
- Category trees, navigation menus
- Expensive aggregation queries (total orders by day, top products)
- External API responses you don't want to hammer

Bad candidates:
- User-specific data (cart, order history) — each user needs different data, cache hit rate will be low
- Frequently mutating data — you'll spend as much time invalidating as you save
- Data that must be real-time (live inventory, auction prices)

## Measuring the impact

Before adding caching, measure your database query latency and throughput. After adding caching, look at:
- **Hit rate**: percentage of cache lookups that find data. Below 80% usually means you're caching the wrong things or TTLs are too short.
- **Database query rate**: should drop significantly for cached queries
- **p99 response time for cached endpoints**: should drop from tens of ms to single-digit ms

ElastiCache provides CloudWatch metrics for cache hits and misses out of the box.

## Memcache vs Redis for object caching

Memcache is simpler and faster for pure object caching. Redis supports richer data structures (sorted sets, hashes, pub/sub) and has persistence options. If you're already running Redis for sessions, using Redis for caching too reduces operational complexity. If you want maximum caching throughput and simplicity, dedicated Memcache nodes are slightly faster.

<!-- RESOURCES -->

- [AWS ElastiCache for Memcached](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/WhatIs.html) -- type: docs, time: 15m
- [pymemcache Python Client](https://pymemcache.readthedocs.io/) -- type: docs, time: 10m
- [Caching Best Practices - AWS](https://aws.amazon.com/caching/best-practices/) -- type: article, time: 20m
