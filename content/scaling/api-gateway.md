---
id: api-gateway
title: API Gateways
zone: scaling
edges:
  to:
    - id: waf
      question: The gateway handles routing and auth centrally. But I'm seeing malicious traffic — SQL injection attempts, bots scanning for vulnerabilities. What do I put in front to block that?
      detail: >-
        The API gateway takes care of legitimate cross-cutting concerns. But
        it's not designed to inspect request payloads for attack patterns. I
        need something that understands HTTP deeply enough to distinguish a
        valid request from an exploit attempt.
difficulty: 2
tags:
  - api-gateway
  - kong
  - aws-api-gateway
  - nginx
  - reverse-proxy
  - routing
  - authentication
  - rate-limiting
category: concept
milestones:
  - Explain what an API gateway does that a plain reverse proxy does not
  - Know what Kong is and what its plugins handle (auth, rate limiting, logging)
  - Understand when AWS API Gateway (managed) beats self-hosted Kong
  - Explain the trade-off between centralising logic in a gateway vs keeping it in services
  - Know what request/response transformation is and when you need it
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
