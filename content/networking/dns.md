---
id: dns
title: 'DNS: How Names Become Addresses'
zone: networking
difficulty: 1
tags:
  - dns
  - domain
  - nameserver
  - records
  - dig
  - resolution
edges:
  to:
    - id: dns-and-domain-names
      zone: running
      question: >-
        I understand how DNS works now. How do I actually get a domain name
        and point it at my own server?
      detail: >-
        I get the theory — resolvers, authoritative nameservers, A records.
        But I've never actually bought a domain or configured DNS records for
        something I'm running. How does that actually work in practice?
category: concept
milestones:
  - >-
    Explain what happens between typing a domain name and the first packet being
    sent
  - Use dig to look up DNS records for a domain
  - Identify the common DNS record types and what each is used for
---

You've never typed `142.250.80.100` into your browser. You type `google.com`. But the internet only knows about IP addresses — there's no such thing as `google.com` at the network level. Something has to translate the name into an address before a single packet can be sent. That translation is **DNS** — the Domain Name System. It runs silently before every web request, every email, and every API call you've ever made.

<!-- DEEP_DIVE -->

**How a DNS lookup works:**

When you type `google.com`, your computer doesn't know the IP. Here's what happens:

```
1. Your computer checks its local cache — has it looked this up recently?
2. If not, it asks your configured DNS resolver (usually your ISP's or 8.8.8.8)
3. The resolver asks a root nameserver: "who handles .com?"
4. The root nameserver says: "ask the .com TLD nameserver"
5. The TLD nameserver says: "ask Google's authoritative nameserver"
6. Google's nameserver answers: "google.com is 142.250.80.100"
7. Your computer connects to that IP
```

This whole process takes milliseconds. The result is cached so subsequent lookups are instant.

```bash
# Look up a domain's IP
dig google.com

# See the full resolution chain
dig +trace google.com

# Look up a specific record type
dig MX gmail.com      # mail servers
dig TXT github.com    # text records (often used for verification)
```

**Common DNS record types:**

| Record | Purpose | Example |
|--------|---------|---------|
| `A` | Maps a domain to an IPv4 address | `google.com → 142.250.80.100` |
| `AAAA` | Maps a domain to an IPv6 address | `google.com → 2607:f8b0:...` |
| `CNAME` | Alias — points one name to another | `www.example.com → example.com` |
| `MX` | Mail server for the domain | `gmail.com → mail servers` |
| `TXT` | Arbitrary text — used for verification, SPF records | Domain ownership proofs |
| `NS` | Which nameservers are authoritative for this domain | `example.com → ns1.example.com` |

**TTL (Time to Live):** Every DNS record has a TTL — how long resolvers should cache it before asking again. A TTL of 3600 means "cache this for an hour." This is why DNS changes don't take effect instantly — you have to wait for old cached records to expire. Lower TTL = faster propagation, more DNS queries. Higher TTL = slower propagation, fewer queries.

**Why DNS matters for SREs:** DNS is load bearing infrastructure. When DNS breaks, everything breaks — your app, your monitoring, your alerts. DNS is also the first thing to check when a service suddenly becomes unreachable. `dig` is one of the most-used debugging tools in infrastructure work.

<!-- RESOURCES -->

- [How DNS Works - Cloudflare](https://www.cloudflare.com/learning/dns/what-is-dns/) -- type: article, time: 15m
- [DNS record types explained](https://www.cloudflare.com/learning/dns/dns-records/) -- type: article, time: 10m
- [dig command tutorial](https://linuxize.com/post/how-to-use-dig-command-to-query-dns/) -- type: tutorial, time: 10m
