---
id: deploying-to-a-server
title: Running Containers on a Real Server
zone: containers
edges:
  to:
    - id: prod-env-and-secrets
      question: The app is running. How do I handle config and secrets properly in production?
      detail: >-
        I've got the container running on the server but I've been hardcoding
        values and I know that's wrong. Database passwords, API keys — I need
        a proper way to inject these without putting them in the image or
        committing them to git.
difficulty: 2
tags:
  - docker
  - production
  - deployment
  - docker-compose
  - containers
category: practice
milestones:
  - SSH into a server and pull a versioned image from a registry
  - Run the app with docker compose up -d using a production compose file
  - Set restart policies (unless-stopped) so the app survives reboots
  - Verify the deployment with docker ps and docker logs
  - Understand the difference between a local docker-compose.yml and a production override file
  - Know when single-server Compose is enough and when it isn't
---

Getting a containerized application onto a real server is simpler than it sounds: pull the image, run it with Compose, and make sure it restarts if the process dies or the server reboots. The commands themselves are nearly identical to running Compose locally — the difference is discipline about what goes in the file.

The operational model diverges from local development in a few specific ways: no bind mounts to your source code, no dev database passwords, no exposed debug ports, and restart policies that actually mean something when the server reboots at 3am. Once those habits are in place, single-server Compose is a capable production setup for a wide range of services.

<!-- DEEP_DIVE -->

## Pulling an image on a server

Before you can run anything, the server needs the image. Authenticate once, then pull by a specific tag:

```bash
# authenticate to the registry — credentials stored in ~/.docker/config.json
echo $GITHUB_TOKEN | docker login ghcr.io -u <username> --password-stdin

# pull a specific versioned image
docker pull ghcr.io/myorg/myapp:a1b2c3d
```

The critical habit here is **never deploying `latest` in production**. `latest` is a moving target — you can't tell what code is running, you can't roll back to a specific version, and a broken push silently replaces your working deployment. Use a git SHA or a semantic version tag. Your CI pipeline should build and tag the image on every merge to main.

## Production Compose file

Your local `docker-compose.yml` is built for development: bind mounts to your source code, dev database credentials, ports exposed for debugging tools. None of that belongs on a production server.

Keep a separate `docker-compose.prod.yml` for production:

```yaml
services:
  app:
    image: ghcr.io/myorg/myapp:${IMAGE_TAG}
    restart: unless-stopped
    env_file:
      - .env.prod
    ports:
      - "8000:8000"
    depends_on:
      - db

  db:
    image: postgres:16
    restart: unless-stopped
    env_file:
      - .env.prod
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

Key differences from a dev file:
- `image:` instead of `build:` — the image was already built and pushed by CI
- `restart: unless-stopped` on every service
- `env_file:` pointing to a file that lives on the server, not in the repo
- Named volume for database data — not a bind mount to a host directory
- No source code bind mounts

Pass the image tag at deploy time without editing the file:

```bash
IMAGE_TAG=a1b2c3d docker compose -f docker-compose.prod.yml up -d
```

The `${IMAGE_TAG}` in the compose file picks up the environment variable automatically. This is the key to repeatable, scriptable deploys.

## Restart policies

Without a restart policy, a process crash or server reboot leaves your container stopped until someone manually runs it again.

| Policy | Behavior |
|---|---|
| `no` | Never restart (default) |
| `always` | Always restart, including after `docker stop` — inconvenient during maintenance |
| `on-failure` | Only on non-zero exit; accepts optional retry limit: `on-failure:3` |
| `unless-stopped` | Restart unless explicitly stopped; survives Docker daemon restarts and server reboots |

**`unless-stopped` is the right choice for production services.** It means your app comes back automatically after a crash or reboot, but `docker compose stop` actually stops it and keeps it stopped — which is what you want when deploying or doing maintenance.

`always` sounds safer but isn't: it ignores explicit stop commands, which makes controlled restarts and zero-downtime deploys harder to reason about.

## Compose overrides

Compose supports merging multiple files. The second file overrides values from the first:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

A common pattern: `docker-compose.yml` defines the service structure (image, ports, volumes), and `docker-compose.prod.yml` adds or overrides the production-specific values (restart policies, prod env file, resource limits). This keeps you from duplicating service definitions.

An alternative: maintain entirely separate files for dev and prod. This is simpler to reason about if your dev and prod environments differ significantly — no mental model needed for which file overrides which. The tradeoff is that changes to service structure have to be made in both files.

Either approach works. Pick the one that matches how different your environments actually are.

## Verifying after deploy

```bash
# are services running?
docker compose -f docker-compose.prod.yml ps

# tail logs from all services
docker compose -f docker-compose.prod.yml logs -f --tail 100

# is the app actually responding?
curl http://localhost:8000/health
```

"Up" in `docker ps` means the process is alive — the kernel sees the PID running. It does **not** mean the application has finished starting, can connect to its database, or is serving valid responses. A crashed-but-restarting app cycles through "Up" states continuously.

A healthcheck (covered in the next node) gives you an actual signal about whether the application is functional — and lets Compose and Kubernetes act on that signal automatically.

## The ceiling of single-server Compose

Single-server Compose is a legitimate production setup. It handles real traffic for teams shipping real products. But it has hard ceilings you'll eventually hit:

- **Availability**: the server is a single point of failure. It goes down, everything goes down — no redundancy, no automatic failover.
- **Scale**: you're bound to one machine's CPU and RAM. Scaling up means resizing the server and accepting downtime.
- **Zero-downtime deploys**: possible but manual — requires nginx reload tricks, Traefik configuration, or scripted blue-green swaps. Nothing orchestrates it for you.
- **Many services**: as the number of services grows, resource allocation, dependency ordering, and port management become manual coordination problems.

These aren't Compose's failures — they're exactly the problems that container orchestrators were designed to solve. When you hit them, that's the signal to look at Kubernetes or a managed container platform, not to find workarounds.

<!-- RESOURCES -->

- [Docker Compose restart policies reference](https://docs.docker.com/compose/compose-file/05-services/#restart)
- [docker compose up reference](https://docs.docker.com/reference/cli/docker/compose/up/)
