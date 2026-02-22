---
id: "port-forwarding"
title: "Port Forwarding: The Direct Approach"
zone: "self-hosting"
edges:
  from:
    - id: "public-website"
      question: "What about just forwarding a port on my router?"
    - id: "public-media-streaming"
      question: "What about just forwarding a port on my router?"
  to: []
difficulty: 2
tags: ["self-hosting", "networking", "port-forwarding", "public", "router"]
category: "concept"
milestones:
  - "Understand what port forwarding does and what it exposes"
  - "Know the limitations (ISP blocking, dynamic IP, exposed home IP)"
---

Port forwarding is the original way to expose a home service: you tell your router to forward incoming traffic on a port directly to your server. No VPS, no tunnel, no third party. It works.

But it comes with trade-offs that the other options don't have. Know them before you go this route.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain what port forwarding actually does — router receives traffic on port X, forwards it to your server's local IP on port Y
- TODO: your home IP is now public — unlike Cloudflare Tunnel or a VPS, anyone connecting can see your real home IP address. This isn't always a dealbreaker but it's worth knowing.
- TODO: ISP restrictions — many ISPs block inbound traffic on ports 80 and 443 (the standard HTTP/HTTPS ports). You may end up on a non-standard port like 8443, which means URLs like `https://example.com:8443` — not great for a public site
- TODO: Carrier grade NAT
- TODO: dynamic home IP — your ISP changes your home IP periodically. You need Dynamic DNS (DDNS) to keep a hostname pointed at it. Services like DuckDNS or Cloudflare DDNS handle this automatically.
- TODO: direct exposure — your server is directly reachable from the internet. Keep software updated. Consider Fail2ban or CrowdSec to block brute-force attempts.
- TODO: when this actually makes sense — no ongoing VPS cost, works for any protocol, fine for personal projects where IP exposure isn't a concern
- TODO: we won't go deeper on the full setup here — this node is a signpost. If you go this route, the pieces are: port forward in router settings + DDNS + reverse proxy (Traefik is already set up) + keep things patched.

<!-- RESOURCES -->

- TODO: add resources (DuckDNS, Cloudflare DDNS, Fail2ban)
