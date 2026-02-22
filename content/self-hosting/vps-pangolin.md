---
id: "vps-pangolin"
title: "VPS + Pangolin: Self-Hosted Tunnel with a UI"
zone: "self-hosting"
edges:
  from:
    - id: "public-website"
      question: "I want a self-hosted VPS solution with a UI"
    - id: "public-media-streaming"
      question: "I want a managed solution with a UI"
  to: []
difficulty: 2
tags: ["self-hosting", "vps", "pangolin", "tunnel", "reverse-proxy", "public"]
category: "tool"
milestones:
  - "Provision a cheap VPS (Hetzner, DigitalOcean, Oracle Free Tier, etc.)"
  - "Install Pangolin on the VPS"
  - "Connect your home server to Pangolin"
  - "Route a public hostname through the tunnel to a local service"
  - "Verify the service is reachable publicly"
---

Pangolin is a self-hosted reverse proxy and tunnel manager. You run it on a cheap VPS, and it creates a tunnel back to your home server — similar to Cloudflare Tunnel, but you own the VPS and nothing sits between you and your users.

It gives you a web UI to manage tunnels and hostnames without touching config files.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain the architecture — VPS runs Pangolin, home server runs an agent that connects out to the VPS, traffic comes in on the VPS and is forwarded through the tunnel
- TODO: VPS selection — what specs you need, cheap options (Hetzner CAX11, Oracle Always Free, etc.)
- TODO: installation on the VPS
- TODO: connecting the home server agent
- TODO: configuring public hostnames and routing
- TODO: media streaming — works fine since you own the VPS, no TOS restrictions
- TODO: trade-offs vs Cloudflare Tunnel (you own it, no vendor lock-in, costs a few dollars/month for VPS) and vs raw WireGuard+nginx (Pangolin adds an extra software layer; the raw approach is simpler at its core but fully manual)
- TODO: when Pangolin makes sense vs just using WireGuard+nginx yourself

<!-- RESOURCES -->

- TODO: add resources (Pangolin docs, cheap VPS options)
