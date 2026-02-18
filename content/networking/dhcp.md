---
id: "dhcp"
title: "DHCP: How Devices Get Their IP"
zone: "networking"
edges:
  from:
    - id: "local-network"
      question: "You connected to WiFi and got an IP address automatically. How does that work?"
      detail: "When you join a network, you don't manually configure an IP address — one just appears. Something on the network noticed you arrived and handed you an address, a gateway, and a DNS server. That something is DHCP, and understanding it closes the loop on how devices actually join a network."
    - id: "ip-addresses"
      question: "Every device needs an IP. But how does your device actually get one assigned to it?"
      detail: "You know what an IP address is and how they're structured. But when you connected to WiFi this morning, you didn't type anything — your device just got an address. Understanding DHCP explains that automatic assignment and what's actually happening in the brief moment when your device first joins a network."
difficulty: 1
tags: ["dhcp", "ip", "network", "automatic", "lease", "gateway"]
category: "concept"
milestones:
  - "Explain the DHCP DORA process in plain terms"
  - "Identify what information DHCP assigns beyond just an IP address"
  - "Understand what a DHCP lease is and why leases expire"
---

Every time you connect to WiFi, your device gets an IP address — and you didn't type anything. No configuration screen, no decision to make, it just works. That is **DHCP** — the Dynamic Host Configuration Protocol. It's the protocol that automatically assigns IP addresses (and a few other critical settings) to devices when they join a network. Every home router runs a DHCP server, and so does every corporate network and cloud environment.

<!-- DEEP_DIVE -->

**The DORA process** — four steps that happen in milliseconds when you connect:

```
1. DISCOVER  — Your device broadcasts: "Is there a DHCP server here? I need an IP."
2. OFFER     — The DHCP server responds: "I can offer you 192.168.1.42, valid for 24 hours."
3. REQUEST   — Your device says: "I'll take 192.168.1.42 please."
4. ACK       — The server confirms: "It's yours. Here are your full settings."
```

DHCP doesn't just assign an IP — it hands your device a full network configuration:

| Setting | Example | Purpose |
|---------|---------|---------|
| IP address | `192.168.1.42` | Your device's address on this network |
| Subnet mask | `255.255.255.0` | Which addresses are on the same subnet |
| Default gateway | `192.168.1.1` | Where to send traffic destined outside the subnet |
| DNS server | `8.8.8.8` | Who to ask when resolving domain names |
| Lease time | `86400` seconds | How long the IP is yours before you need to renew |

**Leases:** A DHCP lease is temporary. Your device gets an IP for a set duration and must renew it before it expires. This allows the server to reclaim addresses from devices that left the network without saying goodbye. On most home networks the lease time is 24 hours. In busy environments (like conference WiFi) it might be 1 hour so addresses cycle quickly.

```bash
# See your current DHCP lease on Linux
ip addr show
# or
cat /var/lib/dhcp/dhclient.leases

# Release and renew your IP (Linux)
sudo dhclient -r eth0   # release
sudo dhclient eth0      # request a new one
```

**Static vs dynamic:** DHCP assigns addresses dynamically from a pool. Servers and infrastructure usually get **static IPs** — either assigned manually, or via DHCP reservations (telling the DHCP server "always give this MAC address this specific IP"). This is how your home router knows to always give your NAS the same address.

<!-- RESOURCES -->

- [What is DHCP? - Cloudflare](https://www.cloudflare.com/learning/network-layer/what-is-dhcp/) -- type: article, time: 10m
- [DHCP Explained - PowerCert](https://www.youtube.com/watch?v=e6-TaH5bkjo) -- type: video, time: 10m
