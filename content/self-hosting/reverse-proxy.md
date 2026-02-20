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
difficulty: 2
tags: ["self-hosting", "networking", "reverse-proxy", "traefik"]
category: "concept"
milestones:
  - "Understand what a reverse proxy does and why it's useful"
  - "Understand the difference between accessing by IP:port vs by domain name"
---

TODO: Write content for this node. Cover:
- The problem: you have Vaultwarden on :8080, Immich on :2283, Jellyfin on :8096. Remembering ports sucks.
- What a reverse proxy does: sits in front of all your services, routes by hostname
  - passwords.home → :8080
  - photos.home → :2283
  - media.home → :8096
- How it works: DNS (or /etc/hosts) points *.home to your server's IP; the proxy reads the hostname and forwards to the right container
- Common options: Nginx Proxy Manager (GUI), Caddy, Traefik
- Why Traefik here: Docker-native, auto-discovers containers via labels, handles TLS automatically

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
