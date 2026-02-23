---
id: healthchecks-and-monitoring
title: Healthchecks and Monitoring Containers
zone: containers
edges:
  to:
    - id: why-kubernetes
      zone: kubernetes
      question: Single-server Docker is getting limiting. How do I run this at scale?
      detail: >-
        I've got one server working well but I need more resilience — if the
        server goes down, everything goes down. I also can't scale horizontally
        without a lot of manual work. Is there something better?
difficulty: 2
tags:
  - docker
  - monitoring
  - healthchecks
  - production
  - observability
category: practice
milestones:
  - Add a HEALTHCHECK instruction to a Dockerfile
  - Understand the three container health states (starting, healthy, unhealthy)
  - Use docker inspect to read a container's health status and history
  - Configure depends_on health conditions so services wait for dependencies to be ready
  - Use docker stats for basic resource monitoring
  - Know the limits of docker stats and when to reach for a proper monitoring stack
---

A container showing "Up" in `docker ps` means the process is alive. It doesn't mean the application is serving traffic, hasn't deadlocked, or can reach its database. Healthchecks let you define what "healthy" actually means for your specific application — and Docker, Compose, and Kubernetes all use that definition to make operational decisions automatically.

Without a healthcheck, you're flying blind. The runtime knows the process is running. It has no idea whether the process is doing anything useful.

<!-- DEEP_DIVE -->

## What a healthcheck does

A healthcheck is a command Docker runs periodically inside the running container. The semantics are simple: **exit 0 means healthy, exit 1 means unhealthy**. Docker tracks the results over time and transitions the container through three health states.

Those states are used by:
- Compose `depends_on` conditions — to hold dependent services until this one is ready
- Kubernetes readiness and liveness probes — to control traffic routing and restart decisions
- Docker itself — to trigger a restart when combined with an appropriate restart policy

Without a healthcheck, these systems can only see process state. With one, they can see application state.

## Adding a HEALTHCHECK in a Dockerfile

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

The parameters:

| Flag | Default | Meaning |
|---|---|---|
| `--interval` | 30s | How often to run the check |
| `--timeout` | 30s | How long before the check is considered failed |
| `--start-period` | 0s | Grace period after start — failures during this window don't count |
| `--retries` | 3 | Consecutive failures before marking unhealthy |

**`--start-period` is important.** Applications that take time to initialize — warming caches, running migrations, establishing connection pools — will fail health checks during startup. Without a start period, those failures count toward the retry limit and the container gets marked unhealthy before it ever finishes starting. Set it to slightly longer than your p95 startup time.

### What the health endpoint should check

Don't just check that the port is open. Check that the application is actually functional:

```python
@app.get("/health")
def health():
    # verify database connection is alive
    db.execute("SELECT 1")
    # verify any other critical dependency
    cache.ping()
    return {"status": "ok"}
```

A health endpoint that only returns 200 without checking dependencies will pass the check while the application fails every real request because the database is down. The check is only useful if it reflects actual application health.

## The three health states

- **starting** — the container has just started and is within the `--start-period` grace window. Failures during this period don't count toward the retry limit.
- **healthy** — the last N consecutive checks passed (where N is `--retries`).
- **unhealthy** — the last N consecutive checks failed. With `restart: unless-stopped`, Docker will restart the container automatically.

The transition from starting → healthy requires passing checks. The transition from healthy → unhealthy requires failing `--retries` consecutive checks, which provides protection against transient blips.

## Reading health status

```bash
# current health status (starting / healthy / unhealthy)
docker inspect <container> --format '{{.State.Health.Status}}'

# full health object with recent check results
docker inspect <container> --format '{{json .State.Health}}' | jq .
```

The full health object includes the output and exit code of each recent check. When a healthcheck is failing and you can't tell why, this is where you look:

```bash
docker inspect <container> --format '{{json .State.Health.Log}}' | jq '.[0]'
```

The `Output` field shows exactly what the check command printed before exiting — the actual error message from `curl`, `pg_isready`, or whatever command you're using. This is the fastest way to debug a container stuck in "unhealthy".

## Compose and health conditions

By default, `depends_on` only waits for the container to start — not for the service inside it to be ready. This causes flapping on startup: the app container starts, tries to connect to the database before Postgres has finished initializing, crashes, and restarts in a loop.

With a healthcheck defined, you can tell Compose to actually wait:

```yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  app:
    image: ghcr.io/myorg/myapp:${IMAGE_TAG}
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    env_file:
      - .env.prod
```

`condition: service_healthy` tells Compose to hold the `app` container until `db` passes its healthcheck. The app no longer starts before the database is ready.

Available conditions:
- `service_started` — default, container is running (does not check health)
- `service_healthy` — container has passed its healthcheck
- `service_completed_successfully` — for one-shot containers like migrations

## docker stats for resource monitoring

```bash
# live stats for all running containers
docker stats

# single container
docker stats <container-name>
```

The output:

```
CONTAINER ID   NAME    CPU %   MEM USAGE / LIMIT   MEM %   NET I/O       BLOCK I/O
a1b2c3d4e5f6   app     2.3%    128MiB / 512MiB     25%     1.2MB / 800kB 0B / 4MB
```

What to watch for:
- **Steady memory growth** over hours or days — likely a memory leak; the container will eventually get OOM killed
- **CPU consistently near 100%** — the container is saturated; check if it's doing something unexpected or needs a resource limit increase
- **Memory limit column showing total host RAM** — you haven't set a `mem_limit` in Compose. Set one before going to production, or a runaway process can take down the entire server

Set limits in your Compose file:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          memory: 256M
```

## The limits of docker stats

`docker stats` shows current snapshots only. It has no memory — "what was memory doing three hours ago?" is not a question it can answer. It provides no alerting, no dashboards, and no trend analysis.

For production monitoring with history and alerting, you need an external stack:

**Self-hosted:**
- **cAdvisor** — exports container resource metrics (CPU, memory, network, disk I/O) to Prometheus
- **Prometheus** — stores metrics with retention
- **Grafana** — dashboards and alerting on top of Prometheus

The stack is a few compose services and a standard configuration. cAdvisor runs as a privileged container with access to Docker's cgroups and emits per-container metrics on a `/metrics` endpoint.

**Managed:**
- AWS CloudWatch Container Insights, Google Cloud Monitoring, Datadog — all support Docker metric collection with minimal configuration

For a single-server Docker deployment, `docker stats` combined with healthchecks that trigger automatic restarts covers most operational needs. The gap is history and alerting — if you want to know about a problem before users report it, or diagnose what happened after the fact, you need a real monitoring stack.

<!-- RESOURCES -->

- [Docker HEALTHCHECK reference](https://docs.docker.com/reference/dockerfile/#healthcheck)
- [cAdvisor — Container Advisor](https://github.com/google/cadvisor)
- [Prometheus getting started](https://prometheus.io/docs/prometheus/latest/getting_started/)
