---
id: "where-do-i-run-this"
title: "Where Do I Run This?"
zone: "running"
edges:
  from:
    - id: "http-protocol"
      question: "I understand HTTP. But where do I actually run my app for real users?"
      detail: "You know the protocol — HTTP methods, status codes, headers. But all of this is running on your laptop. Real websites need to run somewhere that is always on, always reachable. Where do you actually put your application so the world can use it?"
    - id: "public-vs-private-ips"
      question: "I understand addressing — private networks, public IPs, NAT. But where do I actually run something that serves content?"
      detail: "You know how IP addressing works: private addresses for internal networks, public addresses for the internet, NAT bridging the two. But what is sitting at the other end of those public IP addresses? You need a machine with a public IP that is always on — not hidden behind NAT. Where does your app actually go?"
    - id: "it-works-on-my-laptop"
      question: "My app works locally. Where do I actually run this for real?"
      detail: "Your app works on your laptop, but nobody can reach it. You need it running somewhere that is always on, always connected, with a public IP. But where? What are your options, and why can't you just leave your laptop open?"
  to:
    - id: "datacenters"
      question: "Servers need to live somewhere. Where do they physically go?"
      detail: "A server is just a computer, but it cannot sit under your desk if you want it to serve millions of users reliably. Servers live in datacenters — purpose-built facilities with redundant power, cooling, networking, and physical security. Understanding datacenters helps you understand why cloud providers can promise 99.99% uptime."
    - id: "cloud-providers"
      question: "I don't want to buy hardware. Can I just rent a server?"
      detail: "Buying and maintaining physical servers is expensive and complicated. Cloud providers like AWS, DigitalOcean, and GCP let you rent virtual servers by the hour. You click a button, get a server with a public IP, and pay only for what you use. This is how most applications are deployed today."
difficulty: 1
tags: ["server", "hardware", "rack-server", "headless", "always-on", "deployment"]
category: "concept"
milestones:
  - "Understand why you can't run a production app on your laptop"
  - "Explain what a server is and how it differs from a laptop"
  - "Identify the key specs that matter for servers (CPU, RAM, disk, network)"
---

You built your app. You run `python app.py`, open `localhost:5000`, and everything works. Now you want real users to access it. Where does it actually run?

Your first instinct might be: "It runs on my laptop. It's working right now." But think about what happens when you close the lid. Your laptop sleeps. The app stops. Your users get nothing.

<!-- DEEP_DIVE -->

**Why your laptop won't work:**

Let's say you try to keep your laptop running as a "server." Here is what you are up against:

1. **It sleeps.** Close the lid, bump the power settings, let it idle too long — your app goes down.
2. **Your WiFi drops.** Home WiFi is not designed for 24/7 reliability. Your router restarts, your ISP has an outage, someone microwaves popcorn and the signal stutters.
3. **Nobody can reach you.** Your laptop has a private IP like `192.168.1.42`. That address only exists inside your home network. The internet cannot route to it. Your users literally cannot connect.
4. **Your upload speed is terrible.** Home internet might give you 10-50 Mbps upload. A real server has 1-10 Gbps.
5. **Your power goes out.** No UPS, no generator, no redundancy. A thunderstorm takes your app offline.

So you need a computer that is always on, always connected, with a public IP address, and reliable power and networking. That computer is called a **server**.

**A server is just a computer with a different job.**

There is nothing magical about a server. It has a CPU, RAM, storage, and a network connection — just like your laptop. The differences are about purpose and design:

| | Your Laptop | A Server |
|---|---|---|
| **Uptime** | On when you use it, sleeps otherwise | On 24/7/365, reboots are planned events |
| **Display** | Screen, keyboard, trackpad | No monitor — **headless** operation |
| **Access** | You sit in front of it | Accessed remotely via SSH |
| **Network** | WiFi, private IP behind NAT | Wired ethernet, often a public IP |
| **Hardware** | Balanced for general use | Optimized for specific workloads |
| **Redundancy** | One of everything | Often redundant power, disks, NICs |

**Headless operation** is a key concept. Servers do not have monitors, keyboards, or mice. You never "log in" by sitting in front of one. Instead, you connect remotely using **SSH** (Secure Shell) — a protocol that gives you a terminal session on the server from anywhere in the world:

```bash
# Connect to a server
ssh deploy@73.42.100.15

# Now you are on the server — every command runs there
hostname    # prints the server's name, not your laptop's
```

**The specs that matter for servers** depend on the workload:

- **CPU** — How many cores, how fast. A web server handling HTTP requests needs fewer cores than a machine running data processing. Server CPUs (like Intel Xeon or AMD EPYC) prioritize reliability and core count over single-thread speed.
- **RAM** — How much memory. Databases love RAM — the more data you can keep in memory, the less you read from slow disks. A basic web app might need 1-2 GB. A production database might need 64-256 GB.
- **Storage** — Hard drives (HDD) for cheap bulk storage, solid-state drives (SSD) for speed, NVMe for maximum performance. Servers often use RAID configurations to survive disk failures.
- **Network** — Measured in gigabits per second (Gbps). A server with a 1 Gbps connection can transfer about 125 MB/sec. Bandwidth costs money — cloud providers charge for data transfer.

**Physical servers** come in standard sizes measured in **rack units (U)**. One U is 1.75 inches (44.5mm) tall. Servers slide into racks like drawers:

- **1U server** — thin, great for web servers and lightweight workloads
- **2U server** — room for more drives, GPUs, or expansion cards
- **4U server** — storage-heavy servers with many drive bays

A standard server rack is 42U tall, meaning you can stack 42 one-unit servers in a single rack. A small datacenter might have 50-100 racks. A hyperscale datacenter (Google, AWS) might have thousands.

**The mental model:** Think of your laptop as your workshop where you build the furniture. A server is the storefront where customers come to buy it. Same furniture, different purpose and requirements. You would not run a shop out of your bedroom — you need a location with reliable power, a front door customers can find, and the capacity to handle visitors.

So where do you get a server? You have two main paths: rent space in a datacenter for your own hardware, or rent a virtual server from a cloud provider. Let's look at both.

<!-- RESOURCES -->

- [What is a Server? - Cloudflare](https://www.cloudflare.com/learning/cdn/glossary/origin-server/) -- type: article, time: 10m
- [Servers vs Desktops Explained](https://www.hp.com/us-en/shop/tech-takes/server-vs-desktop) -- type: article, time: 10m
- [How Servers Work - HowStuffWorks](https://computer.howstuffworks.com/web-server.htm) -- type: article, time: 15m
