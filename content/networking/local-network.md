---
id: "local-network"
title: "Your Local Network"
zone: "networking"
edges:
  from:
    - id: "it-works-on-my-laptop"
      question: "Why can't anyone else reach my app? What even is a network?"
      detail: "Your app runs on localhost — your machine talking to itself. But your laptop is connected to other devices right now. Your phone, your smart TV, your roommate's laptop — they are all on the same WiFi network. Understanding what a local network is and how devices on it communicate is the first step to getting your app off localhost."
  to:
    - id: "tcp-udp-basics"
      question: "Devices can find each other on my network. But how does the data actually get there reliably?"
      detail: "You know your phone and laptop are on the same network and can reach each other by IP address. But when your browser loads a page, how does the data actually travel? How does the server know what order to reassemble the pieces? How does it know if something got lost? That is where transport protocols — TCP and UDP — come in."
difficulty: 1
tags: ["networking", "lan", "wifi", "router", "local-network", "arp"]
category: "concept"
milestones:
  - "Understand what a LAN is and how WiFi connects devices"
  - "Find your machine's local IP address and your router's IP"
  - "Ping another device on your local network"
---

Your laptop, your phone, and your smart speaker are all connected to the same WiFi. They are on the same **local network** — a small group of devices that can talk directly to each other without going through the internet. Understanding this network is the first step to understanding all of networking.

<!-- DEEP_DIVE -->

A **Local Area Network (LAN)** is a group of devices connected together in a small area — your home, an office, a coffee shop. When you connect to WiFi, your device joins a LAN. Every device on that network can potentially communicate with every other device on it.

Your **router** is the center of your home network. It does two jobs: it connects your local devices to each other, and it connects your entire network to the internet. When you buy internet service, your ISP gives you a connection to the outside world. Your router is the bridge between your private little network and the public internet.

When your device joins the network, the router assigns it an **IP address** using a protocol called **DHCP** (Dynamic Host Configuration Protocol). Your laptop might get `192.168.1.42`, your phone `192.168.1.43`, and the router itself is usually `192.168.1.1`:

```bash
# Find your local IP address
# macOS
ipconfig getifaddr en0

# Linux
ip addr show | grep "inet 192"

# Windows
ipconfig
```

These `192.168.x.x` addresses are **private IP addresses** — they only exist within your local network. Your phone at `192.168.1.43` cannot be reached from the internet. Another house's network might also have a device at `192.168.1.43` — no conflict, because private addresses only matter within their own network.

**How devices find each other on a LAN:** When your laptop wants to talk to your phone, it needs to know two things — the phone's IP address and its **MAC address** (a hardware identifier burned into every network card). **ARP** (Address Resolution Protocol) handles the translation: your laptop broadcasts "Who has 192.168.1.43?" and the phone responds "That's me, here's my MAC address." Now they can communicate directly.

You can see this happening:

```bash
# View the ARP table — what MAC addresses your machine knows about
arp -a

# Ping another device on your network
ping 192.168.1.1   # your router
ping 192.168.1.43  # your phone (if you know its IP)
```

**The practical test:** Your Flask app is running on `localhost:5000`. If you change it to listen on `0.0.0.0:5000`, other devices on your WiFi can reach it. Grab your phone, make sure it is on the same WiFi, and open `http://192.168.1.42:5000` (using your laptop's IP). Your phone is talking to your laptop over the local network — no internet involved.

```python
# Change from localhost to all interfaces
app.run(host="0.0.0.0", port=5000)
```

This is real networking. Two different devices, communicating over a network. Everything that follows — TCP, HTTP, DNS, the entire internet — is built on top of this same basic idea: devices with addresses, sending messages to each other.

**Switches and WiFi access points** are the physical infrastructure. A **switch** connects wired devices on a LAN — it learns which devices are on which port and sends traffic only where it needs to go. A WiFi **access point** does the same thing wirelessly. Your home router typically combines a switch, WiFi access point, DHCP server, and internet gateway into one box.

**Why this matters for SRE/DevOps:** Data centers are just big, sophisticated LANs. Servers are connected by switches, organized into network segments, and managed with the same fundamental concepts — IP addresses, MAC addresses, ARP, routing. The networking tools you learn on your home WiFi are the same tools you will use to debug production network issues.

<!-- RESOURCES -->

- [Cloudflare - What is a LAN?](https://www.cloudflare.com/learning/network-layer/what-is-a-lan/) -- type: article, time: 10m
- [How WiFi Works - Explain That Stuff](https://www.explainthatstuff.com/howwifiworks.html) -- type: article, time: 15m
- [Practical Networking - Networking Fundamentals](https://www.practicalnetworking.net/series/packet-traveling/packet-traveling/) -- type: series, time: 1h
- [Julia Evans - How does the Internet work?](https://jvns.ca/blog/2021/05/11/what-s-a-network-interface-/) -- type: article, time: 10m
