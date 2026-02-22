---
id: "docker-networking"
title: "Docker Networking: How Do Containers Talk to Each Other?"
zone: "self-hosting"
edges:
  from:
    - id: "docker-volumes"
      question: "Data is safe. Now how do multiple containers talk to each other?"
  to:
    - id: "docker-compose"
      question: "I understand how it all fits together — now how do I manage it properly?"
      detail: "Right now I'm running everything with separate docker run commands. If the server restarts I have to retype all of it from memory. And adding a new service means more commands to keep track of."
difficulty: 1
tags: ["self-hosting", "docker", "networking", "containers"]
category: "concept"
milestones:
  - "Understand why containers on the default bridge network can't resolve each other by name"
  - "Create a user-defined Docker network"
  - "Run two containers on the same network and have one reach the other by name"
  - "Understand that Docker Compose handles this automatically"
---

When you run multiple containers — say, an app and its database — they need to communicate. The app needs to reach the database. But containers are isolated. They're not just processes on the same machine sharing a network; each has its own network namespace.

Docker networks are how containers find each other.

<!-- DEEP_DIVE -->

**The default bridge network: bad for multi-container setups**

By default, all containers join Docker's `bridge` network. Containers on this network can reach each other — but only by IP address. And container IPs change every time you stop and start a container.

So the app can reach the database at `172.17.0.3` — until the database container restarts and gets a new IP. Then the connection breaks. This is unusable for production workloads.

**User-defined networks: containers find each other by name**

Create your own network:

```bash
docker network create myapp
```

Start containers on it:

```bash
docker run -d --name postgres --network myapp postgres:16
docker run -d --name myapp --network myapp myapp:latest
```

Now the `myapp` container can reach the database at hostname `postgres` — the container name. Docker's internal DNS resolves `postgres` to the right IP automatically, even after restarts. No hardcoded IPs.

This is how real multi-container apps work. The app connects to the database using its name, not an IP.

**Network isolation as a security feature**

Containers on different networks can't reach each other at all. This is useful:

- Your database containers don't need to be reachable from your reverse proxy network. Put them on a separate internal network.
- Your reverse proxy lives on a public-facing network. Only services that should be exposed are on that network.

You can attach a container to multiple networks:

```bash
docker network connect another-network myapp
```

**You won't do this manually much**

In practice, Docker Compose handles all of this for you. Every Compose stack gets its own user-defined network automatically. Containers in the same `docker-compose.yml` can reach each other by service name without any network configuration. It just works.

Understanding why it works — and what to do when it doesn't — is why this matters.

```bash
# Useful commands
docker network ls                    # list all networks
docker network inspect myapp         # see which containers are on a network
docker network connect net container # attach a container to a network
```

<!-- RESOURCES -->
