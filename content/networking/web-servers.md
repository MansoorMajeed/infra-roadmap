---
id: "web-servers"
title: "Web Servers & Reverse Proxies"
zone: "networking"
edges:
  from:
    - id: "tcp-udp-basics"
      question: "I understand how data travels. Now what sits between the internet and my app?"
      detail: "Your app can listen on a port and speak TCP, but you should not expose it directly to the internet. Web servers like Nginx and Apache sit in front of your application — they handle SSL, serve static files, manage connections, and forward requests to your app. Understanding reverse proxies is essential for deploying any web application properly."
  to:
    - id: "http-protocol"
      question: "My web server is running. But how does the browser actually know how to talk to it?"
      detail: "You have Nginx serving your app on the local network. Your phone can reach it. But what exactly is the browser sending, and what is the server sending back? There is a protocol on top of TCP that defines the language — HTTP. Understanding HTTP methods, status codes, headers, and the request-response cycle is fundamental to everything on the web."
difficulty: 1
tags: ["nginx", "apache", "reverse-proxy", "web-server", "http", "ssl"]
category: "tool"
milestones:
  - "Install Nginx and serve a static HTML page"
  - "Configure Nginx as a reverse proxy to a backend app"
  - "Understand the difference between a web server and an application server"
---

You understand TCP, ports, and how data travels. Your Flask app listens on port 5000 and responds to HTTP requests. But you should not point the internet directly at your Flask app. Between the internet and your application sits a **web server** — software like Nginx or Apache that handles connections, serves static files, terminates SSL, and forwards dynamic requests to your app. This is called a **reverse proxy**, and it is a fundamental piece of every production deployment.

<!-- DEEP_DIVE -->

A **web server** is software that listens on port 80 (HTTP) or 443 (HTTPS) and responds to web requests. In the early days, that meant serving HTML files from a directory. You put `index.html` in `/var/www/html/`, and when someone visited your domain, the web server would read that file and send it back. This still works and is how many static sites are served.

**Nginx** (pronounced "engine-x") is the most popular web server today. Install it on Ubuntu with `sudo apt install nginx`, and it immediately starts serving a default welcome page on port 80. Its configuration lives in `/etc/nginx/`:

```nginx
server {
    listen 80;
    server_name mystore.com;

    # Serve static files directly
    location /static/ {
        root /var/www/mystore;
    }

    # Forward everything else to Flask
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

This configuration does two things: it serves static files (CSS, JS, images) directly from disk — which is much faster than routing them through Python — and it forwards all other requests to your Flask app running on port 5000. Your Flask app never talks to the internet directly; Nginx handles that.

**Why not expose Flask directly?** Several reasons:

1. **Performance** — Nginx is written in C and designed to handle tens of thousands of simultaneous connections. Flask's built-in server is single-threaded and meant for development.
2. **Static files** — Nginx serves static content extremely efficiently. Your Flask app does not need to waste time sending CSS files.
3. **SSL/TLS** — Nginx handles HTTPS encryption. Your app does not need to worry about certificates.
4. **Security** — Nginx can rate-limit requests, block bad actors, and hide your application server's details from the outside world.
5. **Buffering** — Nginx buffers slow client connections so your app does not have to wait for users on slow networks.

**Apache** (`httpd`) is the other major web server. It has been around since 1995 and still powers a large portion of the internet. Apache uses a different configuration style (`.htaccess` files, `<VirtualHost>` blocks) and a different processing model, but serves the same fundamental purpose. Nginx tends to be preferred for reverse proxy setups and high-concurrency scenarios, while Apache has deeper module support.

The **reverse proxy** pattern is worth understanding deeply because it appears everywhere in production systems. In its simplest form, it is what we showed above — Nginx forwards requests to a single backend. But reverse proxies can also load-balance across multiple backends, cache responses, compress content, rewrite URLs, and route requests to different services based on the URL path. This is the entry point to more complex architectures.

When you run your app in production, the typical setup is: **Nginx** listens on port 80/443, terminates SSL, serves static files, and proxies dynamic requests to **Gunicorn** (a production Python WSGI server) which runs your **Flask/Django** app. The chain is: Internet → Nginx (port 443) → Gunicorn (port 5000) → Your Python code.

```bash
# Install and run gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

This runs 4 worker processes, each handling requests to your app. Nginx distributes incoming requests across these workers, giving you much better performance than Flask's development server.

<!-- RESOURCES -->

- [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html) -- type: tutorial, time: 30m
- [DigitalOcean - How To Set Up Nginx as a Reverse Proxy](https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy-on-ubuntu-22-04) -- type: tutorial, time: 30m
- [Gunicorn Documentation](https://docs.gunicorn.org/en/stable/) -- type: reference, time: 20m
- [Apache vs Nginx - DigitalOcean](https://www.digitalocean.com/community/tutorials/apache-vs-nginx-practical-considerations) -- type: article, time: 15m
