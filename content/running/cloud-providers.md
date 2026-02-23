---
id: "cloud-providers"
title: "Cloud Providers"
zone: "running"
edges:
  from:
    - id: "where-do-i-run-this"
      question: "I don't want to buy hardware. Can I just rent a server?"
      detail: "Buying and maintaining physical servers is expensive and complicated. Cloud providers like AWS, DigitalOcean, and GCP let you rent virtual servers by the hour. You click a button, get a server with a public IP, and pay only for what you use. This is how most applications are deployed today."
  to:
    - id: "linux-server-basics"
      question: "I have a cloud VM. How do I actually use it?"
      detail: "I've got a cloud VM with a public IP but I have no idea what to do with it. I've never remotely managed a Linux server before — how do I even connect, and what do I actually need to learn?"
    - id: "what-is-a-vps"
      question: "What am I actually renting when I create a cloud server?"
      detail: "I clicked a button and now I have a 'server' — but it doesn't feel like a real machine. It's somewhere in the cloud, I have no idea what hardware it's running on, and it seems like other people's VMs are on the same physical box. What did I actually just create?"
difficulty: 1
tags: ["cloud", "aws", "gcp", "azure", "digitalocean", "vm", "iaas"]
category: "concept"
milestones:
  - "Understand what IaaS is and how cloud VMs work"
  - "Create a virtual machine on a cloud provider"
  - "Explain regions, availability zones, and why they matter"
---

You could buy a server, find a datacenter, and set everything up yourself. Or you could open a browser, click a few buttons, and have a server running in under a minute — with a public IP, a fresh operating system, and pay-by-the-hour pricing. That is what **cloud providers** offer, and it is how the vast majority of applications run today.

<!-- DEEP_DIVE -->

**Cloud computing** means renting computing resources instead of owning them. Instead of buying a $2,000 server, you rent a virtual one for $5-20/month. Instead of signing a 3-year datacenter contract, you pay by the hour and shut it down when you are done. The cloud provider owns and operates the physical infrastructure — you just use it.

**IaaS (Infrastructure as a Service)** is the cloud model most relevant right now. The provider gives you virtual machines, storage, and networking. You control the operating system and everything above it. This is what services like AWS EC2, DigitalOcean Droplets, and GCP Compute Engine provide.

The major cloud providers:

| Provider | VM Service | Best For | Pricing Model |
|----------|-----------|----------|---------------|
| **AWS** | EC2 | Industry standard, widest service range | Complex, per-second billing |
| **GCP** | Compute Engine | Data/ML workloads, good networking | Per-second, sustained discounts |
| **Azure** | Virtual Machines | Microsoft ecosystem, enterprise | Per-second billing |
| **DigitalOcean** | Droplets | Simplicity, learning, small projects | Fixed monthly, simple pricing |
| **Hetzner** | Cloud Servers | European hosting, excellent price/perf | Fixed monthly, very affordable |
| **Linode (Akamai)** | Linodes | Simple, developer-friendly | Fixed monthly |

**Creating your first VM** on DigitalOcean (the simplest to start with):

1. Create an account at digitalocean.com
2. Click "Create" → "Droplets"
3. Choose a region (pick one close to your users)
4. Choose an image: **Ubuntu 24.04 LTS**
5. Choose a plan: **Basic, $6/month** (1 vCPU, 1 GB RAM, 25 GB SSD)
6. Add your SSH key (so you can log in securely)
7. Click "Create Droplet"

In about 30 seconds, you have a server with a public IP address. You can SSH in immediately:

```bash
# Your droplet's IP appears in the dashboard
ssh root@143.198.100.50

# You are now on a server in a datacenter, running Ubuntu
```

**Virtual Machines (VMs)** are how cloud providers fit many customers on one physical server. A single physical server with 64 CPU cores and 256 GB RAM can run dozens of small VMs simultaneously. Each VM thinks it is a real computer — it has its own operating system, its own CPU allocation, its own memory. The **hypervisor** (software like KVM or Xen) manages the sharing.

```
Physical Server (64 cores, 256 GB RAM)
├── VM 1: 2 vCPU, 4 GB RAM  (Customer A - web server)
├── VM 2: 4 vCPU, 8 GB RAM  (Customer B - database)
├── VM 3: 1 vCPU, 1 GB RAM  (Customer C - small app)
├── VM 4: 2 vCPU, 4 GB RAM  (Customer D - API server)
└── ... more VMs
```

**Regions and Availability Zones** are how cloud providers organize their infrastructure geographically:

- A **region** is a geographic area — `us-east-1` (N. Virginia), `eu-west-1` (Ireland), `ap-southeast-1` (Singapore)
- An **availability zone (AZ)** is an isolated datacenter (or cluster of datacenters) within a region — `us-east-1a`, `us-east-1b`, `us-east-1c`
- AZs within a region have low-latency connections to each other but are physically separate — different buildings, different power feeds, different flood zones

Why this matters: if a single datacenter has a power failure, only one AZ goes down. If your app runs in multiple AZs, it survives. This is the foundation of high-availability architecture.

**What you get with a cloud VM:**

- A public IPv4 address (and usually IPv6)
- A fresh operating system (your choice — Ubuntu, Debian, CentOS, etc.)
- Root access — you can install anything
- Persistent storage (SSD-based)
- Network connectivity (usually 1-10 Gbps)
- A firewall you can configure (security groups, firewall rules)
- A web console for emergency access if SSH breaks

**What you are responsible for:**

- Operating system updates and security patches
- Software installation and configuration
- Backups (cloud VMs are not automatically backed up unless you set it up)
- Monitoring and alerting
- Security hardening

**Pricing** is straightforward for simple VMs but can get complex for larger deployments:

```
DigitalOcean Basic Droplet:
  1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB transfer
  $6/month ($0.009/hour)

AWS EC2 t3.micro:
  2 vCPU, 1 GB RAM
  ~$7.50/month on-demand
  Free tier: 750 hours/month for 12 months

Data transfer (egress) is the hidden cost:
  DigitalOcean: 1 TB included, then $0.01/GB
  AWS: first 100 GB free, then $0.09/GB
```

The key insight: **compute is cheap, bandwidth is expensive.** A small server costs pocket change. But if your app serves large files or handles millions of requests, data transfer costs add up fast.

**Why SREs care:** Cloud providers are where your infrastructure lives. Understanding VM types, regions, availability zones, and pricing is fundamental. When someone says "spin up an EC2 instance in us-west-2," you need to know what that means. When designing for reliability, you need to understand AZs. When optimizing costs, you need to understand pricing models.

<!-- RESOURCES -->

- [DigitalOcean - How to Create a Droplet](https://docs.digitalocean.com/products/droplets/how-to/create/) -- type: tutorial, time: 15m
- [AWS EC2 Getting Started](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) -- type: tutorial, time: 30m
- [Cloudflare - What is cloud computing?](https://www.cloudflare.com/learning/cloud/what-is-cloud-computing/) -- type: article, time: 10m
- [Cloud Provider Comparison - DigitalOcean vs AWS vs GCP](https://www.digitalocean.com/pricing) -- type: reference, time: 10m
