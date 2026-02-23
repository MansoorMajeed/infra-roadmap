---
id: caching-and-redis
title: Caching & Redis
zone: building
edges:
  to:
    - id: it-works-on-my-laptop
      question: My app is fast and data-aware. Time to get it off my laptop.
      detail: >-
        My app works locally with the database and cache all running on my
        machine. But I have no idea how to make those three separate services
        work together on a real server. How do they find each other, and how do
        I actually get this running somewhere else?
difficulty: 2
tags:
  - caching
  - redis
  - memcached
  - performance
  - in-memory
category: concept
milestones:
  - 'Understand cache hit, cache miss, and TTL'
  - Set up Redis locally and use it to cache database queries
  - Identify what data in your application is worth caching
---

Your app has a product catalog page. Every time someone visits it, the app queries the database, fetches the same 200 products, serializes them to JSON, and sends them to the browser. The products barely change — maybe once a day. But the database does all that work for every single visitor, every single page load. Caching means storing that result somewhere fast (memory) so you only do the expensive work once.

<!-- DEEP_DIVE -->

**Caching** is storing the result of an expensive operation so you can reuse it. Instead of querying the database every time, you check the cache first. If the data is there (a **cache hit**), you return it instantly. If not (a **cache miss**), you query the database, store the result in the cache, and return it. Future requests get the cached version.

```python
import redis
import json

r = redis.Redis(host="localhost", port=6379)

def get_products():
    # Check cache first
    cached = r.get("products")
    if cached:
        print("Cache hit!")
        return json.loads(cached)

    # Cache miss — query database
    print("Cache miss, querying database...")
    products = db.query("SELECT * FROM products")

    # Store in cache for 5 minutes (300 seconds)
    r.setex("products", 300, json.dumps(products))
    return products
```

**Redis** is the most popular caching tool. It is an in-memory data store — all data lives in RAM, which is why it is fast. A database query might take 5-50 milliseconds. A Redis lookup takes 0.1-0.5 milliseconds. That difference adds up fast when you have thousands of users.

Redis is more than just a key-value cache. It supports multiple data structures:

```bash
# Strings — basic key-value
SET user:1:name "Alice"
GET user:1:name

# Hashes — like a mini dictionary per key
HSET user:1 name "Alice" email "alice@example.com" plan "premium"
HGET user:1 name

# Lists — ordered collections
LPUSH notifications:user:1 "New order received"
LRANGE notifications:user:1 0 -1

# Sets — unique collections
SADD online_users "alice" "bob" "charlie"
SISMEMBER online_users "alice"  # returns 1 (true)

# Sorted sets — ranked data
ZADD leaderboard 100 "alice" 85 "bob" 92 "charlie"
ZREVRANGE leaderboard 0 2  # top 3 scores
```

**TTL (Time To Live)** controls how long cached data stays valid. Set it too short and you hit the database too often. Set it too long and users see stale data. The right TTL depends on how often the data changes and how much staleness is acceptable:

- Product catalog: 5-15 minutes (changes rarely)
- User session data: 30 minutes (moderate)
- Real-time stock prices: 1-5 seconds (changes constantly)

**Cache invalidation** is famously one of the two hard problems in computer science. When the underlying data changes, you need to update or delete the cached version. The simplest approach: when you write to the database, delete the relevant cache key. The next read will trigger a cache miss and refresh the data.

```python
def update_product(product_id, new_data):
    db.execute("UPDATE products SET ... WHERE id = ?", product_id)
    # Invalidate the cache
    r.delete("products")
    r.delete(f"product:{product_id}")
```

**Memcached** is the other major caching tool. It is simpler than Redis — just key-value strings with TTL. No fancy data structures, no persistence, no clustering built-in. It is slightly faster than Redis for simple get/set operations, but Redis has largely taken over because of its versatility.

**What to cache** (and what not to):

- **Cache:** Data that is read often and written rarely (product listings, user profiles, configuration)
- **Cache:** Results of expensive computations (aggregated reports, search results)
- **Don't cache:** Data that must always be fresh (account balances, inventory counts for checkout)
- **Don't cache:** Data that is unique per request (personalized content with no shared patterns)

**Why SREs care:** Caching is one of the most common performance optimization tools. Redis going down can cascade into a thundering herd — every request suddenly hits the database, overwhelming it. Understanding cache behavior, monitoring hit rates, and planning for cache failures is core SRE work.

<!-- RESOURCES -->

- [Redis Documentation](https://redis.io/docs/) -- type: reference, time: varies
- [Try Redis (interactive tutorial)](https://try.redis.io/) -- type: interactive, time: 30m
- [Caching Strategies and How to Choose the Right One](https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/) -- type: article, time: 20m
- [Redis University (free)](https://university.redis.io/) -- type: course, time: varies
