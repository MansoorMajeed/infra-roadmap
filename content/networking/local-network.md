---
id: local-network
title: Connecting Two Computers
zone: networking
edges:
  to:
    - id: network-protocols
      question: >-
        My computers are connected. But how do they actually understand each
        other?
      detail: >-
        My laptop and phone can ping each other. But when I think about what's
        actually happening when they communicate — not the wires, but the actual
        data exchange — I realize I don't understand how they agree on what the
        bytes mean. How do computers speak the same language?
    - id: dhcp
      question: >-
        You connected to WiFi and got an IP address automatically. How does that
        work?
      detail: >-
        I connected to WiFi and my device just had an IP address. I never typed
        anything in. Something must have noticed I joined and handed me an
        address — but what? And what happens when that breaks and my device
        can't get an IP?
difficulty: 1
tags:
  - networking
  - lan
  - wifi
  - router
  - local-network
  - ethernet
category: concept
milestones:
  - Understand how devices physically connect via Ethernet and WiFi
  - Find your machine's local IP address and your router's IP
  - Ping another device on your local network
---

Before the internet, before web servers, before any of that — there is a simpler question: **how do you connect two computers?** Take your laptop and your phone. They are both sitting in the same room, connected to the same WiFi. How are they actually connected, and what does that connection even look like?

<!-- DEEP_DIVE -->

At the most basic level, connecting two computers requires a physical medium — something for data to travel through. There are two ways:

**Wired (Ethernet):** You plug a cable into both machines. Literally. An Ethernet cable carries electrical signals between two network cards. This is how servers in data centers are connected, how your desktop connects to your router, and how the backbone of most networks works. It is simple, fast, and reliable.

**Wireless (WiFi):** Instead of a cable, your device uses radio waves to communicate with a WiFi access point (usually built into your router). The data is the same — just transmitted through the air instead of through copper. Convenient, but slower and less reliable than a cable.

Either way, the result is the same: your device can send bits to another device.

**Your home network** is called a **LAN (Local Area Network)** — a small group of devices connected together. Your router is the hub of this network. It does two things: it lets your local devices talk to each other, and it connects your entire network to the internet.

When your laptop connects to WiFi, the router gives it an **IP address** — a number that identifies your device on the network. Your laptop might be `192.168.1.42`, your phone `192.168.1.43`, and the router itself is usually `192.168.1.1`:

```bash
# Find your local IP address
# macOS
ipconfig getifaddr en0

# Linux
ip addr show | grep "inet 192"

# Windows
ipconfig
```

You can check if another device is reachable with **ping** — one of the simplest networking tools. It sends a tiny message and waits for a reply:

```bash
# Ping your router
ping 192.168.1.1

# Ping your phone (if you know its IP)
ping 192.168.1.43

# You should see responses like:
# 64 bytes from 192.168.1.1: icmp_seq=0 ttl=64 time=2.3 ms
```

If you get a response, the two machines can reach each other. They are connected.

**The practical test:** Your Flask app is running on `localhost:5000`. Change it to listen on `0.0.0.0:5000`, grab your phone (on the same WiFi), and visit `http://192.168.1.42:5000`. Your phone loads the page. Two devices, communicating over a network.

```python
# Listen on all network interfaces, not just localhost
app.run(host="0.0.0.0", port=5000)
```

**But here is the thing.** Your phone loaded the page — great. But how? What actually happened between "your phone sent a request" and "the page appeared"? Your phone sent some bytes over WiFi, and your laptop received them and sent some bytes back. But how did both sides know what those bytes meant? How did they agree on the format, the order, the rules?

That is where protocols come in. The physical connection is step one — but without agreed-upon rules for communication, two connected computers are just two machines shouting into the void.

**Switches** are worth mentioning because they are the physical infrastructure of wired networks. A switch connects multiple devices via Ethernet cables. When your laptop sends data to another device, the switch figures out which port that device is on and sends the data only there — not to every device. In a data center, switches connect hundreds of servers. At home, your router has a small switch built in (those Ethernet ports on the back).

<!-- RESOURCES -->

- [Cloudflare - What is a LAN?](https://www.cloudflare.com/learning/network-layer/what-is-a-lan/) -- type: article, time: 10m
- [Wireless Internet - Explain That Stuff](https://www.explainthatstuff.com/wirelessinternet.html) -- type: article, time: 15m
- [Practical Networking - Networking Fundamentals](https://www.practicalnetworking.net/series/packet-traveling/packet-traveling/) -- type: series, time: 1h
- [Cloudflare - What is Ethernet?](https://www.cloudflare.com/learning/network-layer/what-is-ethernet/) -- type: article, time: 10m
