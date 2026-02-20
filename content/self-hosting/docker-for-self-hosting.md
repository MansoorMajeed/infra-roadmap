---
id: "docker-for-self-hosting"
title: "Docker for Self-Hosting"
zone: "self-hosting"
edges:
  from:
    - id: "docker-or-native"
      question: "Docker it is — how do I get started?"
  to:
    - id: "docker-compose"
      question: "I ran a container — now how do I manage multiple services properly?"
      detail: "Running containers with `docker run` by hand gets tedious fast. Docker Compose lets you define everything in a file and manage it with two commands."
difficulty: 1
tags: ["self-hosting", "docker", "containers", "linux"]
category: "tool"
milestones:
  - "Install Docker on your server"
  - "Pull and run a container (e.g. `docker run hello-world`)"
  - "Run Vaultwarden with `docker run` and access it from your browser"
  - "Understand images, containers, volumes, and ports"
---

TODO: Write content for this node. Cover:
- Installing Docker on Debian (official Docker repo, not the apt package)
- Core concepts in 4 bullet points: image, container, volume, port mapping
- Run Vaultwarden as a single `docker run` command — show it working
- The problem: `docker run` with all those flags is annoying to re-run, hard to remember, not reproducible

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
