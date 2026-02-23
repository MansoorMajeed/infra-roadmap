---
id: it-works-on-my-laptop
title: It Works on My Laptop
zone: building
edges:
  to:
    - id: local-network
      zone: networking
      question: Why can't anyone else reach my app? What even is a network?
      detail: >-
        I bound to 0.0.0.0 and my phone can reach the app when we're on the same
        WiFi — but my friend across town still can't. I don't understand why.
        There must be something about how networks are structured that explains
        this, but I don't know what I'm missing.
    - id: where-do-i-run-this
      zone: running
      question: My app works locally. Where do I actually run this for real?
      detail: >-
        I can't run a production service from my laptop — it goes to sleep, I
        carry it around, the IP changes. I need something that's always on and
        always reachable. But I have no idea what that actually means or what my
        options are.
difficulty: 1
tags:
  - localhost
  - networking
  - deployment
  - ports
  - development-environment
category: concept
milestones:
  - Understand why localhost is only accessible from your own machine
  - Try to access your app from another device on the same network
  - Identify what you would need to make your app publicly accessible
---

You built an online store. It has products, users, a shopping cart, checkout — the works. You run `python app.py`, open `http://localhost:5000` in your browser, and everything works perfectly. Then you try to share it with a friend. You send them the URL. They cannot connect. You text them "just go to localhost:5000" and they tell you it does not work. Of course it does not — localhost means your machine, and your machine only.

<!-- DEEP_DIVE -->

**localhost** (or `127.0.0.1`) is a special address that always points to the computer you are currently on. When your Flask app listens on `localhost:5000`, it is only accepting connections from your own machine. It is like having a shop with the door locked from the inside — you can walk around inside, but nobody else can get in.

This is actually a good thing for development. You do not want random people on the internet hitting your half-finished app. But at some point, you need to open that door.

The first thing you might try is binding to `0.0.0.0` instead of `localhost`:

```python
app.run(host="0.0.0.0", port=5000)
```

This tells your app to listen on all network interfaces, not just the loopback. Now other devices on your local network (your phone on the same WiFi, another computer in your house) can reach your app by going to your computer's local IP address, something like `http://192.168.1.42:5000`.

But this still does not work for people outside your network. Your friend across town, a customer in another country — they cannot reach `192.168.1.42` because that is a **private IP address**. It only exists within your home network. The internet does not know how to route to it.

To understand why, you need to understand how networks actually work:

- **Your app** listens on a port (5000) on your machine
- **Your machine** has a private IP (192.168.1.42) on your home network
- **Your router** has a public IP (say, 73.42.100.15) assigned by your ISP
- **The internet** can only see your router's public IP, not your machine

For someone on the internet to reach your app, the request has to travel from their computer → through the internet → to your router's public IP → somehow get forwarded to your machine → and hit port 5000. Every step in that chain has requirements: DNS to translate a domain name to an IP, routing to move packets across networks, port forwarding or a public server to bridge the gap between the internet and your local machine.

This is the "it works on my laptop" wall. Almost every developer hits it. And solving it requires understanding networking — how data actually travels between computers, what TCP and ports really are, how web servers work, and how to expose an application to the world. It is a big topic, but it is the bridge between "I can build software" and "I can run software that people actually use."

The typical solutions, in order of complexity:

1. **Tunneling services** (ngrok, Cloudflare Tunnel) — punch a temporary hole from the internet to your laptop. Great for demos, terrible for production.
2. **Cloud VM** (AWS EC2, DigitalOcean Droplet) — rent a server with a public IP, deploy your app there. This is real deployment.
3. **Platform as a Service** (Heroku, Railway, Render) — push your code and they handle the server. Convenient but less educational.

Each of these requires networking knowledge to understand and debug. When something goes wrong — and it will — you need to know what a port is, how TCP works, what a reverse proxy does, and how DNS translates a name to an address.

<!-- RESOURCES -->

- [What is localhost? - MDN](https://developer.mozilla.org/en-US/docs/Glossary/Localhost) -- type: reference, time: 5m
- [Private vs Public IP Addresses](https://www.cloudflare.com/learning/network-layer/what-is-a-private-ip-address/) -- type: article, time: 10m
- [How the Internet Works - Stanford](https://web.stanford.edu/class/msande91si/www-spr04/readings/week1/InternetWhitepaper.htm) -- type: article, time: 30m
- [ngrok Documentation](https://ngrok.com/docs) -- type: tool, time: 15m
