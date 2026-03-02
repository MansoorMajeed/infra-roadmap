---
id: jwt-and-cookie-sessions
title: JWT and Stateless Sessions
zone: scaling
edges:
  to: []
difficulty: 2
tags:
  - jwt
  - cookies
  - sessions
  - stateless
  - signed-cookies
  - authentication
  - security
category: concept
milestones:
  - Explain the difference between server-side sessions and client-side sessions
  - Describe how a signed cookie prevents tampering
  - Understand what JWT is and how it differs from a signed cookie
  - Know when to prefer Redis sessions over stateless tokens (and vice versa)
  - >-
    Understand what session revocation means and why it's hard with stateless
    tokens
---

Server-side sessions (whether stored in Redis or a database) require a round-trip to a shared store on every request to look up the session. An alternative approach is to store the session data directly in the browser — in a signed cookie or a JWT — so the server doesn't need to look anything up. Understanding the trade-offs between these approaches matters for building secure, scalable authentication.

<!-- DEEP_DIVE -->

## Signed cookies

A signed cookie stores the session data directly in the cookie value, but signs it with a secret key so the server can verify it hasn't been tampered with. Flask's default session implementation does this with HMAC-SHA1. When you set `session["user_id"] = 42`, Flask serializes that data, signs it with `SECRET_KEY`, and puts the whole thing in a cookie.

On the next request, Flask reads the cookie, verifies the signature, and if valid, trusts the data. No database lookup, no Redis call — the session data is right there in the request.

The catch: the data is readable by the client. It's base64-encoded, not encrypted. Anyone can decode the cookie value and see what's in it. You should never put sensitive data (passwords, tokens, private information) in a signed cookie. User IDs and permissions are generally fine.

## JWTs (JSON Web Tokens)

A JWT is a more standardized version of the same concept: a JSON payload signed with a secret key (HMAC) or a private key (RSA/ECDSA). JWTs are commonly used for API authentication. An API server issues a JWT on login; the client includes it in the `Authorization: Bearer <token>` header on every subsequent request; the server verifies the signature and trusts the claims.

JWTs are self-contained: the payload can include the user ID, roles, expiry, and any other claims you want to verify without a database lookup.

## The revocation problem

This is where stateless sessions have a hard trade-off. With server-side sessions, revoking a session is simple: delete it from Redis. The next request with that session ID finds nothing and the user is logged out.

With a signed cookie or JWT, you can't revoke a specific token without either:
- Maintaining a revocation list (a blocklist) — which means a database lookup on every request, eliminating the main benefit
- Rotating the secret key — which invalidates *all* tokens, logging out every user
- Using short expiry times — so stolen tokens expire quickly, but you need a refresh token mechanism

For internal services and APIs where revocation is rarely needed, JWTs are practical. For user-facing sessions where "log out all sessions" or "deactivate this account immediately" are requirements, server-side sessions in Redis are cleaner.

## When to use which

| Approach | Best for | Downside |
|---|---|---|
| Server-side sessions (Redis) | User web sessions, when instant revocation matters | Requires shared store, adds lookup latency |
| Signed cookies | Simple web apps with small session data | Not encrypted, no revocation |
| JWT | Service-to-service auth, APIs, mobile clients | Revocation is hard |

Most production e-commerce sites use server-side sessions for the logged-in user experience (because being able to force-logout a user or invalidate sessions on password change matters) and JWTs for internal API calls between services.

<!-- RESOURCES -->

- [JWT.io Introduction](https://jwt.io/introduction) -- type: article, time: 10m
- [Flask Session Security](https://flask.palletsprojects.com/en/stable/security/#set-cookie-options) -- type: docs, time: 10m
- [Stop Using JWTs for Sessions (Joël Franusic)](https://dev.to/rdegges/please-stop-using-local-storage-1i04) -- type: article, time: 10m
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) -- type: article, time: 20m
