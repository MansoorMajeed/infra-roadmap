---
id: "jwt-and-cookie-sessions"
title: "JWT and Stateless Sessions"
zone: "scaling"
edges:
  from:
    - id: "shared-sessions-redis"
      question: "Do I even need Redis for sessions? What about JWT or signed cookies?"
      detail: "Server-side sessions in Redis are battle-tested, but they add infrastructure. An alternative is to store session data directly in the cookie — signed with a secret key so it can't be forged. The server just verifies the signature and trusts the content. No session store needed at all."
  to: []
difficulty: 2
tags: ["jwt", "cookies", "sessions", "stateless", "signed-cookies", "authentication", "security"]
category: "concept"
milestones:
  - "Explain the difference between server-side sessions and client-side sessions"
  - "Describe how a signed cookie prevents tampering"
  - "Understand what JWT is and how it differs from a signed cookie"
  - "Know when to prefer Redis sessions over stateless tokens (and vice versa)"
  - "Understand what session revocation means and why it's hard with stateless tokens"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
