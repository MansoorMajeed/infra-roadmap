---
id: "ip-addresses"
title: "IP Addresses"
zone: "networking"
edges:
  from:
    - id: "network-protocols"
      question: "Protocols have layers, and one layer handles addressing. How do IP addresses actually work?"
      detail: "You learned that the network layer handles addressing — getting packets to the right machine. IP addresses are how that works. Every device on a network gets one, and understanding what they are is the foundation for everything else in networking: subnets, routing, NAT, firewalls, DNS."
  to:
    - id: "subnets-and-cidr"
      question: "Every device has an IP address. But how are those addresses organized into groups?"
      detail: "You know what an IP address is — four numbers that identify a device on a network. But those numbers aren't random. Addresses are organized into chunks called subnets, and every IP address belongs to one. Understanding subnets explains why your home devices are all 192.168.1.x, why cloud networks use 10.x.x.x, and how routers know where to send packets."
    - id: "dhcp"
      question: "Every device needs an IP. But how does your device actually get one assigned to it?"
      detail: "You know what an IP address is and how they're structured. But when you connected to WiFi this morning, you didn't type anything — your device just got an address. Understanding DHCP explains that automatic assignment and what's actually happening in the brief moment when your device first joins a network."
difficulty: 1
tags: ["ip", "ipv4", "ipv6", "addressing", "network"]
category: "concept"
milestones:
  - "Find your own IP address using a terminal command"
  - "Explain what each of the four octets in an IPv4 address represents"
  - "Describe why every networked device needs an IP address"
---

Every device on a network needs an address — a number other devices use to find it. Your laptop has one, your phone has one, Google's servers have one. When your laptop sends a request to `google.com`, the response needs to come back somewhere. That somewhere is your laptop's **IP address**. Without it, packets would have nowhere to go.

<!-- DEEP_DIVE -->

An **IPv4 address** is a 32-bit number written as four groups of digits separated by dots: `192.168.1.42`. Each group is called an **octet** — 8 bits, so each ranges from 0 to 255. Four octets, 32 bits total — giving you 2³² possible addresses, about 4.3 billion.

```bash
# Find your IP address on Linux
ip addr show
# Look for lines starting with "inet" — that's your IP
# Example: inet 192.168.1.42/24 brd 192.168.1.255 scope global eth0

# On macOS
ifconfig en0
# Look for the "inet" line
# Example: inet 192.168.1.42 netmask 0xffffff00 broadcast 192.168.1.255
```

A few special addresses worth knowing:

| Address | What it means |
|---------|--------------|
| `127.0.0.1` | **Loopback** — "this machine itself". `localhost` points here. |
| `0.0.0.0` | "Any interface" — used when configuring a server to listen on all network interfaces |
| `255.255.255.255` | **Broadcast** — sends to all devices on the local network |

**A device can have multiple IP addresses.** Your laptop might have:

```
en0 (WiFi):     192.168.1.42   ← your home network
lo0 (loopback): 127.0.0.1      ← always present, "this machine"
utun0 (VPN):    10.0.0.5       ← when connected to a VPN
```

Each network interface gets its own IP. This becomes important when you configure servers — binding to `0.0.0.0` means "accept traffic on any interface", while binding to `127.0.0.1` means "only accept local connections".

**Why 4.3 billion ran out:** In the 1980s, that seemed like plenty. Today there are around 20 billion internet-connected devices. The practical fix — which you'll learn about soon — is that most devices share a small pool of addresses using a trick called NAT, so the same addresses get reused in millions of private networks simultaneously.

**IPv6** is the long-term solution. It uses 128 bits instead of 32, written in hexadecimal: `2001:0db8:85a3::8a2e:0370:7334`. That is 2¹²⁸ addresses — more than enough for every grain of sand on Earth to have millions of its own. IPv6 adoption is growing but IPv4 still runs the majority of the internet today.

**The key thing to take away:** An IP address is just a number. It identifies a network interface, not a physical device. Your phone gets a new IP address every time it connects to a different WiFi network. Your web server has a fixed IP so people can always find it. IP addresses are not permanent — they are assigned as needed.

<!-- RESOURCES -->

- [Cloudflare - What is an IP address?](https://www.cloudflare.com/learning/dns/glossary/what-is-my-ip-address/) -- type: article, time: 5m
- [Khan Academy - IP Addresses](https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:the-internet/xcae6f4a7ff015e7d:web-protocols/a/ip-addresses-and-dns) -- type: interactive, time: 10m
- [Julia Evans - Networking Zine](https://wizardzines.com/zines/networking/) -- type: zine, time: 15m
