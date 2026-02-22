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
  - "Get a domain name (or use a free one)"
  - "Configure Traefik with a Let's Encrypt certificate resolver"
  - "Use Cloudflare DNS challenge (no port forwarding needed)"
  - "Access all your services over HTTPS"
---

Vaultwarden won't let you use its browser extension without HTTPS. Many modern browser APIs require a secure context. And plain HTTP means your passwords travel unencrypted over your local network.

HTTPS matters even for internal services. Fortunately, with Traefik and Cloudflare, it's nearly automatic.

<!-- DEEP_DIVE -->

**Let's Encrypt and the DNS challenge**

[Let's Encrypt](https://letsencrypt.org/) issues free, trusted TLS certificates, automatically renewed. Traefik has built-in support.

The usual way Let's Encrypt verifies you own a domain is the **HTTP challenge**: it makes an HTTP request to your domain and expects a specific response. That requires port 80 to be open to the internet — not ideal for a home server.

The alternative is the **DNS challenge**: instead of serving a file over HTTP, you prove domain ownership by creating a DNS record. Let's Encrypt tells Traefik "create a TXT record with this value". Traefik tells Cloudflare (via API) to create it. Let's Encrypt checks the DNS record. Certificate issued.

The entire challenge happens over DNS. Your home server never needs to be reachable from the internet.

**Setting up the Cloudflare API token**

In Cloudflare:
1. Go to **My Profile → API Tokens → Create Token**
2. Use the **Edit zone DNS** template
3. Under **Zone Resources**, select your specific domain
4. Create the token and copy it — you'll only see it once

**Updated Traefik compose file**

```yaml
services:
  traefik:
    image: traefik:v3
    container_name: traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      # Let's Encrypt config
      - "--certificatesresolvers.cloudflare.acme.dnschallenge=true"
      - "--certificatesresolvers.cloudflare.acme.dnschallenge.provider=cloudflare"
      - "--certificatesresolvers.cloudflare.acme.email=you@example.com"
      - "--certificatesresolvers.cloudflare.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8888:8080"
    environment:
      - CF_DNS_API_TOKEN=your-cloudflare-api-token
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt    # stores certificates
    networks:
      - proxy
    restart: unless-stopped

networks:
  proxy:
    external: true
```

**Updated service labels for HTTPS**

Update your Vaultwarden labels:

```yaml
labels:
  - "traefik.enable=true"
  # HTTP router — redirect to HTTPS
  - "traefik.http.routers.vaultwarden-http.rule=Host(`passwords.yourdomain.com`)"
  - "traefik.http.routers.vaultwarden-http.entrypoints=web"
  - "traefik.http.routers.vaultwarden-http.middlewares=redirect-https"
  # HTTPS router
  - "traefik.http.routers.vaultwarden.rule=Host(`passwords.yourdomain.com`)"
  - "traefik.http.routers.vaultwarden.entrypoints=websecure"
  - "traefik.http.routers.vaultwarden.tls=true"
  - "traefik.http.routers.vaultwarden.tls.certresolver=cloudflare"
  - "traefik.http.services.vaultwarden.loadbalancer.server.port=80"
  # Shared middleware
  - "traefik.http.middlewares.redirect-https.redirectscheme.scheme=https"
```

**What happens when you start it**

On first boot, Traefik requests a certificate from Let's Encrypt using the DNS challenge. It creates a TXT record in Cloudflare, Let's Encrypt validates it, and issues a wildcard or per-domain certificate. This takes about 30–60 seconds.

After that, Traefik stores the certificate in `./letsencrypt/acme.json` and renews it automatically before expiry. You never touch certificates again.

Open `https://passwords.yourdomain.com`. You get a trusted HTTPS connection with a real Let's Encrypt certificate. No browser warnings, no exceptions needed.

**The end state**

Every service you add gets HTTPS automatically:
1. Add `docker-compose.yml` with Traefik labels
2. `docker compose up -d`
3. Access at `https://servicename.yourdomain.com`

No port numbers. No certificate management. No port forwarding. Your services are accessible from any device on your home network over HTTPS, with real trusted certificates.

<!-- RESOURCES -->

- [Traefik Let's Encrypt Documentation](https://doc.traefik.io/traefik/https/acme/) -- type: reference, time: 20min
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) -- type: guide, time: 5min
- [Let's Encrypt](https://letsencrypt.org/) -- type: reference, time: 5min
