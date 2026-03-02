---
id: cache-aside-pattern
title: The Cache-Aside Pattern
zone: scaling
edges:
  to: []
difficulty: 2
tags:
  - cache-aside
  - lazy-loading
  - memcache
  - redis
  - caching-patterns
  - ttl
category: concept
milestones:
  - 'Implement cache-aside in Python: check cache → DB fallback → populate cache'
  - Understand what a cache hit and a cache miss look like in practice
  - Explain what TTL (time-to-live) is and how to choose an appropriate value
  - Know what happens to stale data when the source changes before TTL expires
---

Cache-aside (also called lazy loading) is the most common pattern for using a cache in application code. The cache doesn't do anything automatically — the application checks the cache, falls back to the database on a miss, and populates the cache itself. Understanding this pattern and getting the details right (key design, TTL, error handling) is most of what "using a cache correctly" means in practice.

<!-- DEEP_DIVE -->

## The pattern

Three steps, every time:

1. **Check the cache**: look up the cache key. If data is there (cache hit), return it immediately.
2. **Database fallback**: if the cache key is missing or expired (cache miss), fetch from the database.
3. **Populate the cache**: store the database result in the cache with a TTL, so the next request finds it.

```python
def get_product(product_id):
    key = f"product:{product_id}"

    # Step 1: check cache
    cached = cache.get(key)
    if cached is not None:
        return cached

    # Step 2: database fallback
    product = db.query("SELECT * FROM products WHERE id = %s", [product_id])

    # Step 3: populate cache
    cache.set(key, product, ttl=300)
    return product
```

## Cache key design

Cache keys need to be unique for each distinct result. Good key patterns:
- `product:{id}` — one entry per product
- `product_list:page:{page}:sort:{sort_by}` — one entry per distinct listing query
- `user:{id}:cart` — one entry per user's cart

Bad key patterns:
- `products` — too broad; maps to the whole table, hard to invalidate when one product changes
- `query:{raw_sql}` — keys become too long and include user-specific data that pollutes the cache

Namespace your keys (prefix with a category) to make batch invalidation easier and to avoid collisions when different parts of the app share a cache instance.

## Choosing a TTL

TTL is how long cached data is considered fresh before it expires and must be re-fetched. There's no universally right answer — it's a trade-off between freshness and cache effectiveness.

General guidelines:
- **High TTL (hours to days)**: data that rarely changes — product descriptions, category trees, static reference data
- **Medium TTL (minutes)**: product listings, prices (acceptable to be slightly stale)
- **Short TTL (seconds)**: anything you're not comfortable being stale but still want some caching benefit
- **No caching**: real-time data, user-specific highly mutable data (cart totals, live inventory)

When in doubt, start with a shorter TTL and increase it as you gain confidence in the data's stability.

## What cache misses cost

Every cache miss goes to the database. If your hit rate drops (e.g., after a cache restart, or because TTLs are too short), database load spikes. For a site that was previously getting 90% cache hits and seeing 10% of traffic hit the database, a cold cache suddenly means 10x more database queries. Design for this: keep TTLs long enough that most traffic hits cache, and be ready for cold-start load when you restart the cache or deploy a new version.

## Error handling

If the cache is unavailable, the application should fall back to the database and continue working (with degraded performance, not failure). Never let a cache outage become a site outage. Most cache client libraries have timeout settings — configure them to be short (50-100ms) so a slow cache doesn't block requests.

```python
try:
    cached = cache.get(key)
except CacheConnectionError:
    cached = None  # fall through to database
```

<!-- RESOURCES -->

- [Caching Patterns - AWS](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html) -- type: article, time: 15m
- [Redis - Caching Patterns](https://redis.io/docs/manual/patterns/) -- type: docs, time: 20m
