---
id: "public-access-security"
title: "Before You Go Public: Security Considerations"
zone: "self-hosting"
edges:
  from:
    - id: "remote-access-public"
      question: "Understood — what do I need to know before doing this?"
  to:
    - id: "public-website"
      question: "Got it — my service is a website or web app"
    - id: "public-media-streaming"
      question: "Got it — I want to stream media publicly"
difficulty: 2
tags: ["self-hosting", "security", "public", "dmz", "networking"]
category: "principle"
milestones:
  - "Understand the attack surface of a public-facing home service"
  - "Know what a DMZ/VLAN isolation approach looks like (even if you don't implement it now)"
---

Putting something on the public internet from your home network means real traffic — and real attack attempts. Bots scan the entire IPv4 space constantly. If you open something publicly, it will be found and probed within minutes.

This doesn't mean you shouldn't do it. It means you should go in with eyes open.

<!-- DEEP_DIVE -->

## TODO

- TODO: the threat model — what actually happens when you expose something (bots, scanners, exploit attempts)
- TODO: the pivot risk — if someone exploits a vulnerability in your app (e.g. a misconfigured Nextcloud or outdated app), they're now inside your home network. That's your NAS, your other machines, your router.
- TODO: why Cloudflare Tunnel and similar tools help (they hide your home IP) but don't eliminate risk (the app can still be exploited)
- TODO: keep software updated — this is the single most important thing
- TODO: mention VLAN/DMZ isolation as the proper hardening step: put public-facing services in a separate network segment isolated from the rest of your home. Won't go deeper here — that's a networking topic — but name it so people know it exists
- TODO: authentication matters — don't expose services without auth, even behind Cloudflare
- TODO: practical advice: start with something low-risk (a static site, a read-only service) before exposing anything sensitive

<!-- RESOURCES -->

- TODO: add resources
