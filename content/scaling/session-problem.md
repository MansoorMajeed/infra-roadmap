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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
