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
        Memcache requires me to wrap every database call manually. But the
        homepage, top category pages, and product listings are requested
        thousands of times a minute and almost never change. A layer that caches
        complete HTTP responses in front of the app would absorb all of that
        before it ever reaches my Python process.
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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
