---
id: "public-website"
title: "Public Website or Web App"
zone: "self-hosting"
edges:
  from:
    - id: "public-access-security"
      question: "Got it — my service is a website or web app"
  to:
    - id: "cloudflare-tunnel"
      question: "I want the simplest managed option"
    - id: "vps-pangolin"
      question: "I want a self-hosted VPS solution with a UI"
    - id: "vps-wireguard-expose"
      question: "I want full control — VPS with manual setup"
    - id: "port-forwarding"
      question: "What about just forwarding a port on my router?"
difficulty: 1
tags: ["self-hosting", "public", "website", "web-app"]
category: "concept"
milestones:
  - "Know the approaches for exposing a public web service and their trade-offs"
---

You're running a website, blog, or web app that anyone should be able to reach. HTTP and HTTPS traffic — no raw TCP, no media streaming with large files.

You have a few paths, ranging from "it just works" to "full control over every piece."

<!-- DEEP_DIVE -->

## Your options

### Cloudflare Tunnel — easiest, free, hides your home IP

An outbound connection from your server to Cloudflare's network. No open ports, no exposed home IP. Cloudflare handles HTTPS. You configure hostnames in their dashboard and traffic flows in through Cloudflare.

Best for: websites, APIs, anything HTTP. Not allowed for video streaming (Cloudflare's TOS).

### VPS + Pangolin — self-hosted, with a UI

You rent a cheap VPS (~$5/month), run Pangolin on it, and it creates a tunnel back to your home server. Similar concept to Cloudflare Tunnel but you own the VPS. Pangolin gives you a web UI to manage tunnels and hostnames.

Best for: people who want to avoid Cloudflare dependency and prefer a managed UI over manual config.

### VPS + WireGuard + nginx — full control, no extra software

A WireGuard tunnel from your home server to the VPS, then nginx on the VPS proxies public traffic through the tunnel. No special software — just WireGuard and a reverse proxy you almost certainly already know. Works for websites, media, any protocol.

Best for: advanced users who are comfortable with Linux and want the cleanest, most portable setup without adding Pangolin as a dependency.

### Port forwarding — the direct approach

Open a port on your router, traffic goes straight to your home server. No VPS cost, works for anything. Your home IP is exposed, ISP may block standard ports, dynamic DNS required.

Best for: personal projects where IP exposure isn't a concern and you want the simplest possible setup.

<!-- RESOURCES -->
