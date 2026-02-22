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

Traefik runs as a Docker container alongside your other services. It watches the Docker socket for containers with specific labels, and automatically creates routing rules from those labels. You don't edit Traefik's config every time you add a service — you add labels to the service itself.

<!-- DEEP_DIVE -->

**Setting up Traefik**

Create `~/apps/traefik/docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3
    container_name: traefik
    command:
      - "--api.insecure=true"          # enables the dashboard (disable in production)
      - "--providers.docker=true"       # watch Docker for labeled containers
      - "--providers.docker.exposedbydefault=false"  # don't expose everything automatically
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8888:8080"    # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
```

```bash
cd ~/apps/traefik
docker compose up -d
```

Open `http://YOUR-SERVER-IP:8888` to see the Traefik dashboard. It shows all detected routers, services, and middlewares.

**Exposing a service through Traefik**

Now update your Vaultwarden compose file to add Traefik labels:

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    volumes:
      - ./data:/data
    # Remove the 'ports:' section — Traefik handles routing now
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vaultwarden.rule=Host(`passwords.yourdomain.com`)"
      - "traefik.http.services.vaultwarden.loadbalancer.server.port=80"
    restart: unless-stopped
```

What the labels do:
- `traefik.enable=true`: tell Traefik to manage this container
- `traefik.http.routers.vaultwarden.rule=Host(...)`: route requests for this hostname to this container
- `traefik.http.services.vaultwarden.loadbalancer.server.port=80`: tell Traefik which port the container listens on

Apply the change:

```bash
cd ~/apps/vaultwarden
docker compose up -d
```

Traefik detects the new labels immediately. Open `http://passwords.yourdomain.com` (once your DNS resolves to your server's IP) — it routes straight to Vaultwarden.

**The Docker network**

For Traefik to reach your containers, they need to be on the same Docker network. Create a shared network:

```bash
docker network create proxy
```

Add this to both your Traefik and Vaultwarden compose files:

```yaml
networks:
  proxy:
    external: true

services:
  traefik:   # or vaultwarden
    networks:
      - proxy
```

**Local DNS**

For `passwords.yourdomain.com` to resolve to your server on your home network, you have a few options:

- **Router DNS**: some routers let you set custom DNS entries. Add a wildcard `*.yourdomain.com → 192.168.1.100`.
- **Pi-hole or AdGuard Home**: if you're running a local DNS server, add a local DNS entry there.
- **`/etc/hosts` on each device**: not scalable, but works for a single machine.
- **Real DNS at Cloudflare**: create an A record for `*.yourdomain.com` pointing to your server's local IP (`192.168.1.x`). Cloudflare resolves it, returns the local IP, your browser connects directly. Simple.

The Cloudflare approach is what we'll use when we set up TLS.

<!-- RESOURCES -->

- [Traefik Documentation](https://doc.traefik.io/traefik/) -- type: reference, time: ongoing
- [Traefik Docker Provider](https://doc.traefik.io/traefik/providers/docker/) -- type: reference, time: 20min
