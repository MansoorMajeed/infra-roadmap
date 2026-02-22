---
id: "docker-or-native"
title: "Docker or Install Natively?"
zone: "self-hosting"
edges:
  from:
    - id: "ssh-into-your-server"
      question: "I'm in. How do I actually install software on this thing?"
  to:
    - id: "docker-for-self-hosting"
      question: "Docker it is — how do I get started?"
      detail: "Docker is how almost every self-hosted service is distributed and run. One command to pull an image, one file to configure it."
    - id: "i-want-pain"
      question: "I want to install everything manually from source"
      detail: "This is the hard path. It's educational, but you'll spend more time fighting dependencies than running services."
difficulty: 1
tags: ["self-hosting", "docker", "linux", "package-management"]
category: "concept"
milestones:
  - "Understand why Docker is the standard for self-hosting"
  - "Make the call: Docker (recommended) or native install"
---

You have two options for running self-hosted services: install them natively on the OS (using `apt`, compiling from source, or following each project's install guide), or run them in Docker containers.

Use Docker. This guide only covers Docker.

<!-- DEEP_DIVE -->

**Why not native installs?**

The native path works — for the first service. You install PHP, configure Apache, set up a database, edit config files in `/etc`, write a systemd unit. An hour later, Nextcloud is running.

Then you want to install Vaultwarden. Different language (Rust), different database setup, different config system. Another hour. Then you want Immich — Python dependencies, Redis, microservices. Things start conflicting. You upgrade one package and something else breaks. You can't easily tell which files belong to which service. Rolling back an update means manual work.

This is why Docker was invented.

**What Docker gives you**

Every service runs in an isolated container. The container has its own filesystem, its own dependencies, its own runtime. Services can't conflict with each other. To upgrade Vaultwarden, you pull a new image and restart the container — 30 seconds. To roll back, pull the previous image. To remove a service completely, delete its container and its data directory.

The other thing Docker gives you: a standard format. Every self-hosted service that supports Docker publishes an image on Docker Hub with a ready-to-run configuration. You don't figure out how to install it — you just run the image.

**The self-hosting ecosystem has standardized on Docker**

Browse any self-hosted app's documentation — Immich, Vaultwarden, Jellyfin, Nextcloud, Home Assistant. The installation guide starts with Docker Compose. The community support forums assume Docker. The update instructions are `docker compose pull && docker compose up -d`.

If you install natively, you're going off the beaten path. You'll spend more time on infrastructure and less time actually using your services.

<!-- RESOURCES -->
