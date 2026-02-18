---
id: "datacenters"
title: "Datacenters"
zone: "running"
edges:
  from:
    - id: "where-do-i-run-this"
      question: "Servers need to live somewhere. Where do they physically go?"
      detail: "A server is just a computer, but it cannot sit under your desk if you want it to serve millions of users reliably. Servers live in datacenters — purpose-built facilities with redundant power, cooling, networking, and physical security. Understanding datacenters helps you understand why cloud providers can promise 99.99% uptime."
  to:
    - id: "linux-server-basics"
      question: "I know where servers live. How do I actually use one?"
      detail: "Whether your server is in a datacenter you colocate in or a cloud VM you just provisioned, you need to manage it. That means SSH, Linux commands, package management, file permissions, and systemd services. These are the basics of operating a Linux server."
    - id: "what-is-a-vps"
      question: "Servers live in datacenters. How do I actually get one without going there?"
      detail: "Datacenters are full of physical machines. But you are not renting an entire machine — you are renting a virtualized slice of one. Cloud providers carve up their hardware into hundreds of virtual machines and rent them individually. This is what makes cloud computing affordable."
difficulty: 1
tags: ["datacenter", "colocation", "infrastructure", "power", "cooling", "redundancy"]
category: "concept"
milestones:
  - "Understand what a datacenter is and why servers live there"
  - "Explain the role of redundant power, cooling, and networking"
  - "Know the difference between colocation and cloud hosting"
---

A server needs power, cooling, and a fast network connection — 24 hours a day, 365 days a year. Your apartment does not offer any of that reliably. A **datacenter** is a building purpose-built to keep servers running. Every website you visit, every app you use, every API you call — the servers behind them live in datacenters.

<!-- DEEP_DIVE -->

A **datacenter** is a facility designed to house computer systems and their associated components — servers, storage, networking equipment. The building itself is engineered for one thing: keeping those machines running without interruption.

**What is inside a datacenter:**

Walk into a datacenter and you will see rows and rows of **server racks** — tall metal cabinets, each holding dozens of servers stacked on top of each other. The racks are arranged in rows with alternating **hot aisles** and **cold aisles** — cold air blows in from the front of the servers, hot exhaust goes out the back. Containment systems keep the hot and cold air separated so cooling is efficient.

```
  [Cold Aisle]     [Hot Aisle]     [Cold Aisle]
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ ═══════ │ ←── │ ═══════ │ ──→ │ ═══════ │
  │ ═══════ │     │ ═══════ │     │ ═══════ │
  │ ═══════ │     │ ═══════ │     │ ═══════ │
  │  Rack   │     │  Rack   │     │  Rack   │
  └─────────┘     └─────────┘     └─────────┘
    Cold air        Hot air         Cold air
    flows IN        flows OUT       flows IN
```

**Power** is the most critical system. Datacenters have multiple layers of redundancy:

1. **Utility power** — the main electrical feed from the power grid
2. **UPS (Uninterruptible Power Supply)** — batteries that kick in instantly if utility power drops, keeping servers running for minutes
3. **Generators** — diesel or natural gas generators that start within seconds and can run for days. They take over from the UPS while utility power is restored

A well-designed datacenter loses zero seconds of operation during a power outage. The UPS bridges the gap while generators spin up.

**Cooling** is the second biggest challenge. Servers generate enormous amounts of heat. A single server rack can draw 5-20 kW of power, and almost all of that energy becomes heat. Without cooling, temperatures would reach dangerous levels in minutes.

Cooling approaches:
- **CRAC units** (Computer Room Air Conditioning) — industrial air conditioning, the traditional approach
- **Evaporative cooling** — uses water evaporation, more energy-efficient in dry climates
- **Liquid cooling** — circulates coolant directly to server components, used in high-density deployments
- **Free cooling** — uses outside air when the climate allows it (datacenters in cold regions love this)

**Networking** in a datacenter is fast. Servers connect to **top-of-rack switches** at 10-25 Gbps. Those switches connect to **aggregation switches** and then to **core routers** that connect to the internet. The datacenter itself connects to the internet backbone through multiple independent connections from different providers — so if one ISP has an outage, traffic flows through another.

**Datacenter tiers** (defined by the Uptime Institute) describe levels of redundancy:

| Tier | Uptime | Downtime/Year | Key Feature |
|------|--------|---------------|-------------|
| Tier I | 99.671% | 28.8 hours | Single path for power and cooling |
| Tier II | 99.741% | 22 hours | Redundant components |
| Tier III | 99.982% | 1.6 hours | Maintainable without downtime |
| Tier IV | 99.995% | 26 minutes | Fault-tolerant, survives any single failure |

Most cloud providers operate at Tier III or IV. When AWS promises 99.99% availability for a service, this infrastructure is part of how they deliver it.

**Colocation** is when you own the servers but rent the space. You buy your hardware, ship it to a colocation facility, and they provide the rack space, power, cooling, and network connectivity. You are responsible for your own servers — if a disk fails at 3 AM, you drive to the datacenter (or send someone) to replace it.

**Managed hosting** is the middle ground — you rent both the space and the hardware, and the provider handles hardware maintenance.

**Cloud hosting** (AWS, GCP, Azure) is the highest level of abstraction — you do not touch hardware at all. The cloud provider owns the datacenters, the servers, the networking. You rent virtual slices of their infrastructure. When you create an EC2 instance, you are getting a virtual machine running on a physical server in one of Amazon's datacenters. You never see or touch that server.

**Physical security** is surprisingly strict. Datacenters have:
- Perimeter fencing, security cameras, 24/7 guards
- Biometric access (fingerprint, retina scan)
- Mantrap entries (two doors — the first must close before the second opens)
- Individual rack locks
- Visitor logs and escort requirements

This matters because physical access to a server means game over for security. If someone can touch your server, they can steal data, install malware, or simply unplug it.

**Why SREs care:** Understanding datacenters helps you understand cloud regions and availability zones, why network latency varies, what happens during "hardware failures," and why cloud providers charge for data transfer. When AWS says your instance is in `us-east-1a`, that is a specific datacenter (or section of one) in Northern Virginia. When you design for multi-AZ redundancy, you are putting servers in physically separate datacenters.

<!-- RESOURCES -->

- [Google Datacenter Tour (video)](https://www.youtube.com/watch?v=XZmGGAbHqa0) -- type: video, time: 5m
- [Cloudflare - What is a Data Center?](https://www.cloudflare.com/learning/cdn/glossary/data-center/) -- type: article, time: 10m
- [Uptime Institute Tier Standards](https://uptimeinstitute.com/tiers) -- type: reference, time: 10m
- [How AWS Builds Datacenters](https://aws.amazon.com/compliance/data-center/) -- type: article, time: 15m
