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

Port forwarding tells your router: "when traffic arrives on port X from the internet, send it to this local machine." No VPS, no tunnel, no third party. It's the original way to expose a home service, and it works.

But it comes with trade-offs the other options don't. Know what you're getting into.

<!-- DEEP_DIVE -->

## What port forwarding actually does

Your home router has one public IP (assigned by your ISP) and manages a private LAN behind it. Normally, inbound traffic from the internet is dropped — there's no route to your internal machines.

Port forwarding punches a hole: traffic arriving on a specific port gets forwarded to a specific internal IP and port. From the internet, it looks like your router is serving the traffic. In reality, your home server is.

## Your home IP is now public

Unlike Cloudflare Tunnel or a VPS setup, anyone connecting to your service can see your real home IP address. This isn't necessarily a dealbreaker, but it's worth knowing. If you'd prefer to keep your home IP private, use one of the tunnel-based approaches instead.

## ISP restrictions

Many ISPs block inbound traffic on ports 80 (HTTP) and 443 (HTTPS) — the standard web ports. If yours does, you'll have to use non-standard ports like 8080 or 8443, which means URLs like `https://example.com:8443`. Fine for personal use, awkward for anything you're sharing widely.

Some ISPs also use **Carrier Grade NAT (CGNAT)** — they give you a private IP (like `100.x.x.x`) rather than a real public one, and you share a public IP with many other customers. In this case, port forwarding simply doesn't work. You can't forward ports you don't own. If you're behind CGNAT, a tunnel-based approach is your only option.

Check your router's WAN IP. If it looks like `100.x.x.x` or `10.x.x.x`, you're likely behind CGNAT.

## Dynamic DNS

Your ISP changes your home IP periodically — sometimes daily. If you're sharing a URL with anyone, you need it to stay working when the IP changes.

Dynamic DNS (DDNS) solves this: a small client runs on your server (or router), detects when your IP changes, and updates a DNS record automatically. Services like [DuckDNS](https://www.duckdns.org/) (free) or Cloudflare DDNS handle this. Your domain always points to your current home IP.

## Direct internet exposure

With port forwarding, your server is directly reachable from the internet. There's no Cloudflare layer, no VPS in between. Bots will find you and probe for vulnerabilities.

A few things help:
- **Keep software updated** — the most important thing
- **[Fail2ban](https://github.com/fail2ban/fail2ban)** or **[CrowdSec](https://www.crowdsec.net/)** — automatically ban IPs that repeatedly fail authentication
- **Don't expose anything without authentication**

## When this actually makes sense

Port forwarding is a perfectly valid approach when:
- Your ISP doesn't block ports and you're not behind CGNAT
- You're running something personal and IP exposure isn't a concern
- You want zero ongoing cost (no VPS)
- You're comfortable with the security trade-offs

We won't go deeper on the full setup here — this is a signpost. If you go this route, the pieces are: port forward rule in your router settings + DDNS + Traefik is already handling your reverse proxy + keep things patched.

<!-- RESOURCES -->

- [DuckDNS — free dynamic DNS](https://www.duckdns.org/) -- type: tool, time: 10min
- [Fail2ban](https://github.com/fail2ban/fail2ban) -- type: tool, time: 20min
- [CrowdSec](https://www.crowdsec.net/) -- type: tool, time: 20min
