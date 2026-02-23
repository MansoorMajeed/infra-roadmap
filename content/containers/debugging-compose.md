---
id: debugging-compose
title: Debugging Docker Compose Issues
zone: containers
edges:
  to:
    - id: building-images-in-ci
      question: Compose is working reliably. How do I automate building images in CI?
      detail: >-
        My local stack runs cleanly and I can debug it when things go wrong.
        The next problem is that I'm still building images by hand — I need
        this automated.
difficulty: 2
tags:
  - docker
  - docker-compose
  - debugging
  - networking
  - operations
category: practice
milestones:
  - Stream logs from all services at once with docker compose logs -f
  - Understand why a service keeps restarting by reading its exit code
  - Use depends_on health conditions to fix service startup ordering issues
  - Inspect the Compose-managed network with docker network inspect
  - Override a single service's command to debug it interactively
  - Use docker compose config to validate and view the resolved compose file
---

A Compose stack that's misbehaving falls into a few categories: a service crashing on startup, services that can't reach each other, or a startup ordering problem where the app starts before the database is ready. Each has a specific place to look, and the tools to diagnose them are all built into Docker.

The debugging workflow is almost always the same: check logs first, then check exit codes to understand why something died, then inspect the network or config if the problem is connectivity or misconfiguration rather than a crash.

<!-- DEEP_DIVE -->

## Following logs across services

Logs are where you start. `docker compose logs -f` streams output from all services simultaneously, with each line prefixed by the service name:

```bash
# All services
docker compose logs -f

# One specific service
docker compose logs -f app

# Start from the last 100 lines then follow
docker compose logs --tail 100 -f db

# Logs without following (useful for a service that already exited)
docker compose logs app
```

What you're looking for: error messages, unexpected output, a service that starts up and immediately goes silent (often means it exited), or a service that prints a startup message but never gets to "ready."

One thing that trips people up: if a service keeps restarting, `docker compose logs` still shows logs from previous runs. You don't lose the error output from a crashed container just because it restarted.

## Services that keep restarting

`docker compose ps` shows each service's current state. A service in a restart loop shows something like `Restarting (1) 2 seconds ago`. The exit code tells you why it died.

```bash
# Get the container ID
docker compose ps

# Inspect the exit code
docker inspect <container_name_or_id> --format '{{.State.ExitCode}}'
```

Common exit codes and what they mean:

- **Exit 0**: clean exit — the process ran to completion and stopped. If it shouldn't have stopped, the app's main process exited intentionally (e.g., a migration script that was left as the CMD).
- **Exit 1**: application error — the process crashed. Check logs for the stack trace or error message.
- **Exit 137**: the container was killed with SIGKILL. Most commonly an OOM kill (out of memory). Check your memory limits or look for a memory leak.
- **Exit 143**: received SIGTERM — the container was asked to stop gracefully. Usually expected during `docker compose down`.

For OOM kills, you can confirm with:

```bash
docker inspect <container> --format '{{.State.OOMKilled}}'
```

## Startup ordering problems

`depends_on` is the most commonly misunderstood Compose feature. By default, it only waits for the dependent container to **start** — not for the service running inside it to be ready. A Postgres container starts in under a second, but Postgres itself takes several seconds to initialize its data directory and begin accepting connections.

The result: your app starts, tries to connect to the database, gets "connection refused," and crashes — even though `depends_on: db` is set.

Fix it with a healthcheck and a `condition`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s

  app:
    build: .
    depends_on:
      db:
        condition: service_healthy
```

With `condition: service_healthy`, Compose waits until the `db` healthcheck passes before starting `app`. `pg_isready` is a Postgres utility that returns success only when the database is accepting connections.

For other services, use the appropriate readiness check:

```yaml
# Redis
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s
  timeout: 3s
  retries: 5
```

Note that `condition: service_healthy` requires a healthcheck to be defined on the dependency. If there's no healthcheck, Compose will error rather than fall back to the default behavior.

## Network debugging

All services in a Compose project share a default network named `<project>_default` (where `<project>` is the directory name by default). Services are reachable by their service name as the hostname.

If a service can't reach another, start by getting a shell inside the failing container:

```bash
docker compose exec app sh
# or bash if the image has it
docker compose exec app bash
```

From inside, test connectivity:

```bash
# DNS resolution
ping db

# Port connectivity (requires curl or nc to be installed in the image)
curl -v http://db:5432
nc -zv db 5432
```

If `ping db` fails with a DNS error, the containers may be on different networks. Inspect the project network to see which containers are attached:

```bash
docker network inspect <project>_default
```

Look for the `Containers` section — it lists every container on that network. If a container is missing, check whether it belongs to a different Compose project or was started outside of Compose.

If you created additional named networks in your Compose file, make sure both services are listed under `networks` for the network they need to use.

## Overriding service command for debugging

Sometimes you need to poke around inside a container before the application starts — inspect environment variables, check whether a file is where you expect it, or run a command manually.

```bash
# Start the service with a shell instead of its normal CMD
docker compose run --entrypoint sh app

# Or for images that have bash
docker compose run --entrypoint bash app
```

This starts a fresh container using the same image, environment, and volumes as the `app` service, but drops you into a shell. The application itself doesn't start. From here you can:

```bash
# Check environment variables
env | grep DATABASE

# Verify a file exists
ls -la /app/config

# Try running the app manually to see its error output
python main.py
```

Use `docker compose run` (not `exec`) when the container isn't running or when you want a clean environment without the existing running process.

## Validating the compose file

Before spending time debugging what looks like a runtime issue, check whether the compose file itself is the problem:

```bash
docker compose config
```

This prints the fully resolved configuration: environment variable substitutions are applied, `env_file` entries are expanded, and any overrides from multiple Compose files are merged. If a variable you expected to be set shows as empty, it will be obvious here.

It also catches syntax errors and invalid keys before you try to run anything. Running `docker compose config` is a fast first check when you change the compose file and things stop working.

```bash
# Validate without printing the full config
docker compose config --quiet && echo "Config is valid"
```

<!-- RESOURCES -->

- [Docker Compose CLI reference](https://docs.docker.com/compose/reference/)
- [Docker Compose file reference: depends_on and healthcheck](https://docs.docker.com/compose/compose-file/05-services/#depends_on)
