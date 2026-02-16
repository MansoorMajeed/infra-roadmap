---
id: "tls-and-certificates"
title: "TLS, Certificates & HTTPS"
zone: "networking"
edges:
  from:
    - id: "encryption-basics"
      question: "I understand encryption. How does the web actually use it to secure traffic?"
      detail: "You know about symmetric and asymmetric encryption, and why we need both. Now comes the real question: how do your browser and a server you have never talked to before establish an encrypted connection? That is what TLS does — it is the protocol that turns HTTP into HTTPS, and it uses everything you just learned about encryption in a clever handshake."
  to:
    - id: "exposing-your-app"
      question: "I understand HTTPS and TLS. Now how do I actually deploy my app with a real certificate?"
      detail: "You know how TLS works, what certificates are, and why HTTPS matters. Now it is time to put it all together — get a server, configure Nginx with a TLS certificate, set up your domain, and make your app accessible to the world over HTTPS. This is the final step from understanding networking to running a real, secure, public-facing application."
difficulty: 2
tags: ["tls", "ssl", "https", "certificates", "certificate-authority", "lets-encrypt"]
category: "concept"
milestones:
  - "Understand the TLS handshake and what happens when you visit an HTTPS site"
  - "Explain what a certificate is and what a Certificate Authority does"
  - "Inspect a website's certificate in your browser or with openssl"
---

You visit `https://mybank.com` and type your password. How do you know the connection is actually encrypted? How does your browser know it is really talking to the bank and not an attacker? And how did they establish a shared encryption key without anyone eavesdropping? The answer to all of these is **TLS** — the protocol that makes HTTPS work.

<!-- DEEP_DIVE -->

**TLS** (Transport Layer Security) is the protocol that encrypts HTTP traffic, turning it into HTTPS. It sits between TCP and HTTP — TCP handles reliable delivery, TLS encrypts the data, and HTTP defines the meaning. The older name, **SSL** (Secure Sockets Layer), is technically deprecated but you will still hear people say "SSL certificate" everywhere. They mean TLS.

**The TLS Handshake** is what happens when your browser connects to an HTTPS site. It takes a fraction of a second, but a lot happens:

```
Browser                                    Server
   │                                          │
   ├──── Client Hello ───────────────────────→│  "I want to talk securely.
   │     (supported TLS versions,             │   Here are the ciphers I support."
   │      supported ciphers)                  │
   │                                          │
   │←─── Server Hello ───────────────────────┤  "Let's use TLS 1.3 with
   │     (chosen cipher,                      │   AES-256. Here's my certificate."
   │      server certificate)                 │
   │                                          │
   │     Browser verifies certificate         │  "Is this cert signed by a
   │     against trusted CAs                  │   CA I trust? Is it expired?
   │                                          │   Does the domain match?"
   │                                          │
   ├──── Key Exchange ───────────────────────→│  Both sides generate a shared
   │←────────────────────────────────────────┤  symmetric key using the
   │                                          │  server's public key
   │                                          │
   │←───── Encrypted HTTP traffic ──────────→│  All data is now encrypted
   │       (using symmetric AES key)          │  with the shared key
```

After the handshake, everything is encrypted with AES (symmetric, fast). The asymmetric cryptography was only used during the handshake to securely exchange the symmetric key — exactly the hybrid approach from the encryption basics.

**Certificates** are how the server proves its identity. A certificate is a file that says "this public key belongs to mystore.com" and is signed by a trusted third party. It contains:

- The domain name(s) the certificate is valid for
- The server's public key
- Who issued (signed) the certificate
- When it expires
- A digital signature proving it has not been tampered with

You can inspect any site's certificate:

```bash
# View a website's certificate with openssl
openssl s_client -connect google.com:443 -servername google.com 2>/dev/null | \
  openssl x509 -noout -text | head -20

# Quick check — see the issuer and expiry
openssl s_client -connect google.com:443 -servername google.com 2>/dev/null | \
  openssl x509 -noout -issuer -dates

# Or just click the lock icon in your browser's address bar
```

**Certificate Authorities (CAs)** are the trusted third parties that sign certificates. Your browser and operating system ship with a list of trusted CAs (about 100-150 of them). When a server presents a certificate, your browser checks: "Was this signed by a CA I trust?" If yes, the connection proceeds. If not, you get the scary "Your connection is not private" warning.

The **chain of trust** works like this:

```
Root CA (pre-installed in your browser)
  └── signs → Intermediate CA
                └── signs → Your server's certificate
```

Root CA keys are kept in offline vaults. They sign intermediate CA certificates, and intermediates sign server certificates. If a root CA's key were compromised, every certificate they ever signed would be untrustworthy — so root keys are guarded extremely carefully.

**Let's Encrypt** changed everything. Before 2015, SSL certificates cost $50-300/year and required a manual verification process. Let's Encrypt is a free, automated Certificate Authority that issues certificates in seconds:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get a certificate — fully automated
sudo certbot --nginx -d mystore.com -d www.mystore.com

# Certbot:
# 1. Proves you control the domain (places a file, Let's Encrypt checks it)
# 2. Issues a certificate
# 3. Configures Nginx to use it
# 4. Sets up auto-renewal (certs expire every 90 days)
```

After running Certbot, your Nginx config is updated to serve HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name mystore.com;

    ssl_certificate /etc/letsencrypt/live/mystore.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mystore.com/privkey.pem;

    # ... rest of your config
}

server {
    listen 80;
    server_name mystore.com;
    return 301 https://$server_name$request_uri;  # Redirect HTTP → HTTPS
}
```

**Common TLS issues you will debug as an SRE:**

- **Certificate expired** — Let's Encrypt certs last 90 days. If auto-renewal breaks, your site shows a scary warning. Monitor cert expiry.
- **Domain mismatch** — The certificate says `mystore.com` but you are visiting `www.mystore.com`. Make sure the cert covers all your domains.
- **Mixed content** — Your HTTPS page loads images or scripts over plain HTTP. Browsers block this. All resources must use HTTPS.
- **Intermediate certificate missing** — Your server sends its cert but not the intermediate CA cert. Some browsers fill in the gap, others reject the connection.
- **TLS version too old** — TLS 1.0 and 1.1 are deprecated. Modern browsers require TLS 1.2 or 1.3.

```bash
# Test TLS configuration of a site
curl -vI https://mystore.com 2>&1 | grep -E "SSL|TLS|subject|issuer|expire"

# Check if a cert is valid and not expired
echo | openssl s_client -connect mystore.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

**Why SREs care:** TLS certificate management is one of the most common sources of outages. Expired certificates cause immediate, visible failures. Understanding TLS helps you debug connection issues, manage certificate rotation, configure secure defaults, and respond to security advisories about cryptographic vulnerabilities.

<!-- RESOURCES -->

- [Cloudflare - How does TLS work?](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/) -- type: article, time: 15m
- [Let's Encrypt - How It Works](https://letsencrypt.org/how-it-works/) -- type: article, time: 10m
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/) -- type: tool, time: 5m
- [Certbot Instructions](https://certbot.eff.org/instructions) -- type: tutorial, time: 15m
- [Julia Evans - TLS Zine](https://wizardzines.com/zines/tls/) -- type: zine, time: 15m
