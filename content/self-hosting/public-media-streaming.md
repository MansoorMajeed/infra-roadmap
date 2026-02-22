---
id: "public-media-streaming"
title: "Public Media Streaming"
zone: "self-hosting"
edges:
  from:
    - id: "public-access-security"
      question: "Got it — I want to stream media publicly"
  to:
    - id: "vps-pangolin"
      question: "I want a managed solution with a UI"
    - id: "vps-wireguard-expose"
      question: "I want full control — VPS with manual setup"
    - id: "port-forwarding"
      question: "What about just forwarding a port on my router?"
difficulty: 2
tags: ["self-hosting", "public", "media", "streaming", "jellyfin"]
category: "concept"
milestones:
  - "Understand why Cloudflare Tunnel is not suitable for media streaming"
  - "Know the two VPS-based options for public media access"
---

You want to publicly expose a media server like Jellyfin so people outside your home can stream video or audio.

Cloudflare Tunnel is not an option here — their Terms of Service prohibit proxying large media files, and they will terminate your tunnel if they detect it. For public media streaming you need a VPS that you control.

<!-- DEEP_DIVE -->

## TODO

- TODO: clearly explain why Cloudflare Tunnel is ruled out (TOS, media detection, bandwidth)
- TODO: explain the two VPS approaches:
  - VPS + Pangolin: a reverse proxy manager with a UI, handles the tunnel from your home to the VPS — easier to set up
  - VPS + WireGuard + nginx: raw WireGuard tunnel from home to VPS, then nginx proxies publicly — more involved, but no extra software layer, full control, often preferable for advanced users
- TODO: note that for media specifically, you want a VPS with good bandwidth and ideally located near your users
- TODO: brief note on cost — cheap VPS options (Hetzner, Oracle Free Tier, etc.)

<!-- RESOURCES -->

- TODO: add resources
