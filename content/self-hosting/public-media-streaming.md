---
id: public-media-streaming
title: Public Media Streaming
zone: self-hosting
edges:
  to:
    - id: vps-pangolin
      question: I want a managed solution with a UI
      detail: >-
        I'm okay with a VPS, but I want a UI to manage things — not raw config
        files and commands every time. Is there something that handles the hard
        parts?
    - id: vps-wireguard-expose
      question: I want full control — VPS with manual setup
      detail: >-
        I want to understand exactly how traffic flows from the internet to my
        home server. I'm comfortable with manual setup — what does that actually
        involve?
    - id: port-forwarding
      question: What about just forwarding a port on my router?
      detail: >-
        Can't I just open a port on my router and skip renting a VPS entirely?
        What's the catch for media streaming specifically?
difficulty: 2
tags:
  - self-hosting
  - public
  - media
  - streaming
  - jellyfin
category: concept
milestones:
  - Understand why Cloudflare Tunnel is not suitable for media streaming
  - Know the options for public media access
---

You want to publicly expose a media server like Jellyfin so anyone can stream video or audio from a browser — no VPN required.

Cloudflare Tunnel is ruled out immediately: their Terms of Service explicitly prohibit proxying large media files, and they will terminate tunnels that violate this. For public media streaming, you need infrastructure you control.

<!-- DEEP_DIVE -->

## Why Cloudflare Tunnel doesn't work here

Cloudflare provides its CDN and tunnel service for free (or cheap) by restricting what you can push through it. Video and audio streaming generates enormous bandwidth. Their TOS explicitly forbids using the service "to serve video or a disproportionate amount of non-HTML content." If they detect it, the tunnel gets shut down.

## Your options

### VPS + Pangolin — managed, with a UI

Rent a cheap VPS, run Pangolin on it, configure a tunnel from your home server. Traffic comes in on the VPS's public IP and is forwarded through the tunnel to Jellyfin at home. Pangolin gives you a web UI to manage everything.

You own the VPS — no TOS restrictions, you control the bandwidth. For streaming you'll want a VPS with a generous bandwidth allowance. Hetzner and Oracle Free Tier are popular choices.

### VPS + WireGuard + nginx — full control

WireGuard tunnel from your home to the VPS, nginx proxying public traffic through it. No Pangolin, no extra software layer — just two tools you already understand. More setup, but the result is cleaner and easier to reason about long-term.

This is the approach to choose if you're comfortable with Linux and want to avoid managing additional software on your VPS. Run nginx however you like, add Caddy for automatic HTTPS, tune it for streaming — it's all standard tooling.

### Port forwarding — simplest, if your ISP allows it

If your ISP doesn't block the ports you need and you're okay with your home IP being public, port forwarding is the simplest path. No VPS cost. Works for any protocol. The trade-off is direct internet exposure and potential ISP port blocks.

<!-- RESOURCES -->
