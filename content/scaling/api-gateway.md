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

As a system grows from one service into many, you end up implementing the same cross-cutting concerns in every service: authenticate the request, check the rate limit, log it, route it to the right backend. An API gateway centralizes these concerns — it's a single entry point that handles the common stuff before passing requests to your services. Every service behind it is simpler because it doesn't have to implement auth or throttling itself.

<!-- DEEP_DIVE -->

## What an API gateway adds over a plain reverse proxy

A plain reverse proxy (Nginx, HAProxy) forwards requests to backends. An API gateway does that plus:

- **Authentication and authorization**: verify JWTs, check API keys, validate OAuth tokens before the request ever reaches a service. Services trust that if a request arrives, it's already been authenticated.
- **Rate limiting**: enforce per-API-key or per-user rate limits centrally. Every service gets rate limiting automatically without any code.
- **Request/response transformation**: rewrite headers, reshape request bodies, aggregate responses from multiple backends into one.
- **Logging and observability**: capture request/response metadata at the gateway — latency, status codes, API key used — in a consistent format across all services.
- **API versioning and routing**: route `/api/v1/products` to one backend and `/api/v2/products` to another.

## Kong

Kong is an open-source API gateway built on top of Nginx. It's configured through a REST API (or declarative config files) and extended with plugins. Built-in plugins cover auth (JWT, API key, OAuth2), rate limiting, request transformation, logging (to Datadog, Kafka, etc.), and more.

Deploying Kong means running the Kong process (and its config database, typically Postgres) in front of your services. Each service is configured as an "upstream" with routes that define which URLs map to it.

```yaml
# kong.yaml (declarative config)
services:
  - name: product-service
    url: http://product-service.internal:8080
    routes:
      - name: products-route
        paths: ["/api/products"]
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 1000
```

## AWS API Gateway

AWS API Gateway is a fully managed alternative. You define your API in the AWS console or via CloudFormation/Terraform, and AWS handles scaling, availability, and operations. It integrates natively with AWS Lambda (for serverless backends), ECS, and HTTP endpoints.

The managed option is simpler operationally — no Kong cluster to run — but less flexible for complex routing logic. AWS API Gateway also supports WebSockets and HTTP/2.

Cost: AWS API Gateway charges per API call, which can get expensive at high throughput. Self-hosted Kong has no per-request cost (just the EC2 instances running it).

## When a gateway makes sense — and when it doesn't

**Makes sense**: you have multiple services (2+) sharing auth logic, rate limits, or routing rules. The overhead of a gateway is justified by eliminating repeated implementation across services.

**Might not make sense**: a single monolith with one API. The added latency hop (typically 1-5ms) and operational complexity of a gateway isn't worth it for routing to one service. Your load balancer is sufficient.

## The trade-off: centralized logic

Centralizing auth and rate limiting in the gateway is convenient — but it makes the gateway a critical path dependency. If the gateway has a bug or misconfiguration, every API call is affected. Keep gateway logic minimal and service-agnostic; anything service-specific should stay in the service.

<!-- RESOURCES -->

- [Kong Documentation](https://docs.konghq.com/) -- type: docs, time: 30m
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) -- type: docs, time: 20m
- [API Gateway Pattern - Microsoft Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway) -- type: article, time: 15m
