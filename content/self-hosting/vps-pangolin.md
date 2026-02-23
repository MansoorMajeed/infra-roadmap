---
id: vps-pangolin
title: 'VPS + Pangolin: Self-Hosted Tunnel with a UI'
zone: self-hosting
edges:
  to: []
difficulty: 2
tags:
  - self-hosting
  - vps
  - pangolin
  - tunnel
  - reverse-proxy
  - public
category: tool
milestones:
  - Provision a VPS
  - Install Pangolin on the VPS
  - Connect your home server to Pangolin using the Newt agent
  - Configure a public hostname routing to a local service
  - Verify the service is reachable publicly
---

Pangolin is a self-hosted reverse proxy and tunnel manager. You run it on a cheap VPS, and it manages the tunnel from your home server to the VPS — similar in concept to Cloudflare Tunnel, but you own every piece of it. A web UI handles hostnames, routing, and access control without touching config files.

Works for websites, web apps, and media streaming — no TOS restrictions since you own the VPS.

<!-- DEEP_DIVE -->

## The architecture

```
Internet → VPS public IP → Pangolin → tunnel → Newt agent (home server) → service
```

Pangolin runs on the VPS. On your home server, you run **Newt** — a lightweight agent that connects out to Pangolin and registers your services. Traffic arrives at the VPS, Pangolin routes it through the tunnel to the appropriate service on your home server.

Like Cloudflare Tunnel, the tunnel is outbound-only from your home — no open ports on your router.

## Choosing a VPS

Almost any cheap VPS works. Popular choices:

- **Hetzner** (CAX11, ~€4/month) — excellent value, good bandwidth
- **Oracle Always Free** — genuinely free, limited but usable for light traffic
- **DigitalOcean / Vultr / Linode** — $5-6/month, widely used

For media streaming, prioritize bandwidth. Hetzner includes 20TB/month on most plans.

## Setup overview

**1. Provision the VPS** with a fresh Linux install (Ubuntu or Debian recommended).

**2. Install Pangolin on the VPS** following the [Pangolin documentation](https://docs.fossorial.io/). It runs as a set of Docker containers and includes a web UI, the tunnel server (Gerbil), and a reverse proxy (Traefik).

**3. Install Newt on your home server** — the lightweight agent that connects to Pangolin. It runs as a Docker container and registers with your Pangolin instance using a credential you create in the dashboard.

**4. Configure tunnels in the Pangolin UI** — add your services, configure public hostnames, and set access policies. Pangolin creates the necessary DNS records or gives you the records to add yourself.

**5. Access your service** at the configured public hostname. Pangolin handles HTTPS automatically.

## Access control

Pangolin includes built-in access control — you can lock tunnels behind email-based OTP, SSO, or a simple PIN, without needing to add a separate auth layer.

## Trade-offs vs VPS + WireGuard + nginx

Pangolin adds convenience: a UI, built-in auth, automatic certificate management. In exchange, you're running additional software (the Pangolin stack) on your VPS, which means more to maintain and more potential failure points.

If you're comfortable with nginx and WireGuard, the raw approach is often cleaner — fewer moving parts, standard tooling, simpler to debug. Pangolin is the better choice if you prefer a GUI and want auth and cert management handled for you.

<!-- RESOURCES -->

- [Pangolin Documentation](https://docs.fossorial.io/) -- type: reference, time: ongoing
- [Pangolin on GitHub](https://github.com/fosrl/pangolin) -- type: reference, time: 5min
