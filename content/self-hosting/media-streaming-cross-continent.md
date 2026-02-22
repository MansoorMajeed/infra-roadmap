---
id: "media-streaming-cross-continent"
title: "Streaming Across Continents"
zone: "self-hosting"
edges:
  from:
    - id: "vps-wireguard-expose"
      question: "My distant users get buffering — can I fix cross-continent streaming?"
  to: []
difficulty: 3
tags: ["self-hosting", "media", "streaming", "vps", "cdn", "nginx", "jellyfin", "plex", "dns"]
category: "practice"
milestones:
  - "Understand why cross-continent streaming fails on public internet paths"
  - "Provision a second VPS in a region close to your users"
  - "Configure the regional VPS to proxy to your origin VPS"
  - "Set up latency-based DNS routing to direct users to their nearest VPS"
  - "Verify 4K streaming works from the remote region"
---

Your home server is in North America. A friend in Asia tries to stream 4K — it buffers constantly. The problem isn't your upload speed or their download speed: it's the path the packets take between the two continents.

The fix is a second cheap VPS near your users, with DNS routing them to it automatically. Traffic between your two VPS nodes travels over the cloud provider's backbone instead of congested public internet. This is a pattern documented in detail at **[Plex 4K Streaming and Cross-Continent Playback](https://blog.esc.sh/plex-cross-continent-4k-streaming/)**.

<!-- DEEP_DIVE -->

## Why it buffers

Public internet routing between continents is unpredictable. Packets from Asia to North America can bounce through multiple carrier handoffs, each adding latency and congestion risk. A 4K stream needs sustained throughput — any congestion event causes a buffer.

This is not a latency problem. Even 150ms round-trip is fine for streaming. The issue is **packet loss and throughput drops** on congested inter-carrier links.

## The poor man's CDN

Big CDNs solve this by having servers everywhere. You can approximate this with two cheap VPS nodes and latency-based DNS:

```
User in Asia
     │
     ▼ (DNS → nearest VPS)
 Asia VPS  ──── cloud backbone ────  US VPS  ── WireGuard ──  Home Server
(nginx proxy)                      (nginx proxy)
```

- **US VPS** — already set up from the previous node. Proxies to your home server via WireGuard.
- **Asia VPS** — new. Proxies to the US VPS over the cloud provider's internal network.
- **DNS** — latency-based routing sends each user to the nearest VPS automatically.

The key insight: traffic between two VPS nodes at the same provider travels the provider's private backbone, not the public internet. Linode (Akamai) nodes between regions use Akamai's backbone. This dramatically reduces packet loss compared to consumer ISP paths.

## Why Linode/Akamai specifically

Linode is now part of Akamai, which operates one of the largest private backbone networks in the world. When you run two Linode VMs in different regions, inter-VM traffic routes over that backbone — the same infrastructure that major CDNs use. A $5–6/month node in Tokyo and another in Newark gives you a path that avoids most of the congested public peering points.

Other providers work too, but the backbone quality varies. Akamai/Linode is the choice documented in **[the original writeup](https://blog.esc.sh/plex-cross-continent-4k-streaming/)** for this pattern.

## Step 1: Provision the regional VPS

Pick a Linode (or equivalent) in a region close to your users — Tokyo, Singapore, Frankfurt, etc. Same specs as your US VPS: cheapest tier, enough bandwidth.

Install nginx:

```bash
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx
```

## Step 2: Configure nginx on the regional VPS

The regional VPS proxies to your US VPS (not directly to your home server):

```nginx
server {
    server_name media.yourdomain.com;

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/media.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/media.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    # Disable buffering — pass bytes through immediately
    proxy_buffering off;
    proxy_request_buffering off;

    # Point to your US VPS hostname
    proxy_pass https://media-us.yourdomain.com;
    proxy_set_header Host media-us.yourdomain.com;
    proxy_set_header X-Real-IP $remote_addr;

    client_max_body_size 100M;
}
```

Key settings for media streaming:
- `proxy_buffering off` — nginx passes data through as it arrives rather than buffering the whole response. Essential for video.
- `proxy_request_buffering off` — same for uploads (playback position sync, etc).

Get the cert:

```bash
sudo certbot --nginx -d media.yourdomain.com
```

## Step 3: DNS with latency-based routing

You need DNS that routes each user to their nearest VPS. Two options:

**AWS Route 53 (straightforward):** Create two A records for `media.yourdomain.com` — one pointing to your US VPS IP, one to your Asia VPS IP — both with a **Latency** routing policy and their respective regions. Route 53 resolves to whichever has lower latency from the user's location. Cost: ~$0.50/month for a hosted zone plus minimal query costs.

**Cloudflare Load Balancing:** Cloudflare's load balancer with geographic steering does the same thing. Costs more than Route 53 for this use case.

Either way, give the regional record a shorter TTL (60s) so failover works if a VPS goes down.

## Step 4: US VPS — nothing changes

Your US VPS already proxies to your home server via WireGuard. No changes needed there. The Asia VPS just treats the US VPS as its upstream.

## What this solves and what it doesn't

This fixes throughput problems caused by congested public internet paths. It does not reduce round-trip latency — that's physical distance and can't be fixed without a server closer to the user.

For most media streaming use cases (Jellyfin, Plex), latency doesn't matter. Buffering does. This pattern eliminates the buffering.

Cost: one extra VPS, ~$5–6/month. For multiple distant regions, add more nodes — the pattern scales linearly.

<!-- RESOURCES -->

- [Plex 4K Cross-Continent Streaming](https://blog.esc.sh/plex-cross-continent-4k-streaming/) -- type: guide, time: 20min
- [Expose Self-Hosted Services to the Internet](https://blog.esc.sh/expose-selfhosted-services-to-internet/) -- type: guide, time: 30min
- [AWS Route 53 Latency Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-latency.html) -- type: reference, time: 10min
