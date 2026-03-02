---
id: cache-invalidation
title: 'Cache Invalidation: The Hard Problem'
zone: scaling
edges:
  to: []
difficulty: 3
tags:
  - cache-invalidation
  - ttl
  - consistency
  - memcache
  - redis
  - stale-data
  - caching
category: concept
milestones:
  - Understand the difference between TTL-based expiry and active invalidation
  - Explain what 'stale data' means and when it's acceptable vs a real problem
  - 'Implement event-driven cache invalidation: clear the cache key on write'
  - Understand the cache stampede problem and one way to mitigate it
  - Know the trade-off between consistency and cache effectiveness
---

Phil Karlton's famous quote — "there are only two hard things in computer science: cache invalidation and naming things" — is overused but accurate. Keeping a cache consistent with its source of truth is genuinely difficult. When do you update it? What if the update fails? What if ten servers all miss the cache at once? This node covers the main strategies and the failure modes.

<!-- DEEP_DIVE -->

## The consistency problem

A cache is a copy of data. The source of truth is the database. The moment you cache something, the copy and the source can diverge: someone updates the product price in the database, but the old price is still in the cache. Users see stale data.

TTL-based expiry handles this eventually: after the TTL expires, the cache fetches fresh data. But "eventually" might be 5 minutes, or an hour, depending on your TTL. For a price update, 5 minutes of incorrect prices could mean real money.

## Strategy 1: TTL-only (passive invalidation)

Set a TTL and let data expire naturally. The simplest approach. Suitable for data where being slightly stale is acceptable — product descriptions, category trees, marketing content.

The problem: staleness windows are fixed. If your TTL is 10 minutes and someone updates a price, some users see the wrong price for up to 10 minutes. You can't shorten this without increasing database load.

## Strategy 2: Write-through invalidation (active invalidation)

When data changes, immediately delete or update the cache entry.

```python
def update_product_price(product_id, new_price):
    db.execute("UPDATE products SET price = %s WHERE id = %s", [new_price, product_id])
    cache.delete(f"product:{product_id}")  # invalidate immediately
```

The next request for that product is a cache miss, fetches fresh data from the database, and repopulates the cache. This keeps the cache much more consistent.

**The problem: cache stampede.** If you have a very popular item — say the homepage featured product — and you invalidate it, hundreds of simultaneous requests all miss the cache at once. They all go to the database simultaneously to fetch the same row. This can spike database load dramatically right at the moment when a popular item was just updated (which is often a high-traffic moment).

## Mitigating cache stampedes

**Probabilistic early expiration**: before the TTL actually expires, start occasionally fetching a fresh value. When a cache hit occurs, with some small probability, treat it as a miss and refresh in the background. This staggers refreshes instead of having them all happen simultaneously.

**Mutex/lock on cache miss**: when a cache miss occurs, only one process fetches from the database. Others wait briefly and retry. If the cache is populated by the time they retry, they get a cache hit. If not, they fall through to the database too.

```python
def get_product(product_id):
    key = f"product:{product_id}"
    cached = cache.get(key)
    if cached:
        return cached

    # Try to acquire a lock
    lock_key = f"lock:{key}"
    if cache.add(lock_key, "1", ttl=5):  # atomic: only one writer wins
        product = db.query(...)
        cache.set(key, product, ttl=300)
        cache.delete(lock_key)
    else:
        # Another process is fetching, wait and retry
        time.sleep(0.05)
        product = cache.get(key) or db.query(...)

    return product
```

## Strategy 3: event-driven invalidation

For complex applications, a write to the database publishes an event (to a queue, a pub/sub system, or a webhook). Cache invalidation logic subscribes to these events and clears the relevant cache keys. This decouples invalidation from the write path and works well when the same data is cached in multiple keys or across multiple cache instances.

## The consistency trade-off

No caching strategy achieves perfect consistency at zero cost. The choice is always: how stale is acceptable, and how much database load can you afford on invalidation? Most production systems use TTL-based invalidation for data that can be slightly stale, combined with active invalidation for data where freshness matters (prices, inventory counts, user-specific data).

<!-- RESOURCES -->

- [Caching Strategies - AWS Database Blog](https://aws.amazon.com/blogs/database/database-caching-strategies-using-redis/) -- type: article, time: 20m
- [Cache Stampede Problem - Redis Documentation](https://redis.io/docs/manual/patterns/distributed-locks/) -- type: docs, time: 15m
- [Designing Data-Intensive Applications - Ch. 5 (Replication, eventual consistency)](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) -- type: book, time: 45m
