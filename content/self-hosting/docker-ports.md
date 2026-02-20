---
id: "docker-ports"
title: "Docker Ports: How Do I Access My Container?"
zone: "self-hosting"
edges:
  from:
    - id: "docker-for-self-hosting"
      question: "It's running — but what does -p 8080:80 actually mean?"
  to:
    - id: "docker-volumes"
      question: "I can access the service. But where is my data stored?"
      detail: "By default, anything written inside a container is gone the moment you delete it. Volumes are how you make data survive."
difficulty: 1
tags: ["self-hosting", "docker", "networking", "ports"]
category: "concept"
milestones:
  - "Understand the host:container port syntax"
  - "Know what port a service listens on inside its container (check Docker Hub)"
  - "Access a running container from your browser using the host port"
  - "Understand why binding to 0.0.0.0 vs 127.0.0.1 matters"
---

TODO: Write content for this node. Cover:
- The mental model: two separate worlds — the container has its own network namespace, its own ports
- `-p 8080:80` means: "map port 8080 on the host to port 80 inside the container"
- How to find what port a container listens on: Docker Hub page, the EXPOSE line in Dockerfile
- What happens if you don't publish a port: the service is running but unreachable from outside
- Binding to 127.0.0.1 vs 0.0.0.0: security consideration (only expose what needs to be reachable)
- `docker ps` to see running containers and their port mappings

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
