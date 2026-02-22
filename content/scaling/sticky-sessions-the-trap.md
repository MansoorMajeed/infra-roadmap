---
id: "sticky-sessions-the-trap"
title: "Sticky Sessions: The Trap"
zone: "scaling"
edges:
  from:
    - id: "session-problem"
      question: "Can't I just route each user to the same server every time?"
      detail: "Sticky sessions (session affinity) seem like the obvious fix — the load balancer remembers which server each user is on and always routes them there. AWS ALB and GCP Cloud Load Balancing both support this. So why not just use it?"
  to:
    - id: "shared-sessions-redis"
      question: "OK, sticky sessions are a dead end. What's the right solution?"
      detail: "The right fix is to stop storing sessions on the server altogether. Move session state to a shared external store — then any server can handle any request, and you have true horizontal scalability."
difficulty: 1
tags: ["sticky-sessions", "session-affinity", "load-balancer", "anti-pattern", "scaling"]
category: "concept"
milestones:
  - "Explain what sticky sessions are and how they work"
  - "Describe why sticky sessions break when a server dies"
  - "Explain why sticky sessions undermine the benefits of horizontal scaling"
  - "Understand why this is an anti-pattern for stateless scaling"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
