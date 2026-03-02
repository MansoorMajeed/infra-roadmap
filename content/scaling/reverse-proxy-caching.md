---
id: reverse-proxy-caching
title: Reverse Proxy Caching
zone: scaling
edges:
  to: []
difficulty: 2
tags:
  - varnish
  - nginx
  - reverse-proxy
  - caching
  - http-cache
  - cache-control
  - performance
category: concept
milestones:
  - Explain what a reverse proxy cache is and how it differs from object caching
  - Know what Varnish is and what problem it solves
  - Explain how Nginx can act as a caching layer with proxy_cache
  - Know which responses can be cached by a reverse proxy (GET, public, correct headers)
  - Explain what a cache hit ratio is and how to measure it
  - Understand how Cache-Control headers determine what a proxy cache stores
---

Object caching requires instrumenting your application code — every database call that should be cached needs to be wrapped. Reverse proxy caching is a different layer: it sits in front of your application and caches complete HTTP responses. Popular pages that thousands of users request in sequence hit the cache instead of your Python process, without any changes to application code.

<!-- DEEP_DIVE -->

## How it works

A reverse proxy cache (Varnish, Nginx with proxy_cache, or a similar system) sits between the client and the backend application. When a cacheable response arrives, the proxy stores it. Subsequent requests for the same URL and cache key get the stored response served directly — the backend is never contacted.

For high-traffic, infrequently-changing pages — the homepage, top category pages, product listings — the cache hit rate can reach 95%+. Your Python processes go from handling thousands of requests per second to handling only uncacheable requests and cache misses.

## What can be cached by a reverse proxy

Only responses that are safe to serve to multiple users can be cached:
- `GET` requests only (not `POST`, `PUT`, `DELETE`)
- Responses with appropriate `Cache-Control` headers (`public`, `max-age`)
- Responses that are the same for all users (not logged-in user's dashboard, not cart pages)

Responses with `Cache-Control: private`, `Set-Cookie`, or `Authorization` headers should not be cached by a proxy — these are user-specific.

This means reverse proxy caching is most useful for the public-facing parts of your site. The logged-in, personalized experience still hits your application servers.

## Nginx as a caching proxy

Nginx can serve as a caching reverse proxy with `proxy_cache`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

server {
    location / {
        proxy_pass http://backend;
        proxy_cache my_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$host$request_uri";
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

The `X-Cache-Status` header tells you whether a response was a `HIT` or `MISS` — useful for debugging.

## Varnish Cache

Varnish is a purpose-built HTTP accelerator, faster than Nginx for caching workloads and much more configurable. Varnish's VCL (Varnish Configuration Language) lets you write complex caching logic: vary the cache key by cookie value, return different content for different user segments, do grace-mode serving of stale content while the backend re-fetches.

Varnish is overkill for most early-stage scaling scenarios, but it's the tool used by high-traffic publishers and e-commerce sites that need fine-grained control over caching behavior.

## Cache hit ratio

The **cache hit ratio** is the percentage of requests served from cache vs total requests. A ratio of 90% means only 10% of requests reach your backend. Monitor this metric — it tells you how effective your caching is. If it drops, either your TTLs are too short, you're seeing traffic for uncacheable URLs, or a deployment flushed the cache and it's warming up.

## Relationship to CDNs

A reverse proxy cache at the origin serves all traffic from a single location. A CDN (CloudFront, Fastly, Cloudflare) does the same thing but from edge locations worldwide. For global users, a CDN is a reverse proxy cache that also solves the geographic latency problem.

<!-- RESOURCES -->

- [Nginx Caching Guide](https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/) -- type: docs, time: 20m
- [Varnish Cache Documentation](https://varnish-cache.org/docs/) -- type: docs, time: 30m
- [HTTP Caching - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) -- type: article, time: 15m
