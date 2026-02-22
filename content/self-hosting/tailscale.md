---
id: "tailscale"
title: "Tailscale: Private Network, Zero Configuration"
zone: "self-hosting"
edges:
  from:
    - id: "remote-access-just-me"
      question: "What's the simplest option? I just want it to work"
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

Tailscale connects your devices into a private mesh network that works everywhere — no port forwarding, no dynamic DNS, no firewall rules. Install it, log in, and your devices find each other as if they were on the same LAN, regardless of where they are.

Under the hood it's WireGuard, managed for you.

<!-- DEEP_DIVE -->

## How it works

Every device you install Tailscale on gets a stable IP in the `100.x.x.x` range (the Tailscale network), plus a MagicDNS name like `my-server.tail1234.ts.net`. These are stable — they don't change when your home IP changes or when the device reboots.

Tailscale handles NAT traversal automatically. It tries to establish a direct peer-to-peer connection between your devices using WireGuard. If that's blocked (some networks are restrictive), it falls back to routing traffic through Tailscale's relay servers. Either way, the traffic is WireGuard-encrypted end-to-end — Tailscale as a company cannot see it.

## Installation

On your Linux home server:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Then install the Tailscale app on your phone or laptop and log in with the same account. Both devices will appear in your Tailscale admin console and can immediately reach each other.

## Accessing your services

Once connected, use the device's Tailscale IP or MagicDNS name to reach your services:

```
http://100.x.x.x:8096       # Jellyfin by Tailscale IP
https://my-server.tail1234.ts.net  # via MagicDNS
```

If you've set up Traefik with local DNS (as in the previous sections), that works too — you just need to be on your Tailscale network for the DNS to resolve.

## Sharing access with others

Tailscale lets you share individual devices with other Tailscale accounts — they get access to just that device, not your whole network. Great for giving a family member access to your Jellyfin server.

Alternatively, you can enable **subnet routing**: your Tailscale node advertises your whole home network (`192.168.1.0/24`), and other devices can reach anything on that subnet. Useful if you have non-Tailscale devices (a NAS, a printer) you want to reach remotely.

## Free tier

The free plan allows up to 100 devices and 3 users, which is plenty for personal and family use. If you hit the limits, self-hosting the coordination server with [Headscale](https://headscale.net/) is an open-source alternative.

<!-- RESOURCES -->

- [Tailscale Quickstart](https://tailscale.com/kb/1017/install) -- type: guide, time: 10min
- [MagicDNS](https://tailscale.com/kb/1081/magicdns) -- type: reference, time: 5min
- [Subnet Routing](https://tailscale.com/kb/1019/subnets) -- type: guide, time: 10min
- [Sharing Nodes](https://tailscale.com/kb/1084/sharing) -- type: guide, time: 5min
- [Headscale (self-hosted coordination)](https://headscale.net/) -- type: reference, time: ongoing
