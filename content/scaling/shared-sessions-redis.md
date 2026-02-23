---
id: "shared-sessions-redis"
title: "Shared Sessions with Redis"
zone: "scaling"
edges:
  from:
    - id: "session-problem"
      question: "My users keep getting logged out. The real fix is shared session storage — what does that look like?"
      detail: "The root cause is that sessions live on one specific server. The fix is to move them somewhere all servers can reach: a shared Redis instance. Any server can read or write any user's session, so it doesn't matter which server handles the next request."
    - id: "sticky-sessions-the-trap"
      question: "Sticky sessions are a dead end. What's the right approach?"
      detail: "Instead of routing users to the right server, make it so any server can serve any user. That means externalizing all session state into a shared store — Redis is the standard choice for this."
  to:
    - id: "auto-scaling-groups"
      question: "Sessions are in Redis. My app servers are now truly stateless. How do I auto-scale them?"
      detail: "With sessions out of the app servers, every server is identical and replaceable. AWS can spin up new instances and tear down old ones without losing user state. That's the prerequisite for Auto Scaling Groups to actually work."
    - id: "jwt-and-cookie-sessions"
      question: "Wait — do I even need server-side sessions? What about JWT or signed cookies?"
      detail: "I've been assuming I need a session store, but I've seen other apps use tokens that just live in the browser with no server involved. How is that different, and should I be doing that instead?"
difficulty: 2
tags: ["redis", "sessions", "stateless", "elasticache", "memorystore", "scaling", "gcp", "aws"]
category: "practice"
milestones:
  - "Add Redis to your stack (ElastiCache on AWS, Memorystore on GCP)"
  - "Configure your Python app to store sessions in Redis instead of on disk"
  - "Verify that two app servers share the same sessions correctly"
  - "Confirm the app works when one server is killed mid-session"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
