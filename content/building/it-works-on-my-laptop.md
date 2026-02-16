---
id: "it-works-on-my-laptop"
title: "It Works on My Laptop"
zone: "building"
edges:
  from:
    - id: "dynamic-web-app"
      question: "My app works locally. How do I let other people use it?"
      detail: "You have a working application on your laptop — a Flask app, a database, the whole thing. But it only works on localhost. Nobody else can access it. The moment you try to share it, you run into a wall: networking, servers, domains, ports. Getting from 'works on my machine' to 'works for everyone' is a fundamental challenge."
    - id: "nosql-databases"
      question: "I understand my data layer options. How do I get this whole thing running for real?"
      detail: "You know about relational databases, NoSQL, caching, file storage — you can pick the right tool for the job. But all of this is still running on your laptop. Getting a database-backed application deployed means understanding not just the app, but networking, servers, and how all the pieces connect in a real environment."
    - id: "caching-and-redis"
      question: "My app is fast and data-aware. Time to get it off my laptop."
      detail: "Your application is now backed by a database, sped up with caching, and handling data efficiently. But it is still running locally. Deploying a cached, database-backed application means understanding how all these pieces — app server, database, cache — connect over a network and run on real machines."
    - id: "file-and-object-storage"
      question: "I can handle files and data. Now how do I deploy all of this?"
      detail: "Your application now handles structured data in a database and files in storage. Locally, the files just sit on your filesystem. But in production, where do they go? You cannot rely on a single server's disk. This is where cloud storage, networking, and deployment architecture all come together."
    - id: "apis-and-rest"
      question: "I have a clean API. How do I expose it to the world?"
      detail: "You have built a REST API that cleanly separates your backend logic from the frontend. Locally, you can curl your endpoints and everything works. But APIs are meant to be consumed by other systems — mobile apps, frontend SPAs, third-party integrations. Getting your API accessible on the internet, secured, and reliable is the next step."
    - id: "testing-basics"
      question: "My code is tested and I'm confident it works. Now how do I run it somewhere real?"
      detail: "You have tests that verify your code works. Locally, you run pytest and everything passes. But tests on your laptop do not guarantee the app works in production. Different environments, different databases, different configurations — deploying means making your tested code run reliably on someone else's machine."
    - id: "version-control-git"
      question: "I can manage my code properly now. How do I actually get it running for others?"
      detail: "You have your code in a Git repository, you can branch, merge, and collaborate. But the code still only runs on your laptop. Pushing to GitHub does not mean your app is deployed — it means your source code is backed up. Getting a running application in front of users is a different challenge entirely."
  to:
    - id: "local-network"
      question: "Why can't anyone else reach my app? What even is a network?"
      detail: "Your app runs on localhost — your machine talking to itself. But your laptop is connected to other devices right now. Your phone, your smart TV, your roommate's laptop — they are all on the same WiFi network. Understanding what a local network is and how devices on it communicate is the first step to getting your app off localhost."
difficulty: 1
tags: ["localhost", "networking", "deployment", "ports", "development-environment"]
category: "concept"
milestones:
  - "Understand why localhost is only accessible from your own machine"
  - "Try to access your app from another device on the same network"
  - "Identify what you would need to make your app publicly accessible"
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
