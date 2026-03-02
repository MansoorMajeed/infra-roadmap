---
id: rate-limiting
title: Rate Limiting
zone: scaling
edges:
  to:
    - id: api-gateway
      question: Rate limiting is protecting the API. But I keep implementing the same auth, routing, and throttling logic in every service — is there a better way?
      detail: >-
        Every new service I build has the same cross-cutting concerns: check
        the token, enforce rate limits, route the request, log it. It's
        duplicated in every repo. I've heard there's something that sits in
        front of everything and handles this centrally — what is it?
difficulty: 2
tags:
  - rate-limiting
  - throttling
  - api
  - protection
  - nginx
  - token-bucket
  - leaky-bucket
  - redis
category: concept
milestones:
  - Explain the difference between a token bucket and a leaky bucket
  - Implement rate limiting at the Nginx level
  - Understand per-IP vs per-user vs per-API-key limits
  - Know what a 429 response is and what Retry-After communicates
  - Explain the thundering herd problem and how rate limits help
  - Know how Redis enables distributed rate limiting across multiple servers
---

A load balancer distributes legitimate traffic efficiently. But it distributes malicious traffic equally well. Bots scraping your product catalog, API clients in retry loops with exponential-backoff disabled, or a single user hammering your search endpoint thousands of times per minute — all of these get routed to your servers and count against your capacity. Rate limiting throttles clients before they overwhelm your backend.

<!-- DEEP_DIVE -->

## What rate limiting does

Rate limiting enforces a maximum request rate per client — per IP address, per API key, per authenticated user, or some combination. When a client exceeds the limit, the server returns `429 Too Many Requests` with a `Retry-After` header indicating when they can try again.

Clients who stay within limits are unaffected. Clients who exceed limits are throttled. The legitimate majority of your users are protected from the bad behavior of a few.

## Token bucket and leaky bucket

Two classic algorithms for rate limiting:

**Token bucket**: a bucket holds up to N tokens. Tokens refill at a fixed rate. Each request consumes one token. If the bucket is empty, the request is rejected. This allows short bursts (if the bucket is full) while enforcing an average rate over time.

**Leaky bucket**: requests enter a queue (the bucket). The queue drains at a fixed rate — one request processed every X milliseconds. If the queue is full, new requests are rejected. This enforces a strict constant output rate with no bursting.

Token bucket is more common for API rate limiting because it allows bursting, which is friendlier to legitimate clients that might make a few quick requests in succession.

## Implementing rate limiting in Nginx

Nginx has built-in rate limiting with `limit_req`:

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            limit_req_status 429;
            proxy_pass http://backend;
        }
    }
}
```

This limits each IP to 10 requests/second, allows a burst of 20, and returns 429 when exceeded. `$binary_remote_addr` is the client IP. This state is stored in shared memory (`zone=api:10m` — 10 MB, enough for ~160,000 IPs).

## Per-user limits in distributed systems

IP-based limiting works for unauthenticated traffic but breaks down in several ways:
- Legitimate users behind a NAT (corporate network, VPN) all share one IP
- API clients rotate IPs
- Authenticated users should have their own limit regardless of IP

For per-user or per-API-key rate limiting across multiple servers, the limit state needs to be shared. Redis is the standard solution: increment a counter key per user per time window, and check whether it exceeds the limit. Multiple servers share the same Redis counter.

```python
def is_rate_limited(user_id):
    key = f"rate:user:{user_id}:{int(time.time() // 60)}"  # per-minute window
    count = redis.incr(key)
    redis.expire(key, 120)  # expire after 2 windows
    return count > 100  # 100 requests per minute limit
```

## Responding correctly

A proper rate limit response:
- HTTP status `429 Too Many Requests`
- `Retry-After: 30` header (seconds until they can try again, or an HTTP-date)
- `X-RateLimit-Limit: 100` — their limit
- `X-RateLimit-Remaining: 0` — requests left in this window
- `X-RateLimit-Reset: 1680000000` — Unix timestamp when the window resets

Good clients (and yours should be one) respect `Retry-After` and back off automatically. Bad clients ignore it — they're the ones the rate limit is designed to stop anyway.

## The thundering herd problem

When many clients hit a rate limit simultaneously and all receive the same `Retry-After` value, they all retry at exactly the same time — causing another spike. Add jitter: randomize the `Retry-After` value by a few seconds so retries are spread out.

<!-- RESOURCES -->

- [Nginx Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/) -- type: article, time: 15m
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiting/) -- type: docs, time: 10m
- [HTTP 429 - IANA](https://httpwg.org/specs/rfc6585.html#status-429) -- type: article, time: 5m
- [An Introduction to Rate Limiting - Stripe Engineering](https://stripe.com/blog/rate-limiters) -- type: article, time: 15m
