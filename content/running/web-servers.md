---
id: "web-servers"
title: "Web Servers"
zone: "running"
edges:
  from:
    - id: "deploying-your-code"
      question: "My code is on the server. What software actually serves it to users?"
      detail: "You have your application running on the server, but it is using Flask's built-in development server. That is not production-ready — it handles one request at a time and crashes without useful errors. You need a real web server like Nginx to handle HTTP traffic, serve static files, and proxy requests to your application."
  to:
    - id: "dns-and-domain-names"
      question: "My web server works, but I'm using raw IP addresses. How do I give my site a real name?"
      detail: "Nginx is running and I can hit it with the IP address. But I need an actual domain name — something people can type. I have no idea how domain names get tied to IP addresses or what I'd have to set up to make my-app.example.com point at my server."
    - id: "tls-and-certificates"
      question: "My web server works over HTTP, but I need HTTPS. How do I set up TLS?"
      detail: "My site works over HTTP but the browser is showing a 'Not Secure' warning. I know I need HTTPS but I have no idea how to get a certificate or what TLS actually involves. How does any of this work, and how do I get the padlock?"
    - id: "reading-logs"
      question: "Nginx is running and serving traffic. How do I see what requests are coming in?"
      detail: "Nginx is serving traffic but I have no visibility into what's happening. Is my app actually responding? Are there errors? What URLs are people hitting? There must be a log somewhere that shows me all of this — where is it and how do I make sense of it?"
difficulty: 1
tags: ["nginx", "apache", "web-server", "http", "static-files", "serving"]
category: "tool"
milestones:
  - "Install Nginx and serve a static HTML page"
  - "Configure Nginx to serve different content based on URL path"
  - "Understand the difference between a web server and your Flask dev server"
---

Your Flask app has a built-in web server — you run `python app.py` and it serves pages on port 5000. But that server is designed for development. It handles one request at a time, crashes without helpful errors, and has no concept of security or performance. Real websites are served by dedicated **web server** software — programs that are built from the ground up to handle HTTP traffic reliably and efficiently.

<!-- DEEP_DIVE -->

A **web server** is a program that listens for HTTP requests and sends back HTTP responses. That is it. At its core, it is surprisingly simple: a client asks for a file, and the server sends it back.

In the early web, that was literally all web servers did — serve files. You put `index.html` in a directory, and when someone visited your site, the web server read that file from disk and sent it back over HTTP. This still works and is how many static sites are served today.

**Nginx** (pronounced "engine-x") is the most popular web server. Install it on Ubuntu with `sudo apt install nginx`, and it immediately starts serving a default welcome page on port 80:

```bash
# Install Nginx
sudo apt install nginx

# Check it is running
sudo systemctl status nginx

# The default page is served from:
ls /var/www/html/
# index.nginx-debian.html
```

Visit `http://your-ip` in a browser and you see the Nginx welcome page. That is a web server doing its job — listening on port 80 and serving an HTML file.

**Nginx configuration** lives in `/etc/nginx/`. Here is a simple config that serves a website:

```nginx
server {
    listen 80;
    server_name mystore.com;

    root /var/www/mystore;
    index index.html;

    # Serve files from the /var/www/mystore directory
    location / {
        try_files $uri $uri/ =404;
    }

    # Serve static assets with caching headers
    location /static/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Put your HTML, CSS, JavaScript, and images in `/var/www/mystore/`, reload Nginx (`sudo nginx -s reload`), and your site is live. Nginx will serve those files to anyone who connects.

**Why not just use Flask's built-in server?** The differences are enormous:

| | Flask dev server | Nginx |
|---|---|---|
| **Connections** | One at a time (single-threaded) | Thousands simultaneously |
| **Static files** | Slow (goes through Python) | Blazing fast (reads directly from disk) |
| **Stability** | Crashes on errors | Keeps running, logs errors |
| **Performance** | Written in Python | Written in C, highly optimized |
| **Security** | No built-in protections | Rate limiting, access control, header management |

For your Flask or Django app, the production setup uses a **WSGI server** like Gunicorn to run your Python code, and Nginx in front to handle the HTTP layer:

```bash
# Run your Flask app with Gunicorn (production Python server)
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

Gunicorn runs 4 worker processes of your app, each able to handle requests. Nginx receives HTTP requests from the network and passes them to Gunicorn. This separation of concerns — Nginx handles HTTP, Gunicorn handles Python — is how virtually every Python web application is deployed.

**Apache** (`httpd`) is the other major web server. It has been around since 1995 and still powers a significant portion of the internet. Apache uses a different configuration style (`.htaccess` files, `<VirtualHost>` blocks) and a different architecture, but serves the same fundamental purpose. You will encounter Apache in legacy environments, WordPress hosting, and PHP applications.

```apache
# Apache virtual host configuration
<VirtualHost *:80>
    ServerName mystore.com
    DocumentRoot /var/www/mystore

    <Directory /var/www/mystore>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Virtual hosts** let a single web server handle multiple websites. One Nginx instance can serve `mystore.com` from one directory and `myblog.com` from another, routing requests based on the `Host` header. This is how shared hosting works — hundreds of websites on one server.

**Access logs** are one of the most useful things a web server gives you. Every request is logged:

```
192.168.1.43 - - [15/Jan/2024:14:30:00 +0000] "GET /products HTTP/1.1" 200 4523
192.168.1.43 - - [15/Jan/2024:14:30:01 +0000] "GET /static/style.css HTTP/1.1" 304 0
10.0.0.5 - - [15/Jan/2024:14:30:05 +0000] "POST /api/order HTTP/1.1" 500 128
```

Each line tells you: who connected (IP), when, what they requested (method + path), the status code, and the response size. When something goes wrong, this is the first place you look. As an SRE, you will spend a lot of time reading web server logs.

**Why SREs care:** Web servers are the front door to almost every service. Nginx and Apache configuration, log analysis, performance tuning, and troubleshooting are core SRE skills. Understanding how a web server handles requests — from accepting the TCP connection to sending the response — helps you debug everything from slow pages to connection timeouts to 502 errors.

<!-- RESOURCES -->

- [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html) -- type: tutorial, time: 30m
- [DigitalOcean - How To Install Nginx](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04) -- type: tutorial, time: 20m
- [Apache vs Nginx - DigitalOcean](https://www.digitalocean.com/community/tutorials/apache-vs-nginx-practical-considerations) -- type: article, time: 15m
- [Nginx Documentation](https://nginx.org/en/docs/) -- type: reference, time: varies
