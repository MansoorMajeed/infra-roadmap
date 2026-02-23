---
id: network-protocols
title: What Are Protocols?
zone: networking
edges:
  to:
    - id: tcp-udp-basics
      question: >-
        I get why protocols exist. Now what are the actual protocols that move
        data around?
      detail: >-
        I get that protocols are rules computers agree to follow. But what are
        the actual rules that move data between my machine and a server? There
        must be specific protocols doing the heavy lifting — what are they and
        what does each one do?
    - id: ip-addresses
      question: >-
        Protocols have layers, and one layer handles addressing. How do IP
        addresses actually work?
      detail: >-
        I understand that networking has layers and each layer has a job. The
        network layer handles addressing — but what does that actually mean in
        practice? Every device must have some kind of address for packets to
        find it. What are those addresses and how do they actually work?
difficulty: 1
tags:
  - protocols
  - networking
  - layers
  - osi
  - tcp-ip
  - communication
category: concept
milestones:
  - Explain what a protocol is and why networked computers need them
  - Describe the purpose of different networking layers
  - 'Identify which layer common protocols belong to (HTTP, TCP, IP, Ethernet)'
---

Two computers are connected. You can ping one from the other. But ping just says "yes, I can reach you." How do you actually send meaningful data? If your laptop sends a stream of bytes to your phone, how does the phone know if it is a web page, an email, a video, or garbage? The answer: both sides agree on rules ahead of time. Those rules are **protocols**.

<!-- DEEP_DIVE -->

A **protocol** is just an agreement about how to communicate. Humans do this too. When you call someone on the phone, there is an unspoken protocol: one person says hello, the other responds, they take turns talking, and one of them eventually says goodbye. If one person just started shouting random words without waiting for a response, communication would break down. Computers are the same — they need structure.

**Why not just one protocol?** Because communication has different problems at different levels. Consider sending a letter:

1. You **write the letter** in English (the language you both understand)
2. You **put it in an envelope** with the recipient's address
3. The **postal service** figures out which trucks and planes to use
4. The **truck driver** follows roads to physically move it

Each step has its own rules. The language rules do not care about which truck carries the letter. The truck driver does not need to read English. Each layer does one job and trusts the others to do theirs.

Networking works the same way, organized into **layers**:

```
┌─────────────────────────────────────────────┐
│  Application Layer (HTTP, DNS, SMTP, SSH)   │ ← What the data means
├─────────────────────────────────────────────┤
│  Transport Layer (TCP, UDP)                 │ ← Reliable or fast delivery
├─────────────────────────────────────────────┤
│  Network Layer (IP)                         │ ← Addressing and routing
├─────────────────────────────────────────────┤
│  Link Layer (Ethernet, WiFi)                │ ← Physical transmission
└─────────────────────────────────────────────┘
```

When you load a web page, here is what happens at each layer:

1. **Your browser** creates an HTTP request — "GET me the page at /products" (Application)
2. **TCP** wraps that request in a segment, adds sequence numbers for reliability (Transport)
3. **IP** wraps the segment in a packet, adds source and destination IP addresses (Network)
4. **Ethernet/WiFi** wraps the packet in a frame, adds MAC addresses, sends it as electrical signals or radio waves (Link)

On the other end, the process reverses — each layer peels off its wrapper and passes the contents up to the next layer, until the web server gets the original HTTP request.

Think of it as an **envelope inside an envelope inside an envelope**:

```
┌─────────────────────────────────────────────┐
│ Ethernet Frame                              │
│  ┌──────────────────────────────────────┐   │
│  │ IP Packet                            │   │
│  │  ┌───────────────────────────────┐   │   │
│  │  │ TCP Segment                   │   │   │
│  │  │  ┌────────────────────────┐   │   │   │
│  │  │  │ HTTP Request           │   │   │   │
│  │  │  │ "GET /products"        │   │   │   │
│  │  │  └────────────────────────┘   │   │   │
│  │  └───────────────────────────────┘   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**This layering is why the internet works.** HTTP does not care whether you are on WiFi or Ethernet. TCP does not care whether you are loading a web page or sending an email. IP does not care what the data is — it just routes packets to the right address. Each protocol does one job well and does not worry about the rest.

You have already seen some of these protocols without realizing it:

- When you typed `http://192.168.1.42:5000` in your phone's browser — that is **HTTP** (application layer) over **TCP** (transport) over **IP** (network) over **WiFi** (link)
- When you used `ping` — that uses **ICMP** (a network layer protocol), which rides directly on **IP**
- Your router assigning IP addresses — that is **DHCP**, an application layer protocol
- Your devices finding each other's hardware addresses — that is **ARP**, a link layer protocol

**The key takeaway:** You do not need to memorize the layers or know every protocol. What matters is the concept: networking is built in layers, each layer solves one problem, and protocols are just the rules for each layer. Once you understand this, every new protocol you encounter — TCP, UDP, HTTP, DNS, TLS — slots into place naturally.

The next step is to learn the specific protocols that matter most. At the transport layer, there are really only two: **TCP** (reliable, careful, connection-oriented) and **UDP** (fast, fire-and-forget). Everything on the internet uses one of them, and understanding the difference is fundamental.

<!-- RESOURCES -->

- [Khan Academy - Internet Protocols](https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:the-internet/xcae6f4a7ff015e7d:the-internet-protocol-suite/a/the-internet-protocols) -- type: interactive, time: 15m
- [How Does the Internet Work? (Stanford)](https://web.stanford.edu/class/msande91si/www-spr04/readings/week1/InternetWhitepaper.htm) -- type: article, time: 30m
- [Cloudflare - What is a network protocol?](https://www.cloudflare.com/learning/network-layer/what-is-a-network-protocol/) -- type: article, time: 10m
- [Julia Evans - Networking Zine](https://wizardzines.com/zines/networking/) -- type: zine, time: 15m
