---
id: "how-packets-travel"
title: "How Packets Travel the Internet"
zone: "networking"
edges:
  from:
    - id: "subnets-and-cidr"
      question: "Traffic between subnets needs a router. But how does a router know where to send a packet?"
      detail: "You know that packets between subnets must pass through a router, and that routing tables tell a device where to forward traffic. But your routing table only has a few entries — 'local subnet: direct' and 'everything else: send to gateway.' What happens after that gateway? How does a packet find its way across the internet through potentially dozens of routers?"
    - id: "public-vs-private-ips"
      question: "I know about public IPs. But how does a packet actually travel across the internet to reach one?"
      detail: "You understand that public IPs are routable across the internet. But what does that journey look like in practice? A packet from your laptop to a server in Tokyo might hop through a dozen routers, crossing ISP networks and undersea cables. Each router makes an independent decision. Understanding this journey is understanding how the internet fundamentally works."
  to:
    - id: "bgp"
      question: "I understand how routers forward packets. But how do they know about all the routes on the internet?"
      detail: "My home router just has 'send everything to my ISP' — but somehow ISPs and major networks know about every IP block on the internet. Nobody manually configured millions of routes on millions of routers. Something must be letting them share and update that knowledge automatically. How does a router on one continent know how to reach a network it's never directly connected to?"
difficulty: 2
tags: ["routing", "packets", "ttl", "traceroute", "hops", "gateway", "internet"]
category: "concept"
milestones:
  - "Describe what happens at each hop as a packet travels to its destination"
  - "Run traceroute and interpret the output"
  - "Explain what TTL is and why it exists"
---

Your laptop sends a packet to a server on the other side of the world. Between you and it: a dozen routers across multiple countries, owned by different companies. Your packet didn't teleport — it **hopped**. Each router received the packet, looked at the destination IP, made a decision about where to forward it next, and sent it on its way. Understanding those decisions is understanding how the internet actually works.

<!-- DEEP_DIVE -->

**The journey of a packet:**

```
Your laptop (192.168.1.42)
    ↓  "I need to reach 142.250.80.100 — not on my subnet, send to default gateway"
Your home router (192.168.1.1 / 73.42.100.15)
    ↓  "142.250.80.100 — not mine, forward to my ISP"
Your ISP's router
    ↓  "That's a Google IP — forward toward Google's network"
Peering point / transit router
    ↓  "Getting closer — forward to Google's AS"
Google's edge router
    ↓  "That's our IP — deliver to the data center"
Google's server (142.250.80.100)
```

Each router only needs to know the *next hop*, not the full path. Like giving directions one intersection at a time.

**TTL (Time to Live):** Every IP packet carries a TTL — a counter that starts at 64 or 128 and decrements by 1 at each router. If it hits zero, the router drops the packet and sends an "ICMP Time Exceeded" message back. This prevents packets from looping forever when routing goes wrong.

**traceroute** exploits TTL to map the path:

```bash
traceroute google.com
# or on macOS
traceroute google.com

# Windows
tracert google.com

# Example output:
#  1  192.168.1.1 (your router)       1ms
#  2  10.0.0.1 (ISP first hop)        8ms
#  3  72.14.232.1 (ISP backbone)      12ms
#  4  142.250.80.100 (Google)         15ms
```

Each line is one hop. The IP is that router's address. The time is the round-trip latency to that point. `* * *` means the router didn't respond (common — many routers silently drop TTL-expired packets).

**How routers build their tables:** Your home router knows two things: your local subnet (direct) and everything else (send to ISP). Your ISP's routers know far more — they've learned routes from other ISPs and large networks through a routing protocol. That protocol — how the internet's routers collectively figure out paths to every network — is BGP.

<!-- RESOURCES -->

- [How Routing Works - Cloudflare](https://www.cloudflare.com/learning/network-layer/what-is-routing/) -- type: article, time: 10m
- [Traceroute Explained](https://www.cloudflare.com/learning/network-layer/what-is-traceroute/) -- type: article, time: 10m
- [Packet Traveling - Practical Networking](https://www.practicalnetworking.net/series/packet-traveling/packet-traveling/) -- type: series, time: 1h
