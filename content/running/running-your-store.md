---
id: "running-your-store"
title: "Running Your Store"
zone: "running"
edges:
  from:
    - id: "dns-and-domain-names"
      question: "I have a domain name. How do I put it all together and deploy my app?"
      detail: "You know how DNS translates names to IPs, how to register a domain, and how records work. Now it is time to put it all together — point your domain at your server, configure Nginx as a reverse proxy, get HTTPS with Certbot, and make your ecommerce store accessible to the world. This is the culmination of everything you have learned."
    - id: "tls-and-certificates"
      question: "I understand HTTPS and TLS. How do I put it all together and deploy?"
      detail: "You know how TLS works, what certificates are, and how to get a free certificate with Let's Encrypt. Combined with DNS and web server knowledge, you have all the pieces. Now it is time to put it all together — deploy your Flask app with Gunicorn, configure Nginx, set up DNS, enable HTTPS, and make your store live."
  to: []
difficulty: 2
tags: ["deployment", "gunicorn", "nginx", "certbot", "systemd", "production"]
category: "practice"
milestones:
  - "Deploy a Flask app on a cloud VM with Gunicorn and Nginx"
  - "Configure DNS, obtain a TLS certificate, and serve over HTTPS"
  - "Access your running app from your phone using your domain name"
---

This is it. You have built an ecommerce store — Flask app, database, the works. You understand networking, servers, Linux, web servers, DNS, and TLS. Now you are going to put it all together: take your app from your laptop and get it running on a real server, with a real domain name, over HTTPS, accessible to anyone in the world. This is the full deployment walkthrough.

<!-- DEEP_DIVE -->

**The goal:** Go from `localhost:5000` on your laptop to `https://mystore.com` accessible to anyone.

**What you need before starting:**
- A cloud VM with a public IP (from a provider like DigitalOcean — $6/month)
- A registered domain name (from Namecheap, Cloudflare, Porkbun — ~$10/year)
- Your application code in a Git repository
- SSH access to your server

**Step 1: Set up the server**

You already know how to do this from the Linux basics:

```bash
# SSH into your server
ssh deploy@143.198.100.50

# Update the system
sudo apt update && sudo apt upgrade -y

# Install everything you need
sudo apt install -y python3 python3-pip python3-venv nginx git certbot python3-certbot-nginx
```

**Step 2: Deploy your application code**

```bash
# Clone your repository
cd /home/deploy
git clone https://github.com/you/mystore.git
cd mystore

# Create a virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

**Step 3: Test with Gunicorn**

Gunicorn is a production WSGI server. It replaces Flask's built-in development server:

```bash
# Test that your app runs
gunicorn -w 4 -b 127.0.0.1:5000 app:app

# -w 4: run 4 worker processes (handles 4 requests simultaneously)
# -b 127.0.0.1:5000: bind to localhost port 5000
# app:app: the Flask application object
```

Visit `http://143.198.100.50:5000` — wait, that will not work. Gunicorn is listening on `127.0.0.1` (localhost only). That is intentional — Nginx will be the public-facing front end. Press `Ctrl+C` to stop Gunicorn for now.

**Step 4: Create a systemd service**

You want Gunicorn to start automatically and restart if it crashes:

```ini
# Create /etc/systemd/system/mystore.service
[Unit]
Description=My Store - Gunicorn
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/mystore
ExecStart=/home/deploy/mystore/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=3
Environment=FLASK_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mystore
sudo systemctl start mystore
sudo systemctl status mystore
# Should show "active (running)"
```

**Step 5: Configure Nginx as a reverse proxy**

Nginx receives HTTP requests from the internet and forwards them to Gunicorn:

```nginx
# /etc/nginx/sites-available/mystore
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
        alias /home/deploy/mystore/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mystore /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # Remove default site

# Test the config and reload
sudo nginx -t
sudo systemctl reload nginx
```

Now visit `http://143.198.100.50` — you should see your app. Nginx is receiving the request on port 80 and proxying it to Gunicorn on port 5000.

**Step 6: Point your domain at the server**

In your domain registrar's DNS settings, create A records:

```
Type: A    Name: @              Value: 143.198.100.50    TTL: 300
Type: A    Name: www            Value: 143.198.100.50    TTL: 300
```

Wait a few minutes for DNS propagation, then verify:

```bash
dig mystore.com +short
# Should return 143.198.100.50
```

Visit `http://mystore.com` — your app should load. You are now serving your app on your own domain.

**Step 7: Enable HTTPS with Certbot**

The final step — encrypt everything with a free Let's Encrypt certificate:

```bash
sudo certbot --nginx -d mystore.com -d www.mystore.com
```

Certbot will:
1. Verify you control the domain (by placing a file and having Let's Encrypt check it)
2. Obtain a TLS certificate
3. Automatically update your Nginx config to serve HTTPS on port 443
4. Set up HTTP → HTTPS redirect
5. Configure auto-renewal (certificates expire every 90 days)

```bash
# Verify auto-renewal works
sudo certbot renew --dry-run
```

**Step 8: Set up the firewall**

Lock down everything except what you need:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP (for redirect to HTTPS)
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

**You are live.** Open your phone, type `https://mystore.com`, and see your store. The padlock icon shows HTTPS is working. Your friend across the country can access it. Anyone in the world can access it.

**What is actually happening on every request:**

```
Customer's phone
  → DNS lookup: mystore.com → 143.198.100.50
  → TCP connection to 143.198.100.50:443
  → TLS handshake (certificate verified, encryption established)
  → HTTP request: GET /products
  → Nginx receives the request
  → Nginx proxies to Gunicorn at 127.0.0.1:5000
  → Gunicorn hands it to a Flask worker
  → Flask processes the request, queries the database
  → Response travels back: Flask → Gunicorn → Nginx → TLS encryption → Internet → Phone
  → Customer sees the products page
```

Every piece of this — TCP, HTTP, DNS, TLS, Nginx, Gunicorn, systemd — is something you learned on the way here. Nothing is magic anymore.

**The deployment checklist:**

- [ ] Cloud VM running Ubuntu with a public IP
- [ ] Non-root user with SSH key authentication
- [ ] Application code cloned and dependencies installed
- [ ] Gunicorn running your app as a systemd service
- [ ] Nginx configured as a reverse proxy
- [ ] Domain A records pointing to your server
- [ ] TLS certificate installed with Certbot
- [ ] Firewall configured (UFW: 22, 80, 443)
- [ ] Site accessible at `https://yourdomain.com`

This is a real deployment. It is manual, it is a single server, and it will not scale to millions of users. But it is real — and every concept from here on (containers, CI/CD, load balancers, auto-scaling) builds on this foundation. You just deployed a web application. That is a genuine accomplishment.

<!-- RESOURCES -->

- [DigitalOcean - Deploy Flask with Gunicorn and Nginx](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-22-04) -- type: tutorial, time: 45m
- [Certbot Instructions for Nginx on Ubuntu](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal) -- type: tutorial, time: 15m
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) -- type: reference, time: 15m
- [UFW Essentials - DigitalOcean](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands) -- type: reference, time: 15m
