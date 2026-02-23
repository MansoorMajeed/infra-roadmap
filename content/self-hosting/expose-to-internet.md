---
id: expose-to-internet
title: Exposing Services to the Internet
zone: self-hosting
edges:
  to:
    - id: remote-access-just-me
      question: I just want to be able to access it myself
      detail: >-
        The moment I leave my home network, everything's unreachable. I want to
        pull up my files or media from my phone or laptop, wherever I am —
        without opening anything to the whole internet.
    - id: remote-access-shared
      question: Me and some friends or family need access
      detail: >-
        It's not just me — my partner or a few family members need to use this
        too. But I don't want it open to the whole internet, and I can't expect
        them to do anything complicated.
    - id: remote-access-public
      question: It needs to be publicly accessible to anyone on the internet
      detail: >-
        I want anyone with the URL to reach it — no account, no VPN, no setup on
        their end. That feels like a fundamentally different problem from just
        giving access to a few people.
difficulty: 1
tags:
  - self-hosting
  - networking
  - remote-access
  - security
category: concept
milestones:
  - Understand the three different remote access scenarios
  - Know which approach fits your situation
---

Your services work great at home. But the moment you leave, they're unreachable — because your home network is private by design. There's no direct path in from the internet.

Getting remote access means creating that path deliberately. But not all remote access is the same — *why* you need it determines which tool is right.

<!-- DEEP_DIVE -->

## The three scenarios

**Scenario 1: Only you need access.**
You want to check on your services from your phone, use Vaultwarden on the road, or browse your Jellyfin from a hotel. No one else needs in.

**Scenario 2: A small group of trusted people.**
You're sharing Jellyfin with family, or Nextcloud with a partner. A handful of known people with devices you can install software on.

**Scenario 3: Genuinely public.**
A website, a public API, or a service that anyone should be able to reach from a browser — no install required.

## Why this distinction matters

Scenarios 1 and 2 are **private access problems**. The right answer is a VPN-style approach: your services stay completely invisible to the internet, and only authorized devices can reach them. Nobody is scanning your ports. Nobody can probe your login page.

Scenario 3 is **public exposure**. You're deliberately putting something on the open internet. Anyone can attempt to connect. The tools are different — and so are the risks.

## What "just opening a port" looks like

There's also the original approach: configure your router to forward port 80 or 443 directly to your server. It works, but it's the most exposed option — your home IP becomes public, ISPs often block standard ports, and your server is directly reachable from the internet. It's a valid choice for the right situation, but the alternatives here are generally better.

<!-- RESOURCES -->
