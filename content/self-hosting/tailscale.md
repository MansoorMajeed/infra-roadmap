---
id: "tailscale"
title: "Tailscale: Private Network, Zero Configuration"
zone: "self-hosting"
edges:
  from:
    - id: "remote-access-just-me"
      question: "Show me the easy way — a private VPN mesh"
    - id: "remote-access-shared"
      question: "Can I share a private VPN with others?"
  to: []
difficulty: 1
tags: ["self-hosting", "tailscale", "vpn", "wireguard", "remote-access"]
category: "tool"
milestones:
  - "Install Tailscale on your home server"
  - "Install Tailscale on your phone or laptop"
  - "Access a home service by its Tailscale IP or MagicDNS name from outside your home"
  - "Share access with at least one other person (if applicable)"
---

Tailscale connects your devices into a private network that works everywhere — no port forwarding, no dynamic DNS, no firewall rules. You install it, log in, and your devices can see each other as if they were on the same LAN.

Under the hood it's WireGuard, managed for you.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain the core concept — mesh VPN, every device gets a stable IP (100.x.x.x range) and a MagicDNS name
- TODO: installation on Linux server (one command) and phones/laptops
- TODO: how to access your services by Tailscale IP vs by MagicDNS name
- TODO: Tailscale sharing — how to invite another user to access specific machines (great for family)
- TODO: subnet routing — exposing your whole home network to your Tailscale so you can reach non-Tailscale devices too
- TODO: free tier limits and when you might hit them
- TODO: the trust model — Tailscale as a company coordinates connections, but they can't see your traffic (WireGuard encrypted end-to-end)

<!-- RESOURCES -->

- TODO: add resources (Tailscale docs, setup guide)
