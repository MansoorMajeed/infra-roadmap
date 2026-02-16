---
id: "ip-addresses-and-subnets"
title: "IP Addresses & Subnets"
zone: "networking"
edges:
  from:
    - id: "http-protocol"
      question: "HTTP works great on my local network. But how do IP addresses actually work beyond my WiFi?"
      detail: "You can make HTTP requests to your server using its local IP. But IP addresses are more than just numbers your router hands out. How are they structured? What is a subnet? How does a packet know which network to go to? Understanding IP addressing is how you go from 'it works on my WiFi' to understanding how the internet routes traffic globally."
  to:
    - id: "dns-and-domain-names"
      question: "I understand IP addresses, but nobody wants to type 73.42.100.15 into a browser. How do domain names work?"
      detail: "IP addresses are how machines find each other, but humans do not think in numbers. We type google.com, not 142.250.80.46. Something has to translate human-readable domain names into IP addresses. That system is DNS, and it is one of the most critical and fascinating pieces of internet infrastructure."
difficulty: 2
tags: ["ip", "subnets", "cidr", "ipv4", "ipv6", "routing", "network"]
category: "concept"
milestones:
  - "Understand the structure of an IPv4 address and subnet mask"
  - "Calculate the network and host portions of an IP address using CIDR notation"
  - "Explain why private IP ranges exist and how NAT works"
---

Your laptop is `192.168.1.42` and your phone is `192.168.1.43`. Your router is `192.168.1.1`. These numbers are not random — they have structure, and understanding that structure is how you understand how networks are organized, how packets get routed, and how the entire internet is addressed.

<!-- DEEP_DIVE -->

An **IPv4 address** is a 32-bit number, written as four octets: `192.168.1.42`. Each octet is 8 bits (0-255). That gives us about 4.3 billion possible addresses — which seemed like enough in the 1980s but ran out long ago.

Every IP address has two parts: the **network portion** (which network is this device on?) and the **host portion** (which device on that network?). The **subnet mask** defines where the split is:

```
IP Address:    192.168.1.42
Subnet Mask:   255.255.255.0
               ─────────── ──
               Network      Host

Network:       192.168.1.0     (the network)
Host:          .42             (the device)
Broadcast:     192.168.1.255   (message to ALL devices on this network)
```

**CIDR notation** is the modern way to write this. Instead of `255.255.255.0`, you write `/24` — meaning the first 24 bits are the network portion. So `192.168.1.0/24` means "the network 192.168.1.x, with 256 addresses (0-255), of which 254 are usable for devices."

Common subnet sizes:

| CIDR | Subnet Mask | Usable Hosts | Example |
|------|-------------|-------------|---------|
| /24 | 255.255.255.0 | 254 | A home or small office network |
| /16 | 255.255.0.0 | 65,534 | A large corporate network |
| /8 | 255.0.0.0 | 16 million+ | The 10.x.x.x private range |
| /32 | 255.255.255.255 | 1 | A single host (used in routing tables) |

```bash
# Check your IP and subnet on Linux
ip addr show

# On macOS
ifconfig en0

# You might see something like:
# inet 192.168.1.42/24
# This means: IP is 192.168.1.42, on the 192.168.1.0/24 network
```

**Why subnets matter:** Subnets divide a large network into smaller, manageable segments. A company might have:

- `10.0.1.0/24` — engineering team (254 hosts)
- `10.0.2.0/24` — marketing team (254 hosts)
- `10.0.10.0/24` — production servers (254 hosts)
- `10.0.20.0/24` — database servers (254 hosts)

Devices on the same subnet can talk directly. Devices on different subnets need a **router** to forward traffic between them. This is exactly what your home router does — it routes between your private subnet (`192.168.1.0/24`) and the internet.

**Private IP ranges** are addresses reserved for internal networks. They are never used on the public internet:

| Range | CIDR | Commonly used for |
|-------|------|-------------------|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Cloud VPCs, corporate networks |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Docker default networks |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Home routers |

**NAT (Network Address Translation)** is how your entire home network shares a single public IP. When your laptop sends a request to google.com, your router replaces the source IP (`192.168.1.42`) with its public IP (`73.42.100.15`), remembers the mapping, and when the response comes back, it forwards it to your laptop. This is why you cannot host a server on your home network easily — nobody on the internet can initiate a connection to `192.168.1.42` because that address is hidden behind NAT.

```
Your laptop (192.168.1.42) → Router (NAT) → Internet (73.42.100.15) → google.com
google.com → Internet → Router (73.42.100.15) → NAT lookup → Your laptop (192.168.1.42)
```

**IPv6** is the long-term solution to address exhaustion. Instead of 32 bits, it uses 128 bits, written in hexadecimal: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`. That is enough for every grain of sand on Earth to have its own address. IPv6 adoption is growing but IPv4 still runs most of the internet, kept alive by NAT.

**Routing** is how packets find their way. Your device has a **routing table** that says "for addresses on my subnet, send directly; for everything else, send to my default gateway (the router)." Your router has a routing table that says "for local traffic, handle it; for everything else, send to my ISP." Your ISP has a routing table that knows how to reach other ISPs. The entire internet is just a chain of routing tables.

```bash
# View your routing table
# Linux
ip route

# macOS
netstat -rn

# You will see something like:
# default via 192.168.1.1 dev en0   (everything goes to the router)
# 192.168.1.0/24 dev en0            (local subnet, send directly)
```

**Why SREs care:** Every cloud environment — AWS VPCs, Kubernetes pod networks, Docker bridge networks — is built on subnets and IP addressing. When a pod cannot reach a database, when a security group blocks traffic, when a VPN tunnel fails — you are debugging IP and routing problems. CIDR notation, subnet calculations, and routing are daily tools for anyone operating infrastructure.

<!-- RESOURCES -->

- [Practical Networking - Subnetting](https://www.practicalnetworking.net/stand-alone/subnetting-mastery/) -- type: series, time: 2h
- [Subnet Calculator](https://www.subnet-calculator.com/) -- type: tool, time: 5m
- [Cloudflare - What is a subnet?](https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/) -- type: article, time: 10m
- [CIDR Notation Explained](https://aws.amazon.com/what-is/cidr/) -- type: article, time: 10m
- [IPv6 Basics - Google](https://www.internetsociety.org/deploy360/ipv6/basics/) -- type: article, time: 15m
