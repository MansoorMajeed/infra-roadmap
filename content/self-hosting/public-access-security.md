---
id: "public-access-security"
title: "Before You Go Public: Security Considerations"
zone: "self-hosting"
edges:
  from:
    - id: "remote-access-public"
      question: "What are the risks? I want to understand what I'm getting into before I open anything up."
  to:
    - id: "public-website"
      question: "My service is a website or web app — what are my options?"
      detail: "It's a blog, dashboard, or web app — people navigate to a URL and it loads in the browser. Regular web traffic. No video streaming or massive file downloads."
    - id: "public-media-streaming"
      question: "I want to let people stream from my media server without needing a VPN — how?"
      detail: "I want people to open a URL in their browser or app and just watch — no VPN, no account with me, no setup on their end. Just a link that works."
difficulty: 2
tags: ["self-hosting", "security", "public", "dmz", "networking"]
category: "principle"
milestones:
  - "Understand the attack surface of a public-facing home service"
  - "Know what a DMZ/VLAN isolation approach looks like (even if you don't implement it now)"
---

Putting something on the public internet means real traffic — and real attack attempts. Bots scan the entire IPv4 address space continuously. Within minutes of a service going public, it will receive connection attempts from all over the world.

This doesn't mean don't do it. It means understand what you're signing up for.

<!-- DEEP_DIVE -->

## What actually happens

When you expose a service publicly, automated scanners will find it. They'll probe common paths, try default credentials, and test for known CVEs in whatever software you're running. This is just the reality of the internet — it happens to every public-facing host, including major cloud providers.

The question is: what happens if they succeed?

## The pivot risk

This is the part people underestimate. Suppose someone exploits a vulnerability in your Nextcloud or Jellyfin — maybe an unpatched CVE, maybe a weak password. They're now running code on your server.

But your server is on your home network. From there, they can see your NAS, your other machines, your router, everything else on the LAN. A single compromised application becomes a foothold into your entire home network.

Cloudflare Tunnel and other tools hide your home IP — but they don't prevent this. The exploit still lands on a machine inside your network.

## Keep software updated

This is the highest-leverage thing you can do. Most exploits target known, patched vulnerabilities in outdated software. Enable automatic updates for your OS packages. Pin container images to specific versions and update them regularly. Don't leave services running that you're not actively maintaining.

## Don't expose unauthenticated services

Anything public should require authentication before doing anything interesting. Even if you think "nobody knows the URL" — they will. Use strong, unique passwords or SSO. Consider adding Cloudflare Access or a similar auth layer in front of sensitive services.

## The proper hardening approach: DMZ / VLAN isolation

If you want to do this right, the textbook answer is to put public-facing services in a separate network segment — a DMZ (demilitarized zone) or dedicated VLAN — isolated from the rest of your home network by firewall rules.

In this setup, even if an attacker fully compromises your Nextcloud server, they hit a firewall wall. They can't reach your NAS or your desktop. The blast radius is contained.

This is a networking topic that goes beyond self-hosting — it involves managed switches, VLAN-capable routers, and firewall rules. We won't go deeper on it here, but it's worth knowing the concept exists and what it's called when you're ready.

## Practical baseline

Before going public:
- Your software is up to date
- Every service behind the public URL requires authentication
- You have a plan for keeping it updated
- You understand that if something goes wrong, it's on your home network

With that understood, pick your approach.

<!-- RESOURCES -->

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) -- type: reference, time: 30min
