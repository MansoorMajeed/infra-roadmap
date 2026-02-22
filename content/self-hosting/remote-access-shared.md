---
id: "remote-access-shared"
title: "Goal: Shared Access — Friends and Family"
zone: "self-hosting"
edges:
  from:
    - id: "expose-to-internet"
      question: "Me and some friends or family need access"
  to:
    - id: "tailscale"
      question: "Can I share a private VPN with others?"
    - id: "wireguard-vpn-home"
      question: "I want to run my own VPN server and manage who gets in"
difficulty: 1
tags: ["self-hosting", "remote-access", "vpn", "sharing"]
category: "concept"
milestones:
  - "Identify your use case: trusted shared access"
---

You want a few trusted people — a partner, family members, a friend group — to be able to use your Jellyfin, Nextcloud, or photo library. Not the whole internet, just the people you choose.

This is still a private access problem. You don't need to expose anything publicly — you just need to extend your private network to a small set of trusted people.

<!-- DEEP_DIVE -->

## TODO

- TODO: clarify that this is still private, not public — no one on the internet can stumble onto these services
- TODO: explain the two options: Tailscale (supports sharing with external accounts, very easy) vs WireGuard (you manage credentials, more control, more work)
- TODO: mention the practical limit — Tailscale free tier supports a limited number of devices; for larger households WireGuard may make more sense

<!-- RESOURCES -->

- TODO: add resources
