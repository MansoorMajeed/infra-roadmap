---
id: "traefik"
title: "Traefik as Your Reverse Proxy"
zone: "self-hosting"
edges:
  from:
    - id: "reverse-proxy"
      question: "Makes sense — show me how to set one up with Docker"
  to:
    - id: "tls-with-traefik"
      question: "Routing works — now I want HTTPS on everything"
      detail: "Traefik can get HTTPS certificates automatically via Let's Encrypt. With Cloudflare DNS, you don't even need to open a port to the internet."
difficulty: 2
tags: ["self-hosting", "traefik", "reverse-proxy", "docker", "networking"]
category: "tool"
milestones:
  - "Run Traefik as a Docker container with a compose file"
  - "Expose Vaultwarden through Traefik using Docker labels"
  - "Access Vaultwarden by hostname instead of IP:port"
  - "Access the Traefik dashboard"
---

Traefik runs as a Docker container alongside your other services. It watches the Docker socket for running containers, reads their labels, and automatically creates routing rules — no config file to edit every time you add a service.

The mental model: you add a few labels to any container telling Traefik "route `passwords.yourdomain.com` to me on port 80", and it picks that up immediately.

For the full setup walkthrough, follow this guide: **[Traefik with Docker — blog.esc.sh](https://blog.esc.sh/traefik-docker/)**

<!-- DEEP_DIVE -->

## How Traefik works

Traefik needs access to the Docker socket (`/var/run/docker.sock`) so it can watch what containers are running. When a container starts with `traefik.enable=true` in its labels, Traefik reads the rest of the labels and creates a router automatically.

The key labels on any service you want to expose:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.myservice.rule=Host(`myservice.yourdomain.com`)"
  - "traefik.http.services.myservice.loadbalancer.server.port=80"
```

That's the core of it. Traefik handles the rest.

## The shared Docker network

Traefik needs to be on the same Docker network as the containers it routes to. The standard approach is a single shared network — create it once:

```bash
docker network create proxy
```

Then attach both Traefik and your services to it. The detailed setup in the blog post above covers this end to end.

## Local DNS

For `myservice.yourdomain.com` to resolve to your server on your home network, set up a wildcard DNS record pointing to your server's local IP — either in your router, in Pi-hole/AdGuard, or directly in Cloudflare (recommended, since Cloudflare is already managing your domain for TLS).

<!-- RESOURCES -->

- [Traefik with Docker — full setup guide](https://blog.esc.sh/traefik-docker/) -- type: guide, time: 30min
- [Traefik Documentation](https://doc.traefik.io/traefik/) -- type: reference, time: ongoing
