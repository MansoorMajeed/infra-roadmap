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

TODO: Write content for this node. Cover:
- Traefik's model: it watches Docker for containers with traefik labels, auto-creates routing rules
- The compose file for Traefik itself (mount /var/run/docker.sock, define entrypoints)
- Adding traefik labels to a service container (router rule, service port)
- Local DNS: options for *.home.lab — router DNS, Pi-hole, or /etc/hosts
- Traefik dashboard (useful for debugging)
- Keep HTTP only for now — TLS is the next node

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
