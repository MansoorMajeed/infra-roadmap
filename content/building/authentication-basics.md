---
id: authentication-basics
title: Authentication Basics
zone: building
edges:
  to:
    - id: it-works-on-my-laptop
      question: >-
        Auth is working. Now how do I get this whole thing — app, database,
        login and all — running somewhere other people can reach?
      detail: >-
        I've got users, sessions, login, logout. It works on localhost. But
        I have no idea how to get this running on a real server where other
        people can actually use it. And I'm a little nervous about whether
        the auth is even secure enough for that.
difficulty: 2
tags:
  - authentication
  - sessions
  - tokens
  - jwt
  - oauth
  - cookies
  - security
category: concept
milestones:
  - Explain the difference between authentication and authorization
  - Implement session-based login with cookies in a web app
  - Understand how tokens (JWT) work and when to use them instead of sessions
  - Know what OAuth is and why "Sign in with Google" exists
---

Right now, anyone who visits your app can do anything. There's no concept of "who are you?" and no way to show different things to different people. Authentication is how your app verifies identity — confirming that a user is who they claim to be. It's one of the first things you need the moment your app has any concept of user data, personal content, or restricted actions.

<!-- DEEP_DIVE -->

## Sessions and cookies

The most common way to handle auth in a web app is session-based authentication. The flow is straightforward:

1. User submits their email and password
2. Server checks the credentials against the database
3. Server creates a **session** — a record that says "this person is logged in" — and stores it (in memory, a database, or Redis)
4. Server sends back a **cookie** containing the session ID
5. On every subsequent request, the browser automatically sends the cookie, and the server looks up the session to know who's making the request

The session lives on the server. The cookie is just a pointer to it. When the user logs out, the server deletes the session.

This works well for traditional web apps where the server renders HTML. The browser handles cookies automatically — no JavaScript required.

## Tokens and JWTs

Token-based auth works differently. Instead of storing a session on the server, the server creates a **token** — a signed blob of data that contains the user's identity — and sends it to the client. The client stores it (usually in localStorage or a cookie) and sends it with every request.

**JSON Web Tokens (JWTs)** are the standard format. A JWT has three parts: a header, a payload (containing claims like `user_id: 42, role: admin`), and a cryptographic signature. The server can verify the signature without looking anything up — the token itself contains all the information needed.

The tradeoff: sessions require server-side storage but are easy to revoke (just delete the session). JWTs require no server-side storage but are hard to revoke (the token is valid until it expires). In practice, most apps use short-lived JWTs with refresh tokens to get the best of both.

## OAuth and "Sign in with Google"

OAuth solves a different problem: letting users log in to your app using an account they already have (Google, GitHub, etc.) without giving you their password. The flow involves redirecting the user to the provider, the provider confirming their identity, and sending your app a token that proves who they are.

You don't implement OAuth from scratch — you use a library. But understanding what's happening underneath matters because OAuth-related failures (expired tokens, misconfigured redirect URIs, provider outages) are common incidents you'll deal with later.

## Authentication vs authorization

Authentication asks "who are you?" Authorization asks "what are you allowed to do?" They're different concerns. A user can be authenticated (logged in) but not authorized (not an admin). Most apps need both, and confusing them leads to security bugs.

<!-- RESOURCES -->

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) -- type: reference, time: 30m
- [JWT.io — Introduction to JWTs](https://jwt.io/introduction) -- type: guide, time: 15m
- [OAuth 2.0 Simplified — Aaron Parecki](https://www.oauth.com/) -- type: guide, time: 1h
