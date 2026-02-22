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

Cloudflare Tunnel runs a small daemon (`cloudflared`) on your server that makes an outbound-only connection to Cloudflare's network. Traffic comes in through Cloudflare and flows down that tunnel to your service. No open ports, no exposed home IP, no firewall or router changes.

For the full setup guide: **[Exposing a Self-Hosted Service Using Cloudflare Tunnel — blog.esc.sh](https://blog.esc.sh/cloudflare-tunnel/)**

<!-- DEEP_DIVE -->

## Prerequisites

- A domain managed by Cloudflare DNS (covered earlier)
- A running service to expose (e.g., your reverse proxy or a specific container)

## How to set it up

**1. Create the tunnel in the Cloudflare dashboard**

Go to: **Account Home → Zero Trust → Networks → Tunnels → Create tunnel → Cloudflared**

Give the tunnel a name, then Cloudflare generates an install command for you.

**2. Install cloudflared on your server**

Cloudflare provides the exact command for your OS. For Debian/Ubuntu it's something like:

```bash
curl -L --output cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  && sudo dpkg -i cloudflared.deb \
  && sudo cloudflared service install <your-tunnel-token>
```

This installs `cloudflared` as a systemd service that starts automatically. Check it's running:

```bash
sudo systemctl status cloudflared
```

**3. Configure routing in the dashboard**

Still in the Cloudflare dashboard, configure where the tunnel sends traffic:

- **Subdomain:** your chosen subdomain (or leave blank for root domain)
- **Domain:** your domain
- **Type:** `HTTP` — not HTTPS. Cloudflare terminates TLS at the edge, so traffic from Cloudflare to your local service is plain HTTP. That's fine; the connection from the user to Cloudflare is HTTPS.
- **URL:** `localhost:<port>` (or the local IP/port of your service)

Cloudflare creates the DNS record automatically. Your service is now publicly reachable at `https://subdomain.yourdomain.com`.

## Important caveats

**Cloudflare sees your traffic.** The SSL/TLS connection terminates at Cloudflare's edge — they decrypt your traffic before forwarding it. For a public website this is usually fine, but don't route sensitive private services through it.

**No video streaming.** Cloudflare's Terms of Service explicitly prohibit using the tunnel to serve video or a disproportionate amount of non-HTML content. If you need to stream media publicly, use the VPS-based approaches instead.

**Second-level subdomains cost money.** The free plan only supports root domain and one level of subdomains (`sub.yourdomain.com`). Two-level subdomains (`one.two.yourdomain.com`) require a paid Advanced Certificate.

**What you get for free:** DDoS protection, WAF, CDN, automatic HTTPS, and your home IP stays completely hidden.

<!-- RESOURCES -->

- [Exposing a Self-Hosted Service Using Cloudflare Tunnel](https://blog.esc.sh/cloudflare-tunnel/) -- type: guide, time: 20min
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) -- type: reference, time: ongoing
- [Cloudflare Access (optional auth layer)](https://developers.cloudflare.com/cloudflare-one/policies/access/) -- type: reference, time: 15min
