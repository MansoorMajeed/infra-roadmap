---
id: "buying-homelab-hardware"
title: "Buying Homelab Hardware"
zone: "self-hosting"
edges:
  from:
    - id: "i-need-hardware"
      question: "I don't have any hardware — what should I buy?"
  to:
    - id: "bare-machine-now-what"
      question: "I got something — now what do I do with it?"
      detail: "I have the machine. Do I just download an ISO and put it on a USB? Is there anything I need to configure first? I've never set up a server from scratch before."
difficulty: 1
tags: ["self-hosting", "hardware", "homelab", "raspberry-pi", "mini-pc"]
category: "concept"
milestones:
  - "Understand the tradeoffs between Raspberry Pi, mini PCs, and used enterprise hardware"
  - "Know what to look for on eBay (tiny/mini/micro form factor PCs)"
  - "Have a machine in hand and ready to set up"
---

The best homelab hardware is cheap, quiet, and sips power. You're running services 24/7 — the electricity cost matters more than the purchase price over time. A machine that draws 100W idle costs more in electricity in a year than a used mini PC costs to buy.

The sweet spot: **a used mini PC from eBay**, in the $50–150 range.

<!-- DEEP_DIVE -->

**The Tiny/Mini/Micro category**

The homelab community has a name for the ideal hardware: "tiny/mini/micro" — referring to the small form-factor PCs sold by Lenovo, HP, and Dell for enterprise desktops. These machines were designed to sit under a monitor in an office, run all day, and draw minimal power. They're now available in large quantities on eBay as businesses refresh their fleets.

The best options:

| Brand | Model series | Notes |
|---|---|---|
| **Lenovo** | ThinkCentre M series (M710q, M720q, M920q) | Most popular, excellent Linux support |
| **HP** | EliteDesk 800 G3/G4/G5 mini | Very similar to Lenovo, also excellent |
| **Dell** | OptiPlex Micro 3070, 5070 | Slightly larger, same idea |

What to look for:
- **Intel 7th gen (Kaby Lake) or later CPU.** Intel Quick Sync (the iGPU) enables hardware-accelerated video transcoding in Jellyfin. If you ever want to stream media, this matters. Skip AMD for now — Quick Sync support is significantly better.
- **16GB RAM.** Costs very little on a used machine and gives you room to run multiple services without thinking about it.
- **NVMe or SSD storage.** Not the spinning drive it probably ships with.
- **Expected power draw: 6–15W idle.** This is the big win over any desktop or laptop.

A Lenovo M720q with an i5-8500T, 16GB RAM, and a 256GB SSD typically sells for $80–120 on eBay. That's exceptional value.

**Raspberry Pi**

A Raspberry Pi 4 (4GB or 8GB) or Pi 5 is a perfectly valid choice, especially if you want something small and low-power from new. Caveats:
- ARM architecture means a small number of Docker images don't have ARM builds. Most popular self-hosted apps do.
- The Pi 4 draws about 3–5W idle — even lower than mini PCs.
- Storage lives on an SD card or USB SSD. Use an SSD via USB, not an SD card — SD cards die under constant writes.
- The Pi 5 is significantly faster than the Pi 4 and worth the extra $20 if you're buying new.

**What NOT to buy**

Avoid old enterprise rack servers (Dell PowerEdge, HP ProLiant, etc.). They're tempting because they're cheap and have lots of RAM, but their idle power draw is 100–300W. At typical electricity rates, one of these costs $150–450/year to run idle. That's not a homelab, that's a heating system.

**Where to buy**

- **eBay**: Best selection and prices. Search "Lenovo M720q", "HP EliteDesk 800 G4 mini". Sort by "Buy It Now" and filter to your budget.
- **Facebook Marketplace**: Often cheaper than eBay, local pickup means no shipping. IT equipment from local businesses refreshing their hardware shows up regularly.
- **r/homelabsales**: Community marketplace. Good deals, trustworthy sellers.

<!-- RESOURCES -->


- [ServeTheHome Tiny/Mini/Micro Guide](https://www.servethehome.com/introducing-project-tinyminimicro-home-lab-revolution/) -- type: reference, time: 20min
