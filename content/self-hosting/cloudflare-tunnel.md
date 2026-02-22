---
id: "cloudflare-tunnel"
title: "Cloudflare Tunnel"
zone: "self-hosting"
edges:
  from:
    - id: "public-website"
      question: "I want the simplest managed option"
  to: []
difficulty: 1
tags: ["self-hosting", "cloudflare", "tunnel", "public", "reverse-proxy"]
category: "tool"
milestones:
  - "Create a Cloudflare Tunnel in the dashboard"
  - "Install and run cloudflared on your home server"
  - "Route a public hostname to a local service"
  - "Verify the service is reachable publicly over HTTPS"
---

Cloudflare Tunnel creates an outbound connection from your server to Cloudflare's network. Your server calls out — Cloudflare answers. No open ports, no exposed home IP, no firewall changes needed.

You configure a public hostname in the Cloudflare dashboard, point it at a local service, and it works.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain how the tunnel works — cloudflared runs as a daemon on your server, maintains an outbound connection to Cloudflare, traffic flows in through Cloudflare and down the tunnel
- TODO: setup walkthrough: create tunnel in dashboard → install cloudflared → configure ingress rules → verify
- TODO: what you get for free: HTTPS, DDoS protection, your home IP stays hidden
- TODO: the limitations: Cloudflare sits in the middle of all traffic (trust consideration), TOS prohibits video streaming, not suitable for non-HTTP protocols
- TODO: Access policies — you can lock a tunnel behind Cloudflare Access (email OTP, SSO) for extra auth
- TODO: running cloudflared as a Docker container

<!-- RESOURCES -->

- TODO: add resources (Cloudflare Tunnel docs)
