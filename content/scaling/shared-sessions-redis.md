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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
