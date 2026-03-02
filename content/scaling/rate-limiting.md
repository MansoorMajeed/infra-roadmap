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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
