---
id: bgp
title: 'BGP: How the Internet Shares Routes'
zone: networking
difficulty: 3
tags:
  - bgp
  - routing
  - autonomous-system
  - internet
  - peering
  - as
category: concept
milestones:
  - Explain what an Autonomous System is and give examples
  - Describe how BGP lets ISPs and networks exchange routing information
  - Understand why a BGP misconfiguration can cause widespread internet outages
---

There are roughly 900,000 routes on the internet. Every major router knows how to reach every network in the world. No one typed those routes in manually — they were learned automatically through **BGP**, the Border Gateway Protocol. BGP is the protocol that lets the internet's networks tell each other "I can reach these IP ranges — send traffic my way." It is the glue that holds the internet together, and when it breaks, large parts of the internet break with it.

<!-- DEEP_DIVE -->

**Autonomous Systems (AS):** The internet is divided into Autonomous Systems — independently operated networks, each with a unique **AS number (ASN)**. Your ISP is an AS. AWS is an AS. Google is an AS. Each AS controls its own IP ranges and its own internal routing. BGP is what happens *between* ASes.

```
AS15169 (Google)     — owns 142.250.0.0/15, 8.8.8.0/24, etc.
AS16509 (Amazon)     — owns 54.0.0.0/8, 52.0.0.0/8, etc.
AS7922  (Comcast)    — your ISP, owns large residential IP blocks
```

**How BGP works:** Each AS announces the IP prefixes it owns to its neighbors. Those neighbors pass the announcements along. Within minutes, every BGP router on the internet knows "to reach 142.250.0.0/15, go toward Google's AS."

```
Google announces: "I own 142.250.0.0/15"
    → Google's peers hear it
    → They tell their peers
    → It propagates globally in minutes
```

When you send a packet to `142.250.80.100`, each router along the way is following a BGP-learned route.

**Why BGP outages are catastrophic:** BGP trusts its neighbors. If an AS accidentally (or maliciously) announces routes it doesn't own — called a **route hijack** — traffic for those IP ranges starts flowing the wrong way. In 2021, Facebook accidentally withdrew their own BGP routes, making Facebook, Instagram, and WhatsApp unreachable globally for 6 hours. In 2010, a Chinese ISP accidentally announced 50,000 incorrect routes, briefly rerouting traffic through China.

BGP is powerful, old, and built on trust. Understanding it explains why "the internet is down" sometimes means a routing misconfiguration thousands of miles away.

<!-- RESOURCES -->

- [BGP Explained - Cloudflare](https://www.cloudflare.com/learning/security/glossary/what-is-bgp/) -- type: article, time: 15m
- [The Internet's Most Fragile System - BGP](https://www.youtube.com/watch?v=wIa_lPBONxE) -- type: video, time: 20m
- [BGP Route Hijacking Explained](https://www.cloudflare.com/learning/security/glossary/bgp-hijacking/) -- type: article, time: 10m
