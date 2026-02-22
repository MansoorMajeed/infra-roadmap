---
id: "expose-to-internet"
title: "Exposing Services to the Internet"
zone: "self-hosting"
edges:
  from:
    - id: "tls-with-traefik"
      question: "Works locally — now how do I access it when I'm not home?"
  to:
    - id: "remote-access-just-me"
      question: "I just want to be able to access it myself"
    - id: "remote-access-shared"
      question: "Me and some friends or family need access"
    - id: "remote-access-public"
      question: "It needs to be publicly accessible to anyone on the internet"
difficulty: 1
tags: ["self-hosting", "networking", "remote-access", "security"]
category: "concept"
milestones:
  - "Understand the three different remote access scenarios"
  - "Know which approach fits your situation"
---

Your services work great at home. But the moment you leave, they're unreachable — because your home network is private by design.

There are three fundamentally different reasons you might want external access, and each has a different right answer.

<!-- DEEP_DIVE -->

## TODO

- TODO: explain the three scenarios and why they require different solutions
- TODO: private vs public — the key distinction (a VPN keeps things private, a tunnel makes things truly public)
- TODO: briefly mention that "just opening a port" is an option but explain why it's generally a bad idea (dynamic IP, ISP restrictions, direct exposure)
- TODO: security framing — the more public, the more surface area

<!-- RESOURCES -->

- TODO: add resources
