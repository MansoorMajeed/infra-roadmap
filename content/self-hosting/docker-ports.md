---
id: "docker-ports"
title: "Docker Ports: How Do I Access My Container?"
zone: "self-hosting"
edges:
  from:
    - id: "docker-for-self-hosting"
      question: "Wait — I don't really understand how Docker works yet"
  to:
    - id: "docker-volumes"
      question: "I can access the service. But where is my data stored?"
      detail: "If the container is what's running the service, is my data inside it? What happens when I delete the container to update it — do I lose everything I've set up?"
difficulty: 1
tags: ["self-hosting", "docker", "networking", "ports"]
category: "concept"
milestones:
  - "Understand the host:container port syntax"
  - "Know what port a service listens on inside its container (check Docker Hub)"
  - "Access a running container from your browser using the host port"
  - "Understand why binding to 0.0.0.0 vs 127.0.0.1 matters"
---

A container has its own isolated network. When a service inside it listens on port 80, that's port 80 *inside the container* — not port 80 on your server. To reach the service from your browser, you have to tell Docker to forward a port from your server into the container.

That's what `-p 8080:80` does.

<!-- DEEP_DIVE -->

**The syntax: host:container**

`-p 8080:80` means:

> "Take port **8080** on my server (host), and connect it to port **80** inside the container."

So you open `http://your-server:8080` in a browser. Docker receives the connection on port 8080 and passes it to port 80 inside the container.

You can use any available port on the host side. Convention: many people use ports in the 8000–9000 range for homelab services. The container port is fixed — it's whatever the application listens on.

**How do you know what port the container uses?**

Check Docker Hub. Every official image has a documentation page that tells you what port the application listens on. For Vaultwarden: port 80. For Jellyfin: port 8096. For Immich: port 2283. You don't choose this — it's baked into the image.

The Dockerfile typically has an `EXPOSE` instruction listing the container's port. Docker Hub shows this on the image page.

**What happens if you don't publish a port?**

The container runs, the service starts, but nothing can reach it. The port is only accessible from inside the container itself. For a web service, this means the browser gets a connection refused error.

**0.0.0.0 vs 127.0.0.1**

By default, `-p 8080:80` binds to `0.0.0.0` — meaning the port is accessible from any network interface on your server, including the local network. Anyone on your WiFi can reach it.

If you want a service only reachable from the server itself (e.g., a database that only your other containers need), bind to localhost:

```bash
-p 127.0.0.1:5432:5432
```

This is a useful security practice for anything that shouldn't be accessed directly. For services you want to access from your laptop or phone on the home network, `0.0.0.0` (the default) is correct.

**Check running containers and their ports**

```bash
docker ps
```

The `PORTS` column shows all published ports — the host:container mapping for each running container.

<!-- RESOURCES -->
