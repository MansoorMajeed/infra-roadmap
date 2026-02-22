---
id: "remote-access-just-me"
title: "Goal: Just Me — Personal Remote Access"
zone: "self-hosting"
edges:
  from:
    - id: "expose-to-internet"
      question: "I just want to be able to access it myself"
  to:
    - id: "tailscale"
      question: "What's the simplest option? I just want it to work"
      detail: "I don't want to deal with port forwarding, dynamic DNS, or certificates. Is there something I can just install that figures all of that out for me?"
    - id: "wireguard-vpn-home"
      question: "I'd rather set this up myself and understand exactly what's happening"
      detail: "I want to know what's actually encrypting my traffic and how my devices find each other. I'm okay with more work if it means I understand what I'm running."
difficulty: 1
tags: ["self-hosting", "remote-access", "vpn"]
category: "concept"
milestones:
  - "Identify your use case: personal remote access only"
---

You want to reach your Jellyfin, Vaultwarden, or home assistant from your phone or laptop — anywhere in the world — without exposing anything to the public internet.

The right tool for this keeps everything private. Your services stay invisible to the internet; only your authorized devices can reach them.

<!-- DEEP_DIVE -->

## How private access works

Instead of opening a hole in your firewall for the world, you create a secure tunnel between your device and your home network. From your phone, it looks like you're on your home LAN. Your services don't need any changes — they just see local traffic.

## Your two options

**Tailscale** — installs in minutes, works through any firewall, no port forwarding needed, and just works. The right default for most people.

**WireGuard (self-hosted)** — you run the VPN server yourself. More moving parts (key generation, port forwarding on your router, dynamic DNS), but you own every piece of it and there's no third-party service involved.

Both give you the same end result. The difference is how much you want to manage.

<!-- RESOURCES -->
