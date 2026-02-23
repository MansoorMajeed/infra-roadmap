---
id: "dns-and-domain-names"
title: "DNS & Domain Names"
zone: "running"
edges:
  from:
    - id: "web-servers"
      question: "My web server works, but I'm using raw IP addresses. How do I give my site a real name?"
      detail: "Your Nginx server is running and serving pages. But you are accessing it by IP address — 192.168.1.42 on your LAN, or 73.42.100.15 on a cloud server. Nobody wants to type that. Every real website has a domain name — google.com, github.com. Something has to translate those names into IP addresses, and that system is DNS."
  to:
    - id: "running-your-store"
      question: "I have a domain name. How do I put it all together and deploy my app?"
      detail: "I've got DNS pointing at my server and all the pieces working separately. But I've never assembled them into a real live deployment — Nginx in front, HTTPS configured, actual domain in the browser. What does putting all of it together actually look like?"
difficulty: 1
tags: ["dns", "domain-names", "nameservers", "udp", "dig", "nslookup"]
category: "concept"
milestones:
  - "Understand how a DNS query resolves a domain name to an IP address"
  - "Use dig and nslookup to query DNS records"
  - "Explain why DNS uses UDP and when it falls back to TCP"
---

You have a server at `73.42.100.15`. You tell your friend to visit your website. Are you going to say "go to seventy-three dot forty-two dot one hundred dot fifteen"? Of course not. You want them to type `mystore.com`. But computers do not understand `mystore.com` — they need an IP address. Something has to translate the name into a number. That something is **DNS**.

<!-- DEEP_DIVE -->

**DNS** (Domain Name System) is the phone book of the internet. When you type `google.com` into your browser, the very first thing that happens — before any HTTP request, before any TCP connection — is a DNS lookup. Your computer asks "what IP address does `google.com` point to?" and gets back `142.250.80.46`. Only then does the browser connect.

The lookup process is a chain of questions:

1. **Your computer** checks its local cache. Have I looked this up recently? If yes, use the cached answer.
2. **Your router** might have it cached too.
3. **Your ISP's resolver** (or a public resolver like `8.8.8.8` or `1.1.1.1`) handles the actual lookup if nobody has the answer cached.
4. The resolver asks the **root nameservers** — "who handles `.com`?"
5. The root says "ask the `.com` TLD nameservers."
6. The `.com` nameserver says "the nameservers for `google.com` are `ns1.google.com`."
7. The resolver asks `ns1.google.com` — "what is the IP for `google.com`?"
8. The answer comes back: `142.250.80.46`.

All of this happens in milliseconds. The result is cached at multiple levels so subsequent lookups are even faster.

```bash
# Query DNS with dig — the SRE's best friend
dig google.com

# Short answer only
dig google.com +short
# 142.250.80.46

# Trace the full resolution path
dig google.com +trace

# Query a specific DNS server
dig google.com @8.8.8.8      # Google's DNS
dig google.com @1.1.1.1      # Cloudflare's DNS

# nslookup — simpler alternative
nslookup google.com
```

**DNS Record Types** — a domain can have multiple types of records:

| Type | Purpose | Example |
|------|---------|---------|
| **A** | Maps domain to IPv4 address | `mystore.com → 73.42.100.15` |
| **AAAA** | Maps domain to IPv6 address | `mystore.com → 2001:db8::1` |
| **CNAME** | Alias for another domain | `www.mystore.com → mystore.com` |
| **MX** | Mail server for the domain | `mystore.com → mail.mystore.com` |
| **TXT** | Arbitrary text (used for verification, SPF, etc.) | `"v=spf1 include:_spf.google.com"` |
| **NS** | Nameservers responsible for this domain | `mystore.com → ns1.cloudflare.com` |

```bash
# Query specific record types
dig mystore.com A          # IPv4 address
dig mystore.com AAAA       # IPv6 address
dig mystore.com MX         # Mail servers
dig mystore.com NS         # Nameservers
dig mystore.com TXT        # Text records
dig www.mystore.com CNAME  # Aliases
```

**Registering a domain** is straightforward. You go to a registrar (Namecheap, Cloudflare, Porkbun), search for a name, and pay $10-15/year for a `.com`. Then you configure DNS records — at minimum, an **A record** pointing your domain to your server's IP address.

**TTL (Time To Live)** controls how long DNS answers are cached. When you set an A record with a TTL of 3600 (seconds), DNS resolvers will cache that answer for one hour before asking again. Low TTL means changes propagate fast but generate more DNS queries. High TTL means fewer queries but slower updates. When you are about to change servers, lower the TTL ahead of time so the switchover is fast.

**Why does DNS use UDP?**

This is a great question, and the answer teaches you something important about protocol choice. DNS queries are tiny — a question like "what is the IP for google.com?" fits in a single packet (usually under 512 bytes). TCP requires a three-way handshake (SYN, SYN-ACK, ACK) before any data is sent — that is three round trips just to set up the connection, then the actual query, then the teardown. For a small, single-packet question and answer, that overhead is absurd.

UDP lets you fire off one packet with the question and get one packet back with the answer. No handshake, no connection setup, no teardown. For DNS, this means:

- **Faster** — one round trip instead of multiple
- **Less load on DNS servers** — no need to maintain connection state for millions of queries per second
- **Simpler** — if the response does not arrive, just ask again

DNS *does* fall back to TCP in two cases: when the response is too large to fit in a single UDP packet (over 512 bytes, or 4096 with EDNS), and for **zone transfers** between DNS servers (replicating entire zone files). But for 99% of normal DNS lookups, UDP is the right tool.

```bash
# See DNS queries happening in real time (requires tcpdump)
sudo tcpdump -i any port 53

# You will see UDP packets going to and from port 53 (the DNS port)
```

**DNS can fail, and when it does, everything breaks.** If your DNS resolver is down, your browser cannot translate any domain name, and the internet effectively stops working. This is why major outages at DNS providers (like the 2021 Facebook outage where their BGP misconfiguration made their DNS servers unreachable) take down everything. As an SRE, you will monitor DNS health, use multiple DNS providers, and understand DNS propagation delays.

**The `/etc/resolv.conf` file** on Linux tells your system which DNS resolver to use:

```bash
cat /etc/resolv.conf
# nameserver 8.8.8.8
# nameserver 1.1.1.1
```

And `/etc/hosts` lets you override DNS entirely for specific domains — useful for testing:

```bash
# /etc/hosts
127.0.0.1   mystore.com
# Now "mystore.com" points to localhost on this machine
```

<!-- RESOURCES -->

- [Cloudflare - What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/) -- type: article, time: 10m
- [How DNS Works (comic)](https://howdns.works/) -- type: interactive, time: 10m
- [Julia Evans - How DNS Works Zine](https://wizardzines.com/zines/dns/) -- type: zine, time: 15m
- [mess with dns - Experiment with DNS](https://messwithdns.net/) -- type: interactive, time: 30m
- [dig Command Examples](https://www.thegeekstuff.com/2012/02/dig-command-examples/) -- type: reference, time: 15m
