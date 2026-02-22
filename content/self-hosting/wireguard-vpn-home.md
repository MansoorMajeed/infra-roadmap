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

WireGuard is a modern VPN protocol — fast, cryptographically strong, and built into the Linux kernel. Running it yourself means you own the entire stack: no third-party accounts, no service limits, no dependency on anyone else.

The trade-off: you manage it. Key generation, client configs, port forwarding on your router, dynamic DNS for your changing home IP. It's not hard, but there are more moving parts than Tailscale.

<!-- DEEP_DIVE -->

## How WireGuard works

WireGuard is fundamentally different from older VPNs. There are no usernames, passwords, or certificate authorities. Instead, each peer (your server and each client device) has a public/private key pair. You exchange public keys and configure allowed IPs — that's the entire trust model.

The result is a virtual network interface (`wg0`) that looks like a regular network interface. Traffic routed through it is encrypted using the peer's public key, and only the peer with the matching private key can decrypt it.

## The prerequisites

Unlike Tailscale, WireGuard requires:

1. **An open UDP port on your router** — typically 51820. You need to port-forward this to your home server.
2. **Dynamic DNS** — your home IP changes. Set up a DDNS hostname (DuckDNS or Cloudflare) so clients always know where to reach your server.

## wg-easy: the recommended starting point

Rather than configuring WireGuard by hand, run [wg-easy](https://github.com/wg-easy/wg-easy) — a Docker container that gives you a simple web UI for managing clients. It handles key generation and config file creation for each peer.

```yaml
services:
  wg-easy:
    image: ghcr.io/wg-easy/wg-easy
    environment:
      - WG_HOST=your-ddns-hostname.duckdns.org
      - PASSWORD_HASH=<bcrypt hash of your UI password>
    volumes:
      - ~/.wg-easy:/etc/wireguard
    ports:
      - "51820:51820/udp"
      - "51821:51821/tcp"
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
      - net.ipv4.ip_forward=1
    restart: unless-stopped
```

The web UI lets you create a new client, download its config as a `.conf` file or scan a QR code, and revoke access at any time.

## Client setup

Each client (phone, laptop) needs the WireGuard app installed. You import the config file from wg-easy and connect. The tunnel is established directly to your home server over the internet.

## Split tunneling

By default you can configure whether clients route *all* their traffic through your home (full tunnel) or only traffic destined for your home network (split tunnel). Split tunneling is usually what you want for remote access to home services — your regular internet browsing stays on the local network.

## When WireGuard makes more sense than Tailscale

- You don't want any third-party service involved (pure self-hosted)
- You have users who won't or can't create a Tailscale account
- You want to control exactly which clients exist and revoke them without a dashboard login
- You're running a larger household and want no device limits

<!-- RESOURCES -->

- [wg-easy on GitHub](https://github.com/wg-easy/wg-easy) -- type: guide, time: 20min
- [WireGuard Quick Start](https://www.wireguard.com/quickstart/) -- type: reference, time: 15min
- [DuckDNS (free dynamic DNS)](https://www.duckdns.org/) -- type: tool, time: 5min
