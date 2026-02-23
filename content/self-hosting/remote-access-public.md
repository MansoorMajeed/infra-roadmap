---
id: remote-access-public
title: 'Goal: Public Access — Open to the Internet'
zone: self-hosting
edges:
  to:
    - id: public-access-security
      question: >-
        What are the risks? I want to understand what I'm getting into before I
        open anything up.
      detail: >-
        I've heard bots scan everything constantly. Does my home IP get exposed?
        What am I actually signing up for in terms of attack surface?
difficulty: 2
tags:
  - self-hosting
  - public
  - networking
  - security
category: concept
milestones:
  - 'Identify your use case: genuinely public-facing service'
---

You're running something that legitimately needs to be reachable by anyone — a personal website, a public API, a blog, or a media server for people you can't set up a VPN for.

This is a fundamentally different problem from private access. You're not extending a private network to trusted devices — you're putting something on the open internet.

<!-- DEEP_DIVE -->

## What "public" actually means

When you make a service publicly accessible, anyone with the URL can attempt to reach it. That includes people you want, and bots you don't. Port scanners, credential stuffers, vulnerability probes — they're automated and they hit everything they can find.

This doesn't mean don't do it. It means go in with a clear picture of what you're exposing, and take the right precautions.

## The options

There are a few approaches, each with different trade-offs:

- **Cloudflare Tunnel** — outbound tunnel from your server to Cloudflare, no open ports, your home IP stays hidden. Great for websites and web apps. Not suitable for media streaming.
- **VPS + Pangolin** — rent a cheap VPS, run a reverse proxy manager on it, tunnel from home. Works for websites and media alike. You own the VPS.
- **VPS + WireGuard + nginx** — the same VPS approach but fully manual. WireGuard for the tunnel, nginx to proxy publicly. No extra software layer, full control, works for everything.
- **Port forwarding** — open a port on your router directly. Works, but your home IP is exposed and your server is directly on the internet.

Before you pick one, there's an important security conversation to have.

<!-- RESOURCES -->
