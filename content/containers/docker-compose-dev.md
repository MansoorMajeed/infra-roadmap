---
id: docker-compose-dev
title: Docker Compose for Local Development
zone: containers
edges:
  to:
    - id: building-images-in-ci
      question: Local setup works. How do I build images automatically in CI?
      detail: >-
        I'm running docker build manually on my laptop every time I make a
        change. That's not sustainable — I need this to happen automatically
        when I push code, not something I have to remember to do.
    - id: container-networking
      question: My services talk to each other in Compose, but I don't understand how. What's actually happening?
      detail: >-
        I just wrote `db` in my app's connection string and it worked. But I
        have no idea why. What if I need to connect containers that aren't in
        the same Compose file? Or debug a networking issue between services?
    - id: debugging-compose
      question: Something's wrong with my Compose setup and I can't figure out what.
      detail: >-
        One service keeps restarting, another can't reach the database even though
        they're in the same Compose file. I'm not sure how to read the logs across
        multiple services or tell whether it's a config issue or a networking issue.
difficulty: 1
tags:
  - docker
  - docker-compose
  - local-dev
  - containers
category: practice
milestones:
  - Write a docker-compose.yml that runs your app and its dependencies
  - Start and stop the full stack with docker compose up/down
  - Use volumes to persist data across container restarts
  - Use environment variables to configure services per environment
---

Most applications aren't a single process. They need a database, maybe a cache, maybe a queue. Running each one separately with `docker run` commands you have to remember — and then tearing them down in the right order — gets tedious fast. Docker Compose lets you describe the entire local stack in one YAML file and manage it with a single command.

The mental model is straightforward: you define services, and each service is a container. Compose handles creating a shared network so services can reach each other by name, manages named volumes so database data survives restarts, and gives you a consistent set of commands to start, stop, and inspect everything at once.

<!-- DEEP_DIVE -->

## What Compose gives you

A `docker-compose.yml` file (or `compose.yaml` — both are valid) describes your full local environment: what images to use or build, which ports to expose, what volumes to mount, what environment variables to set, and which services need to start before others.

The core workflow:

```bash
docker compose up -d      # start everything in the background
docker compose down       # stop and remove containers and networks
```

All services in a Compose project are placed on a shared network automatically. A service named `db` is reachable from other containers at the hostname `db` — no manual networking configuration required.

## The compose file structure

Here's a realistic example: a web app, a Postgres database, and Redis.

```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

A few things to notice: `build: .` tells Compose to build the image from the Dockerfile in the current directory. The service name (`db`, `cache`) becomes the DNS hostname that other services use in connection strings. Named volumes (`postgres-data`, `redis-data`) are declared at the bottom and persist across `docker compose down` / `up` cycles.

## Services and builds

Each service either builds from source or pulls an existing image.

For your own application code, use `build`:

```yaml
services:
  app:
    build: .                          # Dockerfile in current directory
```

For more control over the build context or a different Dockerfile:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev      # Use a dev-specific Dockerfile
```

For external dependencies (databases, caches, queues), use `image`:

```yaml
services:
  db:
    image: postgres:16
```

The general pattern: `build` for code you own, `image` for everything else.

## Volumes for persistence

Without a volume, a container's filesystem disappears when the container is removed. That's fine for your application, but not for a database.

**Named volumes** are managed by Docker and persist across `down` / `up` cycles:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

**Bind mounts** map a directory on your host into the container. This is the standard pattern for live code reloading in development — changes to your local files are immediately visible inside the container:

```yaml
services:
  app:
    build: .
    volumes:
      - .:/app                        # current directory → /app in container
```

One important command to know: `docker compose down -v` removes both containers and named volumes. This is what you want when you need a clean slate — but it also deletes all your local database data. Use it intentionally.

## Environment variables

Services are configured through environment variables. There are two ways to set them in a Compose file:

Inline in the service definition:

```yaml
services:
  app:
    environment:
      APP_ENV: development
      LOG_LEVEL: debug
```

Or loaded from a file with `env_file`:

```yaml
services:
  app:
    env_file:
      - .env
```

The standard practice for team projects: commit a `.env.example` with placeholder values showing what variables are needed, and keep `.env` (with real values) in `.gitignore`. Anyone cloning the repo copies `.env.example` to `.env` and fills in their local values.

```bash
# .env.example (committed)
DATABASE_URL=postgres://postgres:changeme@db:5432/myapp
SECRET_KEY=change-me-in-production

# .env (gitignored — real local values)
DATABASE_URL=postgres://postgres:mypassword@db:5432/myapp
SECRET_KEY=dev-key-abc123
```

## Useful Compose commands

```bash
# Start all services in the background
docker compose up -d

# Stop and remove containers and networks (keeps volumes)
docker compose down

# Also remove named volumes
docker compose down -v

# Follow logs from all services
docker compose logs -f

# Follow logs from a specific service
docker compose logs -f app

# Open a shell in a running container
docker compose exec app bash

# Run a one-off command (e.g., a database migration)
docker compose run --rm app python manage.py migrate

# Show status of all services
docker compose ps

# Rebuild images without starting containers
docker compose build

# Pull latest versions of all images
docker compose pull
```

`docker compose run` starts a new container for a one-off command. It's the right tool for migrations, seed scripts, and anything you want to run inside the container environment without leaving a long-running process. The `--rm` flag removes the container after it exits.

<!-- RESOURCES -->

- [Docker Compose file reference](https://docs.docker.com/compose/compose-file/)
- [Docker Compose CLI reference](https://docs.docker.com/compose/reference/)
