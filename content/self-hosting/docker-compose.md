---
id: "docker-compose"
title: "Docker Compose"
zone: "self-hosting"
edges:
  from:
    - id: "docker-for-self-hosting"
      question: "I know Docker — let's skip to managing services properly"
    - id: "docker-networking"
      question: "I understand how containers connect — now how do I manage all of this properly?"
  to:
    - id: "reverse-proxy"
      question: "Services are running but I'm tired of remembering port numbers"
      detail: "Once you have multiple services, accessing them by IP:port gets unwieldy. A reverse proxy fixes this."
difficulty: 1
tags: ["self-hosting", "docker", "docker-compose", "containers"]
category: "tool"
milestones:
  - "Write a docker-compose.yml for Vaultwarden"
  - "Start it with `docker compose up -d`"
  - "Stop and restart it without losing data"
  - "Add a second service to the same compose file"
  - "Understand named volumes vs bind mounts"
---

TODO: Write content for this node. Cover:
- What docker-compose.yml gives you: reproducible, version-controlled service definitions
- The anatomy of a compose file: services, image, ports, volumes, environment, restart policy
- Vaultwarden as the worked example
- Key commands: up -d, down, logs -f, pull (for updates), exec
- Where to store your compose files (recommend /opt/stacks/<service-name>/)
- restart: unless-stopped — why you want this

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
