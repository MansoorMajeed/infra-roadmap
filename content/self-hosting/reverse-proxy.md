---
id: "reverse-proxy"
title: "What Is a Reverse Proxy?"
zone: "self-hosting"
edges:
  from:
    - id: "docker-compose"
      question: "Services are running but I'm tired of remembering port numbers"
  to:
    - id: "traefik"
      question: "Makes sense — show me how to set one up with Docker"
      detail: "Traefik is a reverse proxy built specifically for Docker. It discovers your containers automatically and handles routing with minimal config."
    - id: "getting-a-domain"
      question: "How do I get a domain name to route to my services?"
      detail: "A reverse proxy routes by hostname, so you need a domain. You can use a real one or a free subdomain service."
difficulty: 2
tags: ["self-hosting", "networking", "reverse-proxy", "traefik"]
category: "concept"
milestones:
  - "Understand what a reverse proxy does and why it's useful"
  - "Understand the difference between accessing by IP:port vs by domain name"
---

You have three services running. Vaultwarden on port 8080. Immich on port 2283. Jellyfin on port 8096. To use them, you type `192.168.1.100:8080`, `192.168.1.100:2283`, `192.168.1.100:8096`. You'll inevitably mix them up, type the wrong port, or just get tired of it.

A reverse proxy fixes this. You access everything by name instead of port.

```
passwords.home  →  reverse proxy  →  Vaultwarden (:8080)
photos.home     →  reverse proxy  →  Immich (:2283)
media.home      →  reverse proxy  →  Jellyfin (:8096)
```

<!-- DEEP_DIVE -->

**How it works**

A reverse proxy sits in front of all your services. It listens on port 80 (HTTP) and 443 (HTTPS). When a request comes in, it reads the hostname from the request header and forwards it to the right container.

For this to work, your browser needs to resolve `passwords.home` to your server's IP. That's a DNS question — which is why you'll set up a domain name alongside this.

Your services no longer need to publish ports to the host at all. Only the reverse proxy has open ports. Everything else is internal.

**The options**

Three reverse proxies dominate the self-hosting world:

| Tool | Strength | Interface |
|---|---|---|
| **Nginx Proxy Manager** | Easiest setup, GUI-based | Web UI |
| **Caddy** | Clean config syntax, auto-HTTPS | Config file |
| **Traefik** | Docker-native, auto-discovers containers | Docker labels |

For a Docker-based homelab, **Traefik** is the right choice. It watches Docker for running containers, reads their labels, and automatically creates routing rules. Add a label to your Compose service and Traefik picks it up — no proxy config to edit, no restart required.

It also handles TLS certificates from Let's Encrypt automatically, including renewal. Once configured, you never think about certificates again.

<!-- RESOURCES -->
