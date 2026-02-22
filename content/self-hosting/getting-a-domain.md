---
id: "getting-a-domain"
title: "Getting a Domain Name for Your Services"
zone: "self-hosting"
edges:
  from:
    - id: "reverse-proxy"
      question: "How do I get a domain name to route to my services?"
      detail: "A reverse proxy needs a domain name to route traffic by hostname. You have a few options."
  to:
    - id: "tls-with-traefik"
      question: "I have a domain — now I want HTTPS on everything"
      detail: "With a real domain and Cloudflare managing DNS, Traefik can get trusted HTTPS certificates automatically using the DNS challenge — no port forwarding needed."
difficulty: 1
tags: ["self-hosting", "dns", "domain", "cloudflare", "networking"]
category: "concept"
milestones:
  - "Understand the difference between a public domain and a local hostname"
  - "Register a domain or set up a free subdomain"
  - "Point your domain's DNS to Cloudflare"
  - "Understand how split-horizon DNS works (resolving to a local IP from inside your home)"
---

Your reverse proxy routes traffic by hostname — `passwords.yourdomain.com` to Vaultwarden, `photos.yourdomain.com` to Immich. For that to work, you need a domain name and you need DNS to resolve it.

You have two paths: use a real domain (recommended), or use a free subdomain service.

<!-- DEEP_DIVE -->

**Option 1: A real domain name (recommended)**

A `.com` domain costs around $10–12/year. That's less than a single month of most cloud services. It's worth it.

Register one at [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — they charge at-cost with no markup, and using Cloudflare for both registration and DNS simplifies the TLS setup that comes next.

Once you have a domain, you're not exposing your home IP to the world. You'll set up DNS records that point your domain to your server's **local IP** (`192.168.x.x`). These records only resolve correctly from inside your home network — from the outside, the domain leads nowhere useful (unless you want public access, which is a later decision).

**Option 2: Free subdomain services**

If you don't want to pay for a domain yet, [DuckDNS](https://www.duckdns.org/) gives you a free `something.duckdns.org` subdomain. It works, and Traefik supports it for TLS. The downside is you're sharing a domain with everyone else on the service, and some features (like wildcard certs) require more config.

For this guide, we'll assume you have a real domain on Cloudflare. The setup is cleaner and the skills transfer directly to production work.

**Setting up DNS**

Once your domain is on Cloudflare, create DNS records pointing your subdomains to your server's local IP:

```
Type: A
Name: passwords
Content: 192.168.1.100   ← your server's local IP
Proxy status: DNS only (grey cloud, not orange)
```

Do the same for each service. Or set up a wildcard:

```
Type: A
Name: *
Content: 192.168.1.100
Proxy status: DNS only
```

The wildcard means `anything.yourdomain.com` resolves to your server — you don't need a new DNS record for every new service.

**Why "DNS only" (not proxied)?**

Cloudflare can proxy your traffic through their network (the orange cloud). For internal services you're not exposing publicly, set it to DNS only. The orange cloud is for publicly-accessible services and adds Cloudflare's WAF and CDN — overkill for a homelab.

**Split-horizon DNS**

Here's something that trips people up: your laptop inside your home asks "what's the IP of passwords.yourdomain.com?" — the DNS answer points to `192.168.1.100`. It connects to your server directly.

Your phone on mobile data asks the same question — it gets the same DNS answer, but `192.168.1.100` is a private IP, unreachable from the internet. The connection fails. That's expected behavior for an internal service. To access your services from outside, you'd use Tailscale (a future topic) rather than exposing them directly.

<!-- RESOURCES -->

- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) -- type: tool, time: 15min
- [DuckDNS (free subdomain)](https://www.duckdns.org/) -- type: tool, time: 5min
