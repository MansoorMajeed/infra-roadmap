---
id: shared-sessions-redis
title: Shared Sessions with Redis
zone: scaling
edges:
  to:
    - id: auto-scaling-groups
      question: >-
        Sessions are in Redis. My app servers are now truly stateless. How do I
        auto-scale them?
      detail: >-
        With sessions out of the app servers, every server is identical and
        replaceable. AWS can spin up new instances and tear down old ones
        without losing user state. That's the prerequisite for Auto Scaling
        Groups to actually work.
    - id: jwt-and-cookie-sessions
      question: >-
        Wait — do I even need server-side sessions? What about JWT or signed
        cookies?
      detail: >-
        I've been assuming I need a session store, but I've seen other apps use
        tokens that just live in the browser with no server involved. How is
        that different, and should I be doing that instead?
difficulty: 2
tags:
  - redis
  - sessions
  - stateless
  - elasticache
  - memorystore
  - scaling
  - gcp
  - aws
category: practice
milestones:
  - 'Add Redis to your stack (ElastiCache on AWS, Memorystore on GCP)'
  - Configure your Python app to store sessions in Redis instead of on disk
  - Verify that two app servers share the same sessions correctly
  - Confirm the app works when one server is killed mid-session
---

The session problem goes away completely when session data lives outside the application servers. Any server can handle any request, because the session data isn't on the server — it's in a shared Redis instance that all servers can reach. This is the standard solution for horizontally scaled web applications.

<!-- DEEP_DIVE -->

## Why Redis for sessions

Redis is a fast, in-memory key-value store. Sessions are a natural fit: a session is a key (the session ID from the cookie) mapping to a value (the session data). Redis reads and writes are typically sub-millisecond, so adding a Redis lookup on every request doesn't noticeably add latency. Redis also supports TTL on keys, so sessions automatically expire without any cleanup logic in your app.

The other common options are storing sessions in the database (works fine, but slower than Redis and adds more query load) or in Memcached (also works, but Memcached doesn't persist to disk, so sessions are lost if the cache restarts).

## Setting it up

On AWS, use ElastiCache (managed Redis). On GCP, use Memorystore. On a bare VM or in Docker, run `redis-server` directly.

The application change is small. In Python with Flask-Session:

```python
from flask import Flask
from flask_session import Session

app = Flask(__name__)
app.config["SESSION_TYPE"] = "redis"
app.config["SESSION_REDIS"] = redis.from_url("redis://your-redis-host:6379")
Session(app)
```

After this change, every call to `session["user_id"] = 123` writes to Redis, and every session read fetches from Redis. The server itself stores nothing about individual users.

## What this gives you

With sessions in Redis, your app servers are now genuinely stateless. Any server can handle any request, because they all read from and write to the same session store. The load balancer can route requests anywhere — round robin, least connections, it doesn't matter. You can spin up new servers at any time and they immediately serve traffic including existing sessions. You can kill any server without logging out any users.

This is the prerequisite for Auto Scaling Groups to work correctly. An ASG can spin up new instances during a traffic spike and kill them when traffic drops — but this only works if those instances can pick up sessions that started on other instances.

## Redis availability

One Redis instance is now a single point of failure for all your sessions. If it goes down, every user is logged out simultaneously. In production, run Redis with replication:

- **ElastiCache cluster mode disabled with replica**: one primary + one or more read replicas, automatic failover in minutes
- **ElastiCache cluster mode enabled**: data sharded across multiple primaries, each with replicas — more complex but needed for very large session stores

For most apps, a single ElastiCache instance with one replica (Multi-AZ enabled) is the right starting point. Sessions that were in-flight during a failover will be lost, but automatic failover takes 1-2 minutes and only loses sessions that were active at that moment.

<!-- RESOURCES -->

- [Flask-Session Documentation](https://flask-session.readthedocs.io/) -- type: docs, time: 15m
- [AWS ElastiCache for Redis](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html) -- type: docs, time: 20m
- [Redis Persistence and High Availability](https://redis.io/docs/management/replication/) -- type: docs, time: 15m
