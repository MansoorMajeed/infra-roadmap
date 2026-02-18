---
id: "public-vs-private-ips"
title: "Public vs Private IPs"
zone: "networking"
edges:
  from:
    - id: "subnets-and-cidr"
      question: "I understand how addresses are organized. But why do some IPs only work at home while others work anywhere on the internet?"
      detail: "You know how subnets organize IP addresses into groups. Now there's a deeper split: some IP address ranges are reserved for private networks (like your home), and others are public — routable across the entire internet. Understanding this distinction explains NAT, why you can't host a server at home easily, and how cloud infrastructure is designed."
  to:
    - id: "where-do-i-run-this"
      question: "I understand addressing — private networks, public IPs, NAT. But where do I actually run something that serves content?"
      detail: "You know how IP addressing works: private addresses for internal networks, public addresses for the internet, NAT bridging the two. But what is sitting at the other end of those public IP addresses? You need a machine with a public IP that is always on — not hidden behind NAT. Where does your app actually go?"
    - id: "dns"
      question: "I understand public IPs. But nobody types IP addresses — they type domain names. How does that translation work?"
      detail: "You understand that servers have public IPs and that the internet routes packets to them. But when you type google.com, your computer doesn't know Google's IP — it has to ask. That asking, and the system that answers, is DNS. It runs silently before every web request, every email, every API call."
    - id: "how-packets-travel"
      question: "I know about public IPs. But how does a packet actually travel across the internet to reach one?"
      detail: "You understand that public IPs are routable across the internet. But what does that journey look like in practice? A packet from your laptop to a server in Tokyo might hop through a dozen routers, crossing ISP networks and undersea cables. Each router makes an independent decision. Understanding this journey is understanding how the internet fundamentally works."
difficulty: 2
tags: ["ip", "nat", "private", "public", "ipv4", "network"]
category: "concept"
milestones:
  - "Identify the three private IP ranges and what each is typically used for"
  - "Explain how NAT lets many devices share one public IP"
  - "Describe why you can browse any website but can't easily receive incoming connections at home"
---

Your laptop's IP is `192.168.1.42`. But if you asked a friend across the country to connect to your laptop at that address, it would not work. That address does not exist on the public internet — it only exists on your home network. There are two completely separate worlds of IP addresses: **private** (inside a network) and **public** (routable everywhere on the internet). Understanding the difference explains NAT, cloud networking, and why hosting from home is complicated.

<!-- DEEP_DIVE -->

**Private IP ranges** are reserved address blocks defined in RFC 1918. They can be freely used inside any private network. Crucially, routers on the public internet will never forward packets to these addresses — they exist only within local networks:

| Range | CIDR | Typically used for |
|-------|------|--------------------|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Cloud VPCs, corporate networks |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Docker default bridge network |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Home routers |

Your router assigns addresses from one of these ranges to your devices. Your neighbor's router does the same. You might both have a `192.168.1.42` on your respective networks, and that is perfectly fine — because neither of those addresses is visible on the internet.

**Public IP addresses** are globally unique, allocated by IANA and distributed through ISPs. Every packet on the internet has a public source and destination IP. When your web server is reachable at `104.21.4.56` — that is a public IP. Routers worldwide know how to forward packets to it.

**NAT (Network Address Translation)** is what lets your entire home share a single public IP. Your ISP gives your router one public IP. Your router gives your devices private addresses. NAT bridges them:

```
Request from your laptop:
  Source:      192.168.1.42:54321   (private, invisible to internet)
  Destination: 142.250.80.100:443   (google.com)

Router (NAT) rewrites the packet:
  Source:      73.42.100.15:60000   (your public IP)
  Destination: 142.250.80.100:443

NAT table entry: 73.42.100.15:60000 ↔ 192.168.1.42:54321

Response comes back to 73.42.100.15:60000
  → Router looks up NAT table
  → Rewrites destination to 192.168.1.42:54321
  → Delivers to your laptop
```

Your router tracks each outgoing connection and knows where to send incoming replies. This works great for browsing — your devices initiate the connections. It breaks down for hosting: nobody on the internet can initiate a connection to `192.168.1.42` because:
1. They don't know that address exists
2. Even if they tried, packets sent to `192.168.1.42` on the internet would be dropped

This is why running a server at home requires port forwarding — you configure your router to forward incoming connections on a specific port to a specific internal device. It works, but it is manual, fragile, and only one device can use each port.

**Cloud infrastructure makes this pattern explicit and intentional:**

```
Internet
    ↓
Load Balancer  ← public IP (104.21.4.56) — this is what the internet talks to
    ↓
App Servers    ← private IPs (10.0.1.5, 10.0.1.6) — only reachable inside the VPC
    ↓
Database       ← private IP (10.0.20.10) — no public IP at all
```

Your database has no public IP. It is only reachable from inside the VPC, from trusted services. Your load balancer has a public IP — it's the one entry point from the internet. This is deliberate security design: minimize what's exposed, protect everything else behind private addresses.

When you see `0.0.0.0/0` in a firewall rule or route table, it means "all addresses" — shorthand for "the entire internet."

```bash
# See your public IP (what the internet sees)
curl https://api.ipify.org

# See your private IP (what your local network sees)
ip addr show       # Linux
ifconfig en0       # macOS

# These will be different — that gap is NAT
```

<!-- RESOURCES -->

- [Cloudflare - What is NAT?](https://www.cloudflare.com/learning/network-layer/what-is-nat/) -- type: article, time: 10m
- [RFC 1918 - Private Address Space](https://datatracker.ietf.org/doc/html/rfc1918) -- type: reference, time: 10m
- [Julia Evans - Networking Zine](https://wizardzines.com/zines/networking/) -- type: zine, time: 15m
