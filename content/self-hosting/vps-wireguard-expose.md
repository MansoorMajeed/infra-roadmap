---
id: "vps-wireguard-expose"
title: "VPS + WireGuard: Full Control, No Extra Software"
zone: "self-hosting"
edges:
  from:
    - id: "public-website"
      question: "I want full control — VPS with manual setup"
    - id: "public-media-streaming"
      question: "I want full control — VPS with manual setup"
  to:
    - id: "media-streaming-cross-continent"
      question: "My distant users get buffering — can I fix cross-continent streaming?"
      detail: "Friends or family far away get constant buffering even though my internet is fast. Is it my upload speed, the physical distance, or something about how the VPS is placed?"
difficulty: 3
tags: ["self-hosting", "vps", "wireguard", "nginx", "tunnel", "public"]
category: "practice"
milestones:
  - "Provision a VPS and install WireGuard on it"
  - "Configure WireGuard on your home server to tunnel to the VPS"
  - "Bring up the WireGuard tunnel and verify connectivity"
  - "Install nginx on the VPS and proxy a public hostname to your home service via the tunnel"
  - "Add HTTPS with Let's Encrypt or Caddy"
  - "Verify the service is reachable publicly"
---

A VPS runs WireGuard and nginx. Your home server connects to the VPS as a WireGuard peer. Traffic arrives at the VPS's public IP, nginx proxies it through the private WireGuard tunnel to your home service — which Cloudflare never touches, and which requires no special software beyond tools you already know.

This approach works for everything: websites, media streaming, any TCP service. No TOS restrictions, no vendor lock-in, and no extra software layer beyond WireGuard and a reverse proxy.

For the setup guides: **[WireGuard VPN Setup — blog.esc.sh](https://blog.esc.sh/wireguard-vpn-setup/)** and **[Expose Self-Hosted Services to the Internet — blog.esc.sh](https://blog.esc.sh/expose-selfhosted-services-to-internet/)**

<!-- DEEP_DIVE -->

## The architecture

```
Internet → VPS public IP → nginx → WireGuard tunnel → your home server → service
                           (10.0.0.1)               (10.0.0.2)
```

The VPS has a public IP. Your home server connects to it as a WireGuard peer and gets a private tunnel IP (`10.0.0.2`). nginx on the VPS proxies incoming requests to `10.0.0.2:<port>` — your home server, through the tunnel.

## Step 1: Set up WireGuard on the VPS

Install WireGuard and generate a key pair:

```bash
sudo apt update && sudo apt install wireguard
wg genkey | sudo tee /etc/wireguard/privatekey | wg pubkey | sudo tee /etc/wireguard/publickey
sudo chmod 400 /etc/wireguard/privatekey
```

VPS config (`/etc/wireguard/wg0.conf`):

```ini
[Interface]
Address = 10.0.0.1/24
PrivateKey = <VPS private key>
ListenPort = 51820

[Peer]
PublicKey = <home server public key>
AllowedIPs = 10.0.0.2/32
```

Start it:

```bash
sudo systemctl enable --now wg-quick@wg0
```

## Step 2: Set up WireGuard on your home server

Same installation process. Home server config:

```ini
[Interface]
PrivateKey = <home server private key>
Address = 10.0.0.2/32

[Peer]
PublicKey = <VPS public key>
Endpoint = <VPS public IP>:51820
AllowedIPs = 10.0.0.1/32
PersistentKeepalive = 25
```

**Important:** `AllowedIPs = 10.0.0.1/32` — only route traffic destined for the VPS tunnel IP through WireGuard. Do **not** set `0.0.0.0/0` here, or all your home server's internet traffic will route through the VPS.

Start it and verify connectivity:

```bash
sudo systemctl enable --now wg-quick@wg0
ping -c 2 10.0.0.1   # should work from home server
```

From the VPS, verify the home server is reachable through the tunnel:

```bash
ping -c 2 10.0.0.2
curl 10.0.0.2:8096    # test reaching Jellyfin (or whatever port)
```

## Step 3: Point DNS to your VPS

Add an A record in your DNS provider pointing your domain (or subdomain) to the VPS's public IP.

## Step 4: Install nginx on the VPS and proxy to home

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Create a site config (`/etc/nginx/sites-enabled/myservice.yourdomain.com`):

```nginx
server {
    server_name myservice.yourdomain.com;

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/myservice.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myservice.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;

    location / {
        proxy_pass http://10.0.0.2:8096;   # tunnel IP + your service port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name myservice.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

Get a TLS certificate:

```bash
sudo certbot --nginx -d myservice.yourdomain.com
sudo systemctl reload nginx
```

Alternatively, **Caddy** handles TLS automatically with far less config — just `reverse_proxy 10.0.0.2:8096` and it fetches the cert itself.

## Why this is often the better choice

Compared to Pangolin, there's no extra software layer to maintain — just WireGuard and nginx/Caddy, two tools with decades of documentation and wide community knowledge. If something breaks, the debugging surface is small and well-understood.

Compared to Cloudflare Tunnel, your traffic never passes through a third party, and there are no TOS restrictions — stream all the media you want.

The trade-off is that the setup is fully manual. Changing the WireGuard config, managing nginx vhosts, and renewing certs are your responsibility. It's not hard, but it's more work than a managed UI.

<!-- RESOURCES -->

- [WireGuard VPN Setup Guide](https://blog.esc.sh/wireguard-vpn-setup/) -- type: guide, time: 30min
- [Expose Self-Hosted Services to the Internet](https://blog.esc.sh/expose-selfhosted-services-to-internet/) -- type: guide, time: 30min
- [Caddy Server (auto-HTTPS reverse proxy)](https://caddyserver.com/) -- type: reference, time: 15min
- [WireGuard Quick Start](https://www.wireguard.com/quickstart/) -- type: reference, time: 15min
