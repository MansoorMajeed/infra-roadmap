---
id: "docker-volumes"
title: "Docker Volumes: Where Does My Data Live?"
zone: "self-hosting"
edges:
  from:
    - id: "docker-ports"
      question: "I can access the service. But where is my data stored?"
  to:
    - id: "docker-networking"
      question: "Data is safe. Now how do multiple containers talk to each other?"
      detail: "A database and an app running in separate containers need to find each other. Docker networking is how."
difficulty: 1
tags: ["self-hosting", "docker", "volumes", "storage", "data"]
category: "concept"
milestones:
  - "Understand why containers are ephemeral by default"
  - "Run a container with a bind mount and verify data persists after restart"
  - "Know the difference between bind mounts and named volumes"
  - "Know where to put your data on the host (e.g. /opt/stacks/vaultwarden/)"
---

TODO: Write content for this node. Cover:
- The core problem: containers are ephemeral. Delete the container, lose everything written inside it.
- Two solutions:
  1. Bind mount: `-v /host/path:/container/path` — a directory on your host mapped into the container. You control exactly where it is, easy to back up, easy to inspect.
  2. Named volume: `-v mydata:/container/path` — Docker manages it under /var/lib/docker/volumes/. Harder to find, but works fine.
- For self-hosting, recommend bind mounts: transparent, easy to backup with rsync or borgbackup
- Where to put it: suggest /opt/stacks/<service>/ as a convention
- Demonstrate: run Vaultwarden, write some data, delete the container, re-run with same -v flag, data is still there

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
