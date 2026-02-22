---
id: "i-need-hardware"
title: "I Need Somewhere to Run This"
zone: "self-hosting"
edges:
  from:
    - id: "what-is-self-hosting"
      question: "OK, I want to try this. Where do I actually run it?"
  to:
    - id: "buying-homelab-hardware"
      question: "I don't have any hardware — what should I buy?"
      detail: "Do I need something powerful? And what about electricity — if this thing runs 24/7, is that going to cost me? I don't want to overspend on something I'm just experimenting with."
    - id: "bare-machine-now-what"
      question: "I have an old PC or laptop sitting around"
      detail: "It's a few years old and pretty slow. Is that going to be a problem? And I'm not sure I want to dedicate the whole machine — I still use it sometimes."
difficulty: 1
tags: ["self-hosting", "hardware", "homelab"]
category: "concept"
milestones:
  - "Decide whether you're using existing hardware or buying something"
  - "Know what specs matter (CPU, RAM, storage, power draw)"
---

The machine you run your services on doesn't need to be new, powerful, or expensive. That old laptop under your bed? That PC you replaced two years ago? Both are fine. Self-hosting workloads are not demanding — you're running a password manager or a file sync, not training neural networks.

The first question is simply: do you already have something, or do you need to buy?

<!-- DEEP_DIVE -->

**If you already have hardware**

Almost anything made in the last 15 years can run a self-hosted service. An old dual-core Intel laptop from 2012 can run Vaultwarden, Pi-hole, and a few other services simultaneously without breaking a sweat.

The things that actually matter:

- **RAM is the most important spec.** Aim for at least 8GB. If you have 4GB, you can still get started — run one or two lightweight services. If you have 4GB and a RAM slot free, a cheap upgrade is worth it. Most services use 100–500MB each; Jellyfin with hardware transcoding or Nextcloud with a lot of users use more.

- **An SSD is worth having.** Not for performance (services aren't that write-heavy), but for reliability. Spinning hard drives fail over time, especially in machines that run 24/7. If your old PC has an HDD, a cheap 240GB SSD is a worthwhile $20 upgrade.

- **The CPU barely matters.** Even a 4th-gen Intel Core i3 is overkill for most self-hosting. The exception is media transcoding (Jellyfin/Plex) — if you want to transcode video, you want a CPU with Intel Quick Sync (Intel 7th gen or later iGPU). But for everything else, age doesn't matter.

- **Think about power draw.** This machine will run 24/7. An old gaming PC might draw 150W idle. At $0.15/kWh, that's $200/year in electricity. A modern mini PC draws 6–15W idle. It's worth checking your machine's idle power consumption with a [Kill A Watt](https://www.amazon.com/dp/B00009MDBU) or similar meter before committing to running it full-time.

**If you need to buy**

See the next node — we cover exactly what to buy and where to find it.

<!-- RESOURCES -->
