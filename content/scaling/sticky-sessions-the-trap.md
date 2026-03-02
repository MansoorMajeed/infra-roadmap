---
id: sticky-sessions-the-trap
title: 'Sticky Sessions: The Trap'
zone: scaling
edges:
  to:
    - id: shared-sessions-redis
      question: 'OK, sticky sessions are a dead end. What''s the right solution?'
      detail: >-
        The right fix is to stop storing sessions on the server altogether. Move
        session state to a shared external store — then any server can handle
        any request, and you have true horizontal scalability.
difficulty: 1
tags:
  - sticky-sessions
  - session-affinity
  - load-balancer
  - anti-pattern
  - scaling
category: concept
milestones:
  - Explain what sticky sessions are and how they work
  - Describe why sticky sessions break when a server dies
  - Explain why sticky sessions undermine the benefits of horizontal scaling
  - Understand why this is an anti-pattern for stateless scaling
---

Sticky sessions (also called session affinity) seem like an obvious fix to the session problem: if user requests always go to the same server, the session data on that server is always found. It works, but it creates new problems that are worse than the one it solves.

<!-- DEEP_DIVE -->

## How sticky sessions work

A load balancer implementing sticky sessions tracks which server each user has been assigned to, and always routes that user's requests to that server. The mechanism is usually a cookie: on the first request, the load balancer sets a cookie (like `AWSALB` on AWS ALBs) recording which backend was chosen. On every subsequent request, the load balancer reads this cookie and sends the request to the same backend.

As long as that server is running, the session problem appears solved.

## Why it's a trap

### The server dies

The most obvious failure: the server a user is "stuck to" goes down. Their next request hits the load balancer, which looks for the server named in their affinity cookie — and that server is gone. The load balancer has to pick a new server, which has no session data. The user is logged out.

With sticky sessions, a single server failure logs out every user who was pinned to it simultaneously. Instead of graceful degradation you get a sudden wave of logged-out users and a customer support flood.

### Uneven load distribution

One of the main benefits of a load balancer is distributing load evenly. Sticky sessions break this. If a small number of users happen to do very heavy work (large file uploads, complex search queries, long-running operations), those requests all pile up on whatever servers those users are pinned to. Other servers might be idle while two servers are at 100% CPU — and the load balancer can't rebalance because it's committed to the stickiness guarantee.

### Can't drain servers for deployment

Rolling deployments work by taking servers out of rotation one at a time, deploying new code, and putting them back. But with sticky sessions, "taking a server out of rotation" means all the users pinned to it get redirected and lose their sessions. You either break sessions on every deployment or you have to keep old servers running until their sessions naturally expire.

### Capacity isn't actually horizontal

With true stateless horizontal scaling, you can spin up new servers and immediately get capacity. With sticky sessions, new servers don't help existing users — they only help users who haven't been assigned a server yet. Your ability to respond to a traffic spike by adding capacity is seriously degraded.

## The bottom line

Sticky sessions are a band-aid that papers over a session architecture problem. They work well enough in low-stakes setups where you're adding a second server "just in case" and reliability isn't critical. But they don't give you real horizontal scaling, and they make your availability story worse in the scenarios that matter most (server failures).

The right fix is to make sessions genuinely shared: move them to Redis so any server can handle any request.

<!-- RESOURCES -->

- [AWS ALB Sticky Sessions Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html) -- type: docs, time: 10m
- [Session Management Anti-Patterns - OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) -- type: article, time: 20m
