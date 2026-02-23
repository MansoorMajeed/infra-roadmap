---
id: "firewall-basics"
title: "Firewall Basics"
zone: "running"
edges:
  from:
    - id: "ports-and-listening"
      question: "My app is listening on a port. Who can actually connect to it from the internet?"
      detail: "Your app is bound to a port and listening for connections. But is the firewall allowing traffic on that port? The firewall sits in front of your app and controls which ports are reachable from the outside world. Without opening the right ports, nobody can reach your server."
  to:
    - id: "deploying-your-code"
      question: "My server is set up and secured. Now how do I get my code onto it?"
      detail: "The server is locked down and my runtime is installed. But my code is still sitting on my laptop. How do I actually get it onto the server?"
difficulty: 1
tags: ["firewall", "ufw", "security-groups", "ports", "iptables", "network-security"]
category: "practice"
milestones:
  - "Configure ufw to allow only SSH, HTTP, and HTTPS and deny everything else"
  - "Explain the difference between a host-based firewall (ufw) and a cloud security group"
  - "Safely change firewall rules without locking yourself out of SSH"
---

A firewall controls which network traffic is allowed into and out of your server. Without one, every port your server has open — your app, any database, any internal service — is potentially reachable from anywhere on the internet. Bots and scanners probe servers constantly looking for exposed services to exploit.

A basic firewall rule is simple: deny everything by default, then explicitly allow only what you need.

<!-- DEEP_DIVE -->

**ufw — the Uncomplicated Firewall**

Ubuntu ships with `ufw`, a friendly wrapper around `iptables` (the kernel's low-level firewall). Most of the time, `ufw` is all you need.

```bash
# Set defaults: block all incoming, allow all outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH — do this BEFORE enabling ufw or you will lock yourself out
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS for your web server
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable the firewall
sudo ufw enable

# Check the current rules
sudo ufw status verbose
```

Output looks like:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

**The critical rule: allow SSH before you enable ufw**

If you enable ufw without first allowing port 22, you will immediately lock yourself out of the server. The firewall will block your SSH connection and you will have no way to get back in (unless your cloud provider has an out-of-band console).

Always:
1. `sudo ufw allow 22/tcp`
2. `sudo ufw enable`

Never do it in the other order.

**Managing rules**

```bash
# Allow a specific port
sudo ufw allow 5432/tcp      # PostgreSQL (only do this if you need remote DB access)

# Deny a port explicitly
sudo ufw deny 3306/tcp       # MySQL

# Allow from a specific IP only
sudo ufw allow from 203.0.113.5 to any port 22

# Delete a rule
sudo ufw delete allow 5432/tcp

# Reset everything (start over)
sudo ufw reset
```

**Cloud security groups — the second layer**

Most cloud providers have their own firewall at the network level, before traffic even reaches your server. DigitalOcean calls these "Cloud Firewalls." AWS calls them "Security Groups." They work the same way as `ufw` but are managed through the provider's control panel or API.

You should use both:

```
Internet
    ↓
Cloud Security Group (DigitalOcean/AWS firewall — network level)
    ↓ Only allowed traffic reaches the server
Server's network interface
    ↓
ufw (host-based firewall — kernel level)
    ↓ Second check before reaching the process
Your app / Nginx / SSH daemon
```

Cloud security groups are the outer gate. `ufw` is the inner gate. Using both is defense in depth — if one is misconfigured, the other still protects you.

**What ports to open**

For a typical web app on a VPS:

| Port | Service | Open? |
|------|---------|-------|
| 22 | SSH | Yes — your only way in |
| 80 | HTTP | Yes — Nginx listens here |
| 443 | HTTPS | Yes — Nginx listens here |
| 5000/3000 | Your app | No — Nginx proxies to it internally |
| 5432 | PostgreSQL | No — only accessible locally |
| 6379 | Redis | No — only accessible locally |

The rule: if a service is only used internally (your app talking to its own database), do not open a firewall port for it. It should only be reachable on `127.0.0.1`, not from the internet.

**Checking your work**

```bash
# See current status and rules
sudo ufw status verbose

# Test from your laptop that a port is open (replace with your server IP)
nc -zv 143.198.100.50 80
# Connection to 143.198.100.50 80 port [tcp/http] succeeded!

# Test that a port is correctly blocked
nc -zv 143.198.100.50 5000
# nc: connectx to 143.198.100.50 port 5000 (tcp) failed: Connection refused
```

**Logging**

```bash
# Enable logging to see blocked traffic
sudo ufw logging on

# Logs appear in /var/log/ufw.log
sudo tail -f /var/log/ufw.log
# UFW BLOCK IN=eth0 ... SRC=1.2.3.4 DST=143.198.100.50 ... DPT=3306
# (someone was trying to reach MySQL from the internet)
```

<!-- RESOURCES -->

- [DigitalOcean - ufw Essentials](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands) -- type: tutorial, time: 20m
- [ufw man page](https://manpages.ubuntu.com/manpages/focal/en/man8/ufw.8.html) -- type: reference, time: 10m
