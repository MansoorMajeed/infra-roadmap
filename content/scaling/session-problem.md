---
id: "session-problem"
title: "The Session Problem"
zone: "scaling"
edges:
  from:
    - id: "load-balancers"
      question: "I added a load balancer and now users keep getting randomly logged out. What's happening?"
      detail: "You set up a load balancer in front of two Python servers. Everything looks fine until users start complaining they're getting logged out mid-session. This is one of the first scaling problems everyone hits, and it stems from where your app stores session data."
  to:
    - id: "shared-sessions-redis"
      question: "The right fix is to move sessions somewhere both servers can read. What does that look like?"
      detail: "If sessions live on a specific server, that server has to handle every request for that user. The real fix is to move session storage out of the server entirely — into a shared store that any server can read and write. Redis is the standard answer."
    - id: "sticky-sessions-the-trap"
      question: "Can't I just send each user to the same server every time?"
      detail: "This is called sticky sessions (or session affinity), and it's the first thing most people try. It works — until it doesn't. Understanding why it's a trap will save you from a nasty production incident later."
difficulty: 1
tags: ["sessions", "stateless", "load-balancer", "sticky-sessions", "scaling"]
category: "concept"
milestones:
  - "Explain why sessions break when you add a load balancer"
  - "Identify where your app currently stores session data"
  - "Understand what 'stateless' means in the context of a web app"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
