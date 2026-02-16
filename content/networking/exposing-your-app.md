---
id: "exposing-your-app"
title: "Exposing Your App to the Internet"
zone: "networking"
edges:
  from:
    - id: "web-servers"
      question: "I have a web server set up. How do I actually make my app accessible from the internet?"
      detail: "You have Nginx reverse-proxying to your Flask app on a server. But the server only has an IP address, and nobody is going to type http://73.42.100.15 into their browser. You need a domain name, DNS records, HTTPS certificates, and firewall rules. This is the last mile — going from a running server to a real, publicly accessible website."
  to: []
difficulty: 2
tags: ["dns", "domains", "deployment", "cloud", "firewall", "https", "ssl"]
category: "practice"
milestones:
  - "Get a domain name and configure DNS records"
  - "Deploy your app to a cloud VM with a public IP"
  - "Access your app from another device using your domain name"
  - "Set up HTTPS with Let's Encrypt"
---

You have a Flask app, Nginx reverse-proxying to it, and everything works on a server. But the server has an IP address like `73.42.100.15`, and nobody is going to remember that or type it into their browser. To go from "app running on a server" to "people can visit mystore.com," you need DNS, a domain name, HTTPS, and proper firewall rules. This is the last mile — and crossing it means you have truly deployed a web application.

<!-- DEEP_DIVE -->

**DNS** (Domain Name System) is the phone book of the internet. When someone types `mystore.com` into their browser, the first thing that happens is a DNS lookup — the browser asks a DNS server "what IP address does mystore.com point to?" and gets back something like `73.42.100.15`. Only then does the browser connect to that IP.

Buying a domain and setting up DNS involves a few steps:

1. **Register a domain** at a registrar (Namecheap, Cloudflare, Google Domains). This costs $10-15/year for a `.com`.
2. **Create an A record** — this maps your domain to your server's IP address. In your DNS settings, you create a record like: `mystore.com → A → 73.42.100.15`.
3. **Wait for propagation** — DNS changes take a few minutes to a few hours to propagate worldwide. You can check with `dig mystore.com` or `nslookup mystore.com`.

```bash
# Check what IP a domain resolves to
dig mystore.com +short

# Check DNS propagation step by step
dig mystore.com @8.8.8.8  # Ask Google's DNS
dig mystore.com @1.1.1.1  # Ask Cloudflare's DNS
```

**Getting a server with a public IP** is the next step. You need a machine on the internet, not behind a home router. The standard approach is renting a **cloud VM**:

- **DigitalOcean Droplet** — $4-6/month for a basic server. Simple, great for learning.
- **AWS EC2** — More complex but industry standard. Free tier available for the first year.
- **Linode, Vultr, Hetzner** — Similar to DigitalOcean, slightly different pricing.

You create a VM, get a public IP address, SSH into it, install your app, install Nginx, configure the reverse proxy, and point your domain's DNS to that IP.

**Firewalls** control which traffic is allowed to reach your server. By default, you should block everything and only open what you need:

```bash
# UFW (Uncomplicated Firewall) on Ubuntu
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH - so you can still access the server
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

Cloud providers also have security groups or firewall rules at the network level. On AWS, your EC2 instance has a security group that must explicitly allow ports 80 and 443 for web traffic and port 22 for SSH.

**HTTPS** is non-negotiable for any real website. It encrypts traffic between the browser and your server, so nobody can snoop on passwords, credit card numbers, or personal data. **Let's Encrypt** provides free SSL certificates, and **Certbot** automates the process:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mystore.com
```

Certbot modifies your Nginx configuration to serve HTTPS on port 443 and redirects HTTP traffic to HTTPS. It also sets up automatic certificate renewal — certificates expire every 90 days, but Certbot handles this with a cron job.

**The full deployment path**, from laptop to live:

1. Rent a cloud VM (DigitalOcean Droplet, $5/month)
2. SSH in: `ssh root@73.42.100.15`
3. Install Python, your app's dependencies, Nginx, Gunicorn
4. Clone your app's code, set up the database
5. Run Gunicorn: `gunicorn -w 4 -b 127.0.0.1:5000 app:app`
6. Configure Nginx as a reverse proxy
7. Set up firewall rules (ports 22, 80, 443)
8. Register a domain, create an A record pointing to your server's IP
9. Run Certbot for HTTPS
10. Visit `https://mystore.com` from your phone — your app is live

That is it. You have gone from "Hello World" to a real application, accessible to anyone in the world, with a proper domain and HTTPS. The journey from here leads to scaling (what happens when more users show up), automation (deploying manually is tedious), and observability (how do you know if it is working). But right now, take a moment — you deployed a web application. That is a real accomplishment.

<!-- RESOURCES -->

- [DigitalOcean - Initial Server Setup with Ubuntu](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04) -- type: tutorial, time: 20m
- [Cloudflare - What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/) -- type: article, time: 10m
- [Let's Encrypt - Getting Started](https://letsencrypt.org/getting-started/) -- type: tutorial, time: 15m
- [DigitalOcean - How To Deploy a Flask App with Gunicorn and Nginx](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-22-04) -- type: tutorial, time: 45m
- [UFW Essentials - DigitalOcean](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands) -- type: reference, time: 15m
