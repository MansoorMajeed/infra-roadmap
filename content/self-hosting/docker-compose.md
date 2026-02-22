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
      detail: "I have to remember which port maps to which service, and when I add a new one I have to pick a free port and hope nothing conflicts. Typing 192.168.1.33:8083 every time is not how I want to use this."
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

Docker Compose lets you define your entire service — image, ports, volumes, environment variables, restart policy — in a single YAML file. Instead of a long `docker run` command you have to remember, you have a file you can commit to git and reproduce anywhere.

Two commands run your entire stack. Two commands tear it down.

<!-- DEEP_DIVE -->

**The compose file**

Create a directory for your service and a `docker-compose.yml` inside it:

```bash
mkdir -p ~/apps/vaultwarden
nano ~/apps/vaultwarden/docker-compose.yml
```

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    volumes:
      - ./data:/data
    ports:
      - "8080:80"
    environment:
      - DOMAIN=https://passwords.yourdomain.com  # set this when you have a domain
    restart: unless-stopped
```

**Key fields:**

- `image`: the Docker image to run
- `container_name`: a fixed name so you can reference it in logs and commands
- `volumes`: `./data:/data` is a bind mount — the `data/` directory next to your compose file, mounted as `/data` in the container. Docker creates `data/` automatically.
- `ports`: `host:container` mapping, same as `-p` in `docker run`
- `environment`: environment variables passed into the container — service-specific config
- `restart: unless-stopped`: restart automatically after reboot or crash, but not if you manually stop it

**Starting and stopping**

```bash
cd ~/apps/vaultwarden

docker compose up -d        # start everything in the background
docker compose down         # stop and remove containers (data is preserved)
docker compose logs -f      # follow logs from all containers
docker compose ps           # show running containers in this stack
```

**Updating a service**

Pull the new image and restart:

```bash
docker compose pull         # pull latest images
docker compose up -d        # recreate containers with new images
```

That's the entire update process. Your data is in bind mounts — it's untouched by the update.

**A service with a database**

Many services need a database. Here's what a two-container compose file looks like:

```yaml
services:
  app:
    image: someapp:latest
    volumes:
      - ./data:/data
    ports:
      - "8080:80"
    environment:
      - DB_HOST=db
      - DB_NAME=appdb
      - DB_USER=appuser
      - DB_PASS=changeme
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: postgres:16
    volumes:
      - ./postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=appuser
      - POSTGRES_PASSWORD=changeme
    restart: unless-stopped
```

Notice `DB_HOST=db` — the app connects to the database using the service name `db`. Compose automatically creates a shared network for all services in the file, so service name DNS resolution just works.

`depends_on: db` tells Compose to start the database before the app.

**Where to store your stacks**

Use `~/apps/<service-name>/` for everything. Each service gets its own directory with its own `docker-compose.yml` and its own `data/` subdirectory. It lives in your home directory — no sudo, no root, just your files.

```
~/apps/
├── vaultwarden/
│   ├── docker-compose.yml
│   └── data/
├── immich/
│   ├── docker-compose.yml
│   └── data/
└── jellyfin/
    ├── docker-compose.yml
    ├── config/
    └── media -> /mnt/nas/media   # symlink to wherever media lives
```

<!-- RESOURCES -->

- [Docker Compose documentation](https://docs.docker.com/compose/) -- type: reference, time: ongoing
