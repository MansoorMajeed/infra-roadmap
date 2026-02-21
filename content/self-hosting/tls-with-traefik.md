---
id: "tls-with-traefik"
title: "TLS / HTTPS with Traefik"
zone: "self-hosting"
edges:
  from:
    - id: "traefik"
      question: "Routing works — now I want HTTPS on everything"
  to: []
difficulty: 2
tags: ["self-hosting", "tls", "https", "traefik", "letsencrypt", "cloudflare"]
category: "practice"
milestones:
  - "Understand why HTTPS matters even on a home network"
  - "Get a domain name (or use a free one)"
  - "Configure Traefik with a Let's Encrypt certificate resolver"
  - "Use Cloudflare DNS challenge (no port forwarding needed)"
  - "Access all your services over HTTPS"
---

TODO: Write content for this node. Cover:
- Why HTTPS even locally: browser security warnings, some apps (Vaultwarden) require HTTPS for certain features
- Let's Encrypt: free, automated, 90-day certs — Traefik renews automatically
- DNS challenge vs HTTP challenge: DNS challenge works without opening port 80, ideal for home networks
- Cloudflare as the DNS provider: free, Traefik has native support, generate API token
- Walk through the Traefik config: certificatesResolvers, acme, dnsChallenge
- Adding the HTTPS entrypoint and redirect from HTTP
- Result: all your services get real, trusted HTTPS certs automatically
- actually we should have a separate node for domain names for internal services. so what is a reverse proxy -> {getting a domain name, traefik as your reverse proxy} -> converting on tls/https with traefik

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
