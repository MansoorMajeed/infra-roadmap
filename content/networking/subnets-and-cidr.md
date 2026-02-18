---
id: "subnets-and-cidr"
title: "Subnets & CIDR"
zone: "networking"
edges:
  from:
    - id: "ip-addresses"
      question: "Every device has an IP address. But how are those addresses organized into groups?"
      detail: "You know what an IP address is — four numbers that identify a device on a network. But those numbers aren't random. Addresses are organized into chunks called subnets, and every IP address belongs to one. Understanding subnets explains why your home devices are all 192.168.1.x, why cloud networks use 10.x.x.x, and how routers know where to send packets."
  to:
    - id: "public-vs-private-ips"
      question: "I understand how addresses are organized. But why do some IPs only work at home while others work anywhere on the internet?"
      detail: "You know how subnets organize IP addresses into groups. Now there's a deeper split: some IP address ranges are reserved for private networks (like your home), and others are public — routable across the entire internet. Understanding this distinction explains NAT, why you can't host a server at home easily, and how cloud infrastructure is designed."
    - id: "how-packets-travel"
      question: "Traffic between subnets needs a router. But how does a router know where to send a packet?"
      detail: "You know that packets between subnets must pass through a router, and that routing tables tell a device where to forward traffic. But your routing table only has a few entries — 'local subnet: direct' and 'everything else: send to gateway.' What happens after that gateway? How does a packet find its way across the internet through potentially dozens of routers?"
difficulty: 2
tags: ["subnets", "cidr", "ipv4", "routing", "network"]
category: "concept"
milestones:
  - "Explain what a subnet mask tells you about an IP address"
  - "Read CIDR notation and calculate how many hosts fit in a subnet"
  - "Describe why subnets are used to organize networks"
---

Your laptop is `192.168.1.42`. Your phone is `192.168.1.43`. Your router is `192.168.1.1`. These aren't random — they all belong to the same **subnet**: a chunk of IP addresses that form one logical network. Devices on the same subnet can talk directly to each other. Devices on different subnets need a router to forward traffic between them.

<!-- DEEP_DIVE -->

Every IP address has two parts: the **network portion** (which subnet is this?) and the **host portion** (which device on that subnet?). The **subnet mask** tells you where the split is.

```
IP Address:    192.168.1.42
Subnet Mask:   255.255.255.0
               ────────────  ──
               Network part  Host part

Network:       192.168.1.0    (the subnet — all addresses that share this prefix)
Host:          .42            (this specific device within the subnet)
Broadcast:     192.168.1.255  (special address: sends to ALL devices on this subnet)
```

**CIDR notation** is the modern shorthand. Instead of writing out `255.255.255.0`, you write `/24` — meaning the first 24 bits are the network portion. So `192.168.1.0/24` means "the network where the first 24 bits are fixed, leaving 8 bits (2⁸ = 256 addresses) for devices."

```
192.168.1.42/24
│           │└─ /24 means: first 24 bits are the network
│           └── .42 is the host — this specific device
└────────────── 192.168.1.0 is the network (the subnet itself)
```

Common subnet sizes:

| CIDR | Subnet Mask | Usable Hosts | Typical use |
|------|-------------|-------------|-------------|
| /24 | 255.255.255.0 | 254 | Home network, small office |
| /16 | 255.255.0.0 | 65,534 | Large corporate network |
| /8 | 255.0.0.0 | 16.7 million | The entire `10.x.x.x` range |
| /32 | 255.255.255.255 | 1 | A single specific host (used in firewall rules) |
| /30 | 255.255.255.252 | 2 | Point-to-point links between routers |

Note: each subnet loses 2 addresses — one for the network address (`.0`) and one for broadcast (`.255`) — so a /24 has 256 total but only 254 usable for devices.

**Why subnets exist:** Subnets let you divide a large address space into isolated segments. A company might structure their network like this:

```
10.0.1.0/24   — engineering team    (up to 254 devices)
10.0.2.0/24   — marketing team      (up to 254 devices)
10.0.10.0/24  — production servers
10.0.20.0/24  — database servers
```

Traffic within `10.0.10.0/24` (between app servers) flows directly, without hitting a router. Traffic from `10.0.1.x` (engineering) to `10.0.20.x` (databases) must pass through a router — and that's where you apply firewall rules that say "engineers' laptops cannot connect directly to production databases."

**Your routing table makes this concrete:**

```bash
# View your routing table on Linux
ip route

# On macOS
netstat -rn

# Typical output:
# 192.168.1.0/24 dev eth0         ← this subnet: send directly to the interface
# default via 192.168.1.1 dev eth0  ← everything else: send to the router
```

Your machine sees `192.168.1.x`? Send it directly. Anything else? Forward to `192.168.1.1` (your router) and let it figure it out.

**In the cloud, this is explicit.** When you create an AWS VPC, you pick a CIDR block (`10.0.0.0/16`). Then you carve it into subnets (`10.0.1.0/24` for web servers, `10.0.2.0/24` for databases). This is the same concept — just managed by cloud infrastructure instead of physical switches. When a pod can't reach a database, or a security group is blocking traffic, you're almost always debugging subnet and routing problems. CIDR notation is daily vocabulary for anyone working in cloud infrastructure.

<!-- RESOURCES -->

- [Cloudflare - What is a subnet?](https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/) -- type: article, time: 10m
- [Subnet Calculator](https://www.subnet-calculator.com/) -- type: tool, time: 5m
- [CIDR Notation Explained](https://aws.amazon.com/what-is/cidr/) -- type: article, time: 10m
- [Practical Networking - Subnetting](https://www.practicalnetworking.net/stand-alone/subnetting-mastery/) -- type: series, time: 2h
