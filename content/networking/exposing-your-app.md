---
id: "exposing-your-app"
title: "Exposing Your App to the Internet"
zone: "networking"
edges:
  from:
    - id: "tls-and-certificates"
      question: "I understand HTTPS and TLS. Now how do I actually deploy my app with a real certificate?"
      detail: "You know how TLS works, what certificates are, and why HTTPS matters. Now it is time to put it all together — get a server, configure Nginx with a TLS certificate, set up your domain, and make your app accessible to the world over HTTPS. This is the final step from understanding networking to running a real, secure, public-facing application."
    - id: "dns-and-domain-names"
      question: "I have a domain name and understand DNS. How do I actually deploy my app to the internet?"
      detail: "You know how DNS translates names to IPs, how to register a domain, and how records work. Now it is time to put it all together — get a server with a public IP, point your domain at it, configure Nginx, and make your app accessible to the world. Combined with HTTPS, this is the final step from understanding networking to running a real, public-facing application."
  to: []
difficulty: 2
tags: ["deployment", "cloud", "firewall", "server", "ssh", "production"]
category: "practice"
milestones:
  - "Deploy your app to a cloud VM with a public IP"
  - "Configure Nginx, DNS, and HTTPS end-to-end"
  - "Access your app from another device using your domain name over HTTPS"
---

You understand networking from the ground up — how computers connect, how protocols work, how TCP carries data, how HTTP structures requests, how IP addressing and DNS route traffic to the right place, and how TLS encrypts everything. Now it is time to do it for real. Get a server, put your app on it, and make it accessible to anyone in the world.

<!-- DEEP_DIVE -->

**Getting a server with a public IP** is the first step. You need a machine on the internet, not behind your home router. The standard approach is renting a **cloud VM** (Virtual Machine):

- **DigitalOcean Droplet** — $4-6/month for a basic server. Simple, great for learning.
- **AWS EC2** — More complex but industry standard. Free tier available for the first year.
- **Linode, Vultr, Hetzner** — Similar to DigitalOcean, slightly different pricing.

You create a VM, choose an operating system (Ubuntu is the most common), and get a public IP address. Then you connect to it with SSH:

```bash
# Connect to your new server
ssh root@73.42.100.15

# First thing: create a non-root user
adduser deploy
usermod -aG sudo deploy

# Set up SSH key authentication (more secure than passwords)
# On your local machine:
ssh-copy-id deploy@73.42.100.15
```

**Deploying your application** means getting your code, dependencies, and configuration onto this server:

```bash
# On the server:
# Install system dependencies
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx

# Clone your code
git clone https://github.com/you/mystore.git
cd mystore

# Set up a virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run your app with Gunicorn (production WSGI server)
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

Your app is now running on the server, listening on `127.0.0.1:5000`. But it is only accessible from the server itself — just like localhost on your laptop. You need Nginx in front to accept traffic from the internet and pass it to your app.

**Configure Nginx** to forward requests to your application:

```nginx
server {
    listen 80;
    server_name mystore.com www.mystore.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        root /home/deploy/mystore;
        expires 30d;
    }
}
```

This is a **reverse proxy** configuration — Nginx receives requests from the internet and forwards them to your application. The outside world talks to Nginx on port 80, and Nginx talks to Gunicorn on port 5000. This gives you the security and performance benefits of Nginx while running your Python app behind it.

**Point your domain's DNS** to the server. In your domain registrar's settings, create an A record:

```
mystore.com     → A → 73.42.100.15
www.mystore.com → A → 73.42.100.15
```

Wait a few minutes for DNS propagation, then verify: `dig mystore.com +short` should return your server's IP.

**Firewalls** control which traffic reaches your server. Lock everything down and only open what you need:

```bash
# UFW (Uncomplicated Firewall) on Ubuntu
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

Cloud providers also have security groups or firewall rules at the network level. On AWS, your EC2 instance's security group must explicitly allow these ports.

**Enable HTTPS** with Let's Encrypt and Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mystore.com -d www.mystore.com
```

Certbot obtains a TLS certificate, configures Nginx to serve HTTPS on port 443, and sets up a redirect from HTTP to HTTPS. It also configures auto-renewal so the certificate refreshes before it expires.

**Keep your app running** with a process manager. If your server reboots or Gunicorn crashes, you want it to restart automatically. **systemd** is the standard way:

```ini
# /etc/systemd/system/mystore.service
[Unit]
Description=My Store Application
After=network.target

[Service]
User=deploy
WorkingDirectory=/home/deploy/mystore
ExecStart=/home/deploy/mystore/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable mystore
sudo systemctl start mystore
sudo systemctl status mystore
```

Now your app starts on boot, restarts on crashes, and its logs are accessible with `journalctl -u mystore`.

**The full deployment checklist:**

1. Rent a cloud VM, SSH in
2. Install dependencies (Python, Nginx, Certbot)
3. Clone your code, set up virtualenv, install packages
4. Run with Gunicorn, create a systemd service
5. Configure Nginx as a reverse proxy
6. Set up firewall rules (22, 80, 443)
7. Point your domain's DNS to the server
8. Run Certbot for HTTPS
9. Visit `https://mystore.com` from your phone — your app is live

That is it. You have gone from "Hello World" to a real application, accessible to anyone in the world, with a proper domain and HTTPS. The journey from here leads to scaling (what happens when more users show up), automation (deploying manually is tedious), and observability (how do you know if it is working). But right now — you deployed a web application. That is a real accomplishment.

<!-- RESOURCES -->

- [DigitalOcean - Initial Server Setup with Ubuntu](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04) -- type: tutorial, time: 20m
- [DigitalOcean - Deploy Flask with Gunicorn and Nginx](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-22-04) -- type: tutorial, time: 45m
- [UFW Essentials - DigitalOcean](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands) -- type: reference, time: 15m
- [Certbot Instructions](https://certbot.eff.org/instructions) -- type: tutorial, time: 15m
