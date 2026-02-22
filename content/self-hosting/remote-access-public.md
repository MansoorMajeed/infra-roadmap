---
id: "remote-access-public"
title: "Goal: Public Access — Open to the Internet"
zone: "self-hosting"
edges:
  from:
    - id: "expose-to-internet"
      question: "It needs to be publicly accessible to anyone on the internet"
  to:
    - id: "public-access-security"
      question: "Understood — what do I need to know before doing this?"
difficulty: 2
tags: ["self-hosting", "public", "networking", "security"]
category: "concept"
milestones:
  - "Identify your use case: genuinely public-facing service"
---

You're running something that legitimately needs to be reachable by anyone — a personal website, a public API, a blog, or a service you're sharing with people you don't manage devices for.

This is a fundamentally different problem from private access. You're not extending a private network — you're putting something on the open internet.

<!-- DEEP_DIVE -->

## TODO

- TODO: distinguish from private access — anyone can attempt to connect, not just trusted devices
- TODO: explain what "public" means for your home server — your IP, your machine, your ISP
- TODO: briefly introduce the tools (Cloudflare Tunnel, VPS+Pangolin, VPS+WireGuard) without going deep yet

<!-- RESOURCES -->

- TODO: add resources
