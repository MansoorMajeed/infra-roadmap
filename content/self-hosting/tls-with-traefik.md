---
id: "tls-with-traefik"
title: "TLS / HTTPS with Traefik"
zone: "self-hosting"
edges:
  from:
    - id: "traefik"
      question: "Routing works — now I want HTTPS on everything"
    - id: "getting-a-domain"
      question: "I have a domain — now I want HTTPS on everything"
  to: []
difficulty: 2
tags: ["self-hosting", "tls", "https", "traefik", "letsencrypt", "cloudflare"]
category: "practice"
milestones:
  - "Understand why HTTPS matters even on a home network"
  - "Configure Traefik with a Let's Encrypt certificate resolver"
  - "Use Cloudflare DNS challenge (no port forwarding needed)"
  - "Access all your services over HTTPS with real trusted certificates"
---

Vaultwarden won't let you use its browser extension without HTTPS. Many modern browser APIs require a secure context. And plain HTTP means your passwords travel unencrypted over your local network.

HTTPS matters even for internal services. With Traefik and Cloudflare, getting it is nearly automatic — and once configured, you never think about certificates again.

For the full setup walkthrough, follow this guide: **[Traefik with Docker — blog.esc.sh](https://blog.esc.sh/traefik-docker/)**

<!-- DEEP_DIVE -->

## How it works

[Let's Encrypt](https://letsencrypt.org/) issues free, trusted TLS certificates that browsers recognise without warnings. Traefik has built-in support for requesting and renewing them automatically.

The key is using the **DNS challenge** instead of the HTTP challenge. Normally, Let's Encrypt verifies you own a domain by making an HTTP request to it — which requires your server to be reachable from the internet. The DNS challenge proves ownership differently: Traefik creates a temporary DNS TXT record via the Cloudflare API. Let's Encrypt checks for that record. Certificate issued. Your server never needs to be publicly reachable.

## What you need

- A domain on Cloudflare DNS (covered in the previous node)
- A Cloudflare API token with permission to edit DNS records for your zone
- Traefik already running from the previous step

## The end state

Once configured, every service you add gets HTTPS automatically:

1. Add a `docker-compose.yml` with Traefik labels
2. `docker compose up -d`
3. Access at `https://servicename.yourdomain.com` — real trusted cert, no warnings

Traefik stores certificates in a local file and renews them before expiry. You set this up once and forget it exists.

<!-- RESOURCES -->

- [Traefik with Docker — full setup guide](https://blog.esc.sh/traefik-docker/) -- type: guide, time: 30min
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) -- type: guide, time: 5min
- [Let's Encrypt](https://letsencrypt.org/) -- type: reference, time: 5min
