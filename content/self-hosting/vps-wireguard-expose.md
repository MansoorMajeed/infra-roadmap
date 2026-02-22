---
id: "vps-wireguard-expose"
title: "VPS + WireGuard: Full Control, No Extra Software"
zone: "self-hosting"
edges:
  from:
    - id: "public-website"
      question: "I want full control — VPS with manual setup"
    - id: "public-media-streaming"
      question: "I want full control — VPS with manual setup"
  to: []
difficulty: 3
tags: ["self-hosting", "vps", "wireguard", "nginx", "tunnel", "public"]
category: "practice"
milestones:
  - "Provision a VPS and install WireGuard on it"
  - "Configure WireGuard on your home server to tunnel to the VPS"
  - "Bring up the WireGuard tunnel between home and VPS"
  - "Install nginx on the VPS and proxy a public hostname to your home service via the tunnel"
  - "Verify the service is reachable publicly"
---

A VPS runs WireGuard. Your home server connects to it as a WireGuard peer. Traffic that arrives at the VPS's public IP gets proxied through the tunnel to your home — where your actual services live.

No Pangolin, no special software. Just WireGuard for the tunnel and nginx (or Caddy) for the reverse proxy. This is the cleanest, most portable approach — and it works for everything: websites, media streaming, any TCP service.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain the full architecture clearly — VPS has public IP, WireGuard creates a private tunnel (e.g. 10.8.0.1 VPS, 10.8.0.2 home), nginx on the VPS proxies `proxy_pass http://10.8.0.2:8096` to reach Jellyfin on the home server
- TODO: VPS setup: install WireGuard, generate keys, write wg0.conf, enable IP forwarding
- TODO: home server setup: install WireGuard, configure as peer pointing to the VPS
- TODO: bringing up the tunnel and verifying connectivity (ping across the tunnel)
- TODO: nginx config on the VPS — proxying public traffic to home services via tunnel IPs
- TODO: HTTPS on the VPS — Caddy makes this trivial (auto-certs), or certbot + nginx
- TODO: why this is often the better choice: no Pangolin to maintain, no vendor lock-in, standard tools (WireGuard + nginx/Caddy) you already understand, works for any protocol
- TODO: the trade-off: more manual setup, you need to touch WireGuard configs when things change
- TODO: keeping the tunnel alive — systemd service, wg-quick, or Docker

<!-- RESOURCES -->

- TODO: add resources (WireGuard docs, nginx reverse proxy guide, Caddy docs)
