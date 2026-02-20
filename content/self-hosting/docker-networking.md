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
      detail: "Docker Compose ties ports, volumes, and networks together in one file. Everything you just learned applies directly."
difficulty: 1
tags: ["self-hosting", "docker", "networking", "containers"]
category: "concept"
milestones:
  - "Understand why containers on the default bridge network can't resolve each other by name"
  - "Create a user-defined Docker network"
  - "Run two containers on the same network and have one reach the other by name"
  - "Understand that Docker Compose handles this automatically"
---

TODO: Write content for this node. Cover:
- The scenario: Vaultwarden needs a database. You run them as two containers. How do they find each other?
- The default bridge network: containers can reach each other by IP, but not by name. IPs change on restart. Bad.
- User-defined networks: `docker network create mynet`. Containers on the same user-defined network can reach each other by container name. DNS just works.
- Demonstrate: run a simple app + postgres on the same network, app connects to "postgres" hostname
- Isolation benefit: containers on different networks can't talk to each other — useful for security
- Spoiler: Docker Compose creates a user-defined network for each stack automatically, so you usually don't do this manually

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
