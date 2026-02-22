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
  - "Know the three approaches for exposing a public web service"
---

You're running a website, blog, or web app that you want anyone on the internet to reach. HTTP and HTTPS traffic only — no raw TCP, no media streaming.

You have three paths depending on how much you want to manage.

<!-- DEEP_DIVE -->

## TODO

- TODO: briefly describe the three options and their trade-offs
  - Cloudflare Tunnel: easiest, free, hides your home IP — but Cloudflare sits in the middle, and TOS bans video proxying
  - VPS + Pangolin: self-hosted, you own the VPS, good UI — slightly more to manage
  - VPS + WireGuard + nginx: most control, no extra software layer, but fully manual — great for the advanced user who prefers running nginx directly over managing Pangolin
- TODO: how to pick — if you just want it to work, Cloudflare Tunnel. If you want to avoid Cloudflare dependency, go VPS. If you're comfortable with Linux, the raw WireGuard + nginx approach is clean and powerful.

<!-- RESOURCES -->

- TODO: add resources
