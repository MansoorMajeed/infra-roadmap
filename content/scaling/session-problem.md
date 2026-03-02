---
id: session-problem
title: The Session Problem
zone: scaling
edges:
  to:
    - id: shared-sessions-redis
      question: >-
        The right fix is to move sessions somewhere both servers can read. What
        does that look like?
      detail: >-
        If sessions live on a specific server, that server has to handle every
        request for that user. The real fix is to move session storage out of
        the server entirely — into a shared store that any server can read and
        write. Redis is the standard answer.
    - id: sticky-sessions-the-trap
      question: Can't I just send each user to the same server every time?
      detail: >-
        I mean, the simplest fix seems like just keeping each user on the same
        server, right? Why doesn't that work long-term?
difficulty: 1
tags:
  - sessions
  - stateless
  - load-balancer
  - sticky-sessions
  - scaling
category: concept
milestones:
  - Explain why sessions break when you add a load balancer
  - Identify where your app currently stores session data
  - Understand what 'stateless' means in the context of a web app
---

Web sessions let your app remember who a user is across multiple requests. But the way most apps store sessions by default — in files or memory on the server — breaks completely when you add a load balancer. This is one of the first things that goes wrong when people add horizontal scaling without thinking about state.

<!-- DEEP_DIVE -->

## How sessions work

When a user logs in, the server creates a session: a small data structure that records who this user is and what they're allowed to do. The server generates a random session ID, stores the session data somewhere keyed by that ID, and sends the ID to the browser as a cookie. On every subsequent request, the browser sends the cookie back, the server looks up the session by ID, and knows who the user is.

The critical question: **where does the server store the session data?**

By default, most web frameworks store sessions on the local filesystem or in memory. Flask, for example, has a server-side session extension that defaults to the filesystem. Django stores sessions in the database by default, which is actually fine for scaling — but many apps are configured to use the local filesystem for performance reasons.

## Why this breaks with a load balancer

When you have one server, local session storage works. Every request hits the same server, which has all the session data.

When you have two servers behind a load balancer, a user might log in on Server A (creating a session file on Server A's filesystem), and then their next request gets routed to Server B (which has no such file). From Server B's perspective, the session doesn't exist. The user appears logged out.

This is exactly what users experience: they log in, browse a few pages, and suddenly they're logged out. Or they add items to their cart and the items disappear. The underlying cause is always the same — their next request landed on a different server than the one that stored their session.

## The stateless requirement

This is the concrete, practical version of the "applications must be stateless" requirement from the horizontal scaling node. "Stateless" doesn't mean your app has no data — it means no unique data is stored *locally on the application server*. Session data needs to live somewhere every server can reach.

There are two main approaches:
1. **Shared session store**: move session data to a shared external system (Redis, database) that every app server reads and writes
2. **Client-side sessions**: encode the session data directly in the cookie (signed so it can't be tampered with) — there's nothing to look up on the server

Both solve the problem. The next nodes cover each approach.

<!-- RESOURCES -->

- [Flask-Session Documentation](https://flask-session.readthedocs.io/) -- type: docs, time: 10m
- [Django Sessions Framework](https://docs.djangoproject.com/en/stable/topics/http/sessions/) -- type: docs, time: 15m
- [The Twelve-Factor App - Backing Services](https://12factor.net/backing-services) -- type: article, time: 5m
