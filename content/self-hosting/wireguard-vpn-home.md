---
id: "wireguard-vpn-home"
title: "WireGuard: Run Your Own VPN Server at Home"
zone: "self-hosting"
edges:
  from:
    - id: "remote-access-just-me"
      question: "I want to do this the manual way with WireGuard"
    - id: "remote-access-shared"
      question: "I want to run my own VPN server and manage who gets in"
  to: []
difficulty: 3
tags: ["self-hosting", "wireguard", "vpn", "networking", "remote-access"]
category: "tool"
milestones:
  - "Install WireGuard on your home server"
  - "Generate server and client key pairs"
  - "Configure port forwarding on your router for WireGuard's UDP port"
  - "Configure a client (phone or laptop) and connect successfully"
  - "Access a home service through the tunnel"
---

WireGuard is a modern VPN protocol — fast, simple, and built into the Linux kernel. Running it yourself means you own the entire stack: no third-party service, no accounts, no limits.

The trade-off: you have to manage it. Key generation, client configs, port forwarding, dynamic DNS for your home IP. It's not hard, but there are more moving parts than Tailscale.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain WireGuard's model — public/private key pairs, peers, the wg0 interface
- TODO: the port forwarding requirement — unlike Tailscale, you need a port open on your router (UDP, typically 51820)
- TODO: dynamic DNS — your home IP changes, so you need a DDNS hostname (DuckDNS, Cloudflare, etc.)
- TODO: wg-easy — mention it as a Docker-based UI that simplifies setup significantly (good recommendation for most people)
- TODO: generating keys and writing the server config
- TODO: client config — what to give to family/friends so they can connect
- TODO: split tunneling vs full tunnel — do you route all traffic through home or just home network traffic?
- TODO: when this makes more sense than Tailscale (full control, no third party, running for a large household)

<!-- RESOURCES -->

- TODO: add resources (WireGuard docs, wg-easy, DDNS setup)
