---
id: "remote-access-shared"
title: "Goal: Shared Access — Friends and Family"
zone: "self-hosting"
edges:
  from:
    - id: "expose-to-internet"
      question: "Me and some friends or family need access"
  to:
    - id: "tailscale"
      question: "Can I share a private VPN with others?"
      detail: "Do the people I share with need accounts? What does setup look like for someone non-technical? I want it to actually work for my family, not just be theoretically possible."
    - id: "wireguard-vpn-home"
      question: "I want to run my own VPN server and manage who gets in"
      detail: "I want control over exactly who has access and the ability to revoke it. I don't want to depend on someone else's service to decide who gets in."
difficulty: 1
tags: ["self-hosting", "remote-access", "vpn", "sharing"]
category: "concept"
milestones:
  - "Identify your use case: trusted shared access"
---

You want a few trusted people — a partner, family members, a friend group — to use your Jellyfin, Nextcloud, or photo library. Not the whole internet. Just the people you choose.

This is still a private access problem. You don't need to expose anything publicly. You just need to extend your private network to a small group of trusted people.

<!-- DEEP_DIVE -->

## Still private, not public

It's worth being clear: even though other people are accessing your services, you don't need to open anything to the internet. Everyone connects through a VPN — which means your services are still invisible to the world, and only people with credentials can reach them.

This is a very different security posture from making something publicly accessible.

## Your two options

**Tailscale** — supports sharing devices or whole networks with other Tailscale accounts. Each person installs the Tailscale app on their device and you share access. Very smooth for family setups. The free tier supports up to 100 devices, which is plenty for most households.

**WireGuard (self-hosted)** — you run a WireGuard server at home and generate a config file for each person. They import it into the WireGuard app. More setup on your end, but full control over who has access and no third-party account required for your users.

For most families, Tailscale is the obvious choice. WireGuard makes sense if you want to avoid third-party dependencies or if your users can't or won't create a Tailscale account.

<!-- RESOURCES -->
