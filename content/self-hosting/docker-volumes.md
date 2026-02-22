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
      detail: "I tried using localhost in my app's database connection string but it couldn't connect. Both containers are on the same machine — why can't they see each other?"
difficulty: 1
tags: ["self-hosting", "docker", "volumes", "storage", "data"]
category: "concept"
milestones:
  - "Understand why containers are ephemeral by default"
  - "Run a container with a bind mount and verify data persists after restart"
  - "Know the difference between bind mounts and named volumes"
  - "Know where to put your data on the host (e.g. ~/apps/vaultwarden/)"
---

Containers are ephemeral. Every file written inside a container lives only as long as the container exists. Delete the container to update it, and everything written inside is gone.

This is by design — containers are supposed to be disposable. Your data shouldn't live inside them.

<!-- DEEP_DIVE -->

**The problem, made concrete**

Run Vaultwarden, create some passwords. Now update Vaultwarden (the standard way: delete the old container, start a new one with the new image). Without a volume, all your passwords are gone.

Volumes solve this by storing data *outside* the container, on your server's filesystem. The container reads and writes to that location — when you delete and recreate the container, the data is still there.

**Two kinds of volumes**

**1. Bind mounts** — you specify a directory on your host:

```bash
-v ~/apps/vaultwarden/data:/data
```

The directory `~/apps/vaultwarden/data` on your server is mounted as `/data` inside the container. The container writes to `/data`, the files appear on your server at the host path.

This is what we recommend for self-hosting. You can see exactly where your data is, back it up with `rsync` or any backup tool, and inspect it directly if needed.

**2. Named volumes** — Docker manages the location:

```bash
-v vaultwarden_data:/data
```

Docker creates and manages a volume under `/var/lib/docker/volumes/vaultwarden_data/`. The data is just as persistent, but harder to find and back up. Fine for databases where you don't need to inspect the files, but less transparent.

**The recommended convention**

Keep all your self-hosted data under `~/apps/`:

```
~/apps/
├── vaultwarden/
│   └── data/          ← Vaultwarden's data
├── immich/
│   └── data/          ← Immich's photos and database
└── jellyfin/
    ├── config/        ← Jellyfin's config
    └── media/         ← Your media files (or a symlink to wherever they live)
```

Every service has its own directory. When you back up `~/apps/`, you back up everything.

**Verify that volumes work**

```bash
# Start Vaultwarden with a bind mount
docker run -d \
  --name vaultwarden \
  -v ~/apps/vaultwarden/data:/data \
  -p 8080:80 \
  vaultwarden/server:latest

# Open the UI, create an account, add a password

# Now delete the container
docker rm -f vaultwarden

# Look — your data is still on the host
ls ~/apps/vaultwarden/data/

# Start a new container pointing to the same directory
docker run -d \
  --name vaultwarden \
  -v ~/apps/vaultwarden/data:/data \
  -p 8080:80 \
  vaultwarden/server:latest

# Open the UI — your account and passwords are still there
```

The container is gone and recreated. The data never left your server.

<!-- RESOURCES -->
