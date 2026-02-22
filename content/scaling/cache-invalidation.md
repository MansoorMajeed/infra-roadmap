---
id: "cache-invalidation"
title: "Cache Invalidation: The Hard Problem"
zone: "scaling"
edges:
  from:
    - id: "application-caching"
      question: "The cache works great — but what happens when the underlying data changes? How do I keep the cache fresh?"
      detail: "Caching is easy to add, but keeping the cache consistent with the database is where things get complicated. There's a famous saying in computer science: 'There are only two hard things: cache invalidation and naming things.' This node is about the first one."
  to: []
difficulty: 3
tags: ["cache-invalidation", "ttl", "consistency", "memcache", "redis", "stale-data", "caching"]
category: "concept"
milestones:
  - "Understand the difference between TTL-based expiry and active invalidation"
  - "Explain what 'stale data' means and when it's acceptable vs a real problem"
  - "Implement event-driven cache invalidation: clear the cache key on write"
  - "Understand the cache stampede problem and one way to mitigate it"
  - "Know the trade-off between consistency and cache effectiveness"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
