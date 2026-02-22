---
id: "remote-access-just-me"
title: "Goal: Just Me — Personal Remote Access"
zone: "self-hosting"
edges:
  from:
    - id: "expose-to-internet"
      question: "I just want to be able to access it myself"
  to:
    - id: "tailscale"
      question: "Show me the easy way — a private VPN mesh"
    - id: "wireguard-vpn-home"
      question: "I want to do this the manual way with WireGuard"
difficulty: 1
tags: ["self-hosting", "remote-access", "vpn"]
category: "concept"
milestones:
  - "Identify your use case: personal remote access only"
---

You want to reach your Jellyfin, Vaultwarden, or home assistant from your phone or laptop — anywhere in the world — without exposing anything to the public internet.

The right tool for this keeps everything private. Your services stay invisible to the internet; only your devices can reach them.

<!-- DEEP_DIVE -->

## TODO

- TODO: expand on what "private" means here — you're not opening anything to the public, just creating a secure tunnel back to your home
- TODO: explain the two options (Tailscale = easy/managed, WireGuard = manual/full control) and who each is for

<!-- RESOURCES -->

- TODO: add resources
