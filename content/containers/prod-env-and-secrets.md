---
id: prod-env-and-secrets
title: Environment Config and Secrets in Production
zone: containers
edges:
  to:
    - id: healthchecks-and-monitoring
      question: Config is sorted. How do I know if the containers are actually healthy?
      detail: >-
        Everything seems to be running, but "seems to" isn't good enough in
        production. I want to know if a container is actually serving traffic
        correctly, not just that the process is alive.
difficulty: 2
tags:
  - docker
  - production
  - secrets
  - environment
  - configuration
category: practice
milestones:
  - Understand why you must never bake secrets into Docker images
  - Use env_file in Compose to inject config from a file not committed to git
  - Understand the difference between build-time ARG and runtime ENV
  - Know the options for secrets in production (env vars, mounted files, secret managers)
  - Use a mounted secrets file as a step up from plain env vars
  - Know what to do when a secret rotates — how to update without downtime
---

Config and secrets are different things that get treated the same way and shouldn't be. Config — log level, port, feature flags — is environment-specific but not sensitive. Secrets — database passwords, API keys, signing keys — are sensitive. If they're ever in an image layer, a commit, or a process listing, you have a problem. Neither belongs in the image. Both need to get into the container at runtime.

The good news is that the mechanics are simple. The discipline is harder: it requires understanding where values end up and who can read them at each stage of the build and deploy pipeline.

<!-- DEEP_DIVE -->

## Why secrets can't live in images

An image is an artifact pushed to a registry — accessible to anyone with pull access. Once a secret is written to a layer, it's permanently in that layer. Even if you delete it in a subsequent `RUN` step, the original layer still contains it and is still in the image.

You can extract any layer from an image:

```bash
docker save myapp:latest | tar x
# layers are now directories — find and unpack them to read their contents
```

If credentials are in those layers, anyone who can pull the image can read them. That includes developers who shouldn't have production access, CI systems with registry pull permissions, and anyone who gains access to the registry.

A secondary problem: when a secret rotates, you'd need to rebuild and push a new image just to change a credential. That's the wrong coupling — the image should represent a version of your code, not a version of your secrets.

**Rule: images contain code. Secrets are injected at runtime.**

## env_file in Compose

The straightforward way to inject environment variables from a file:

```yaml
services:
  app:
    image: ghcr.io/myorg/myapp:${IMAGE_TAG}
    env_file:
      - .env.prod
```

`.env.prod` lives on the server, not in the repository:

```
DATABASE_URL=postgres://appuser:secret@db:5432/myapp
API_KEY=sk-prod-abc123
APP_ENV=production
LOG_LEVEL=info
```

Keep a `.env.example` in the repo with placeholder values documenting what variables are needed:

```
DATABASE_URL=postgres://user:password@localhost:5432/myapp
API_KEY=your-api-key-here
APP_ENV=development
LOG_LEVEL=debug
```

`.env.prod` must be in `.gitignore`. If it ever lands in git history — even briefly, even in a commit you intend to revert — assume those credentials are compromised and rotate every one of them immediately. Git history is permanent and widely cached.

## ARG vs ENV

These two Dockerfile instructions look similar but behave very differently:

**`ARG`** — build-time only. Available during `docker build`, not in the running container, and not persisted in image layers in the same way.

```dockerfile
ARG BUILD_VERSION
RUN echo "Building version $BUILD_VERSION"
# BUILD_VERSION is not available at runtime
```

Use `ARG` for things that vary between builds but aren't sensitive: version strings, registry URLs, build timestamps.

**`ENV`** — persisted in the image. Available at runtime, visible in `docker inspect`, and readable from `docker history`.

```dockerfile
ENV APP_PORT=8000
ENV LOG_FORMAT=json
```

`ENV` is fine for non-sensitive runtime defaults that you want baked into the image. **Do not use `ENV` for secrets** — the value is in the image metadata and readable by anyone who can inspect it.

Override `ENV` defaults at runtime without rebuilding the image:

```bash
docker run -e APP_PORT=9000 myapp
# or in compose:
environment:
  - APP_PORT=9000
```

## The spectrum of secret management

Options in order of simplicity to robustness:

**1. Plain environment variables**

`docker run -e SECRET=value` or Compose `environment:` block. Simple, but secrets appear in `docker inspect`, in `/proc/<pid>/environ` on the host, and in any logging that dumps environment variables. Avoid for anything sensitive.

**2. env_file**

Keeps secrets out of the compose file and run commands. The secrets live on disk on the server. Anyone with SSH access can read them, but they're not in docker inspect output by default. This is the practical baseline for most single-server setups.

**3. Mounted secret files**

Mount a file containing the secret into the container:

```yaml
services:
  app:
    volumes:
      - /run/secrets/db_password:/run/secrets/db_password:ro
```

The application reads the secret from the file rather than from an environment variable:

```python
with open("/run/secrets/db_password") as f:
    db_password = f.read().strip()
```

The secret doesn't appear in `docker inspect` environment output or in process listings. The file can have tight permissions (`chmod 400`). This is a meaningful step up from env vars for sensitive credentials.

**4. External secret manager**

HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager. Secrets live in a dedicated, audited system. The application (or a sidecar) fetches secrets at startup using short-lived credentials. Secret rotation doesn't require touching individual servers. Access is logged and auditable.

This is the right level for large teams, compliance requirements (SOC 2, HIPAA), or any situation where you need to know who accessed what and when.

For most teams running on a single server, `env_file` or mounted secret files is sufficient. Don't add external secret management complexity until you have a clear reason.

## Secret rotation

When a secret changes, the container needs to pick up the new value. The approach depends on how the secret is delivered.

**env_file approach** — update the file, restart the container:

```bash
# edit .env.prod with the new value, then:
docker compose -f docker-compose.prod.yml restart app
```

**Mounted file approach** — update the file on the host; whether the app picks it up depends on whether it re-reads the file:

```bash
# update the file
echo "new-password" | sudo tee /run/secrets/db_password > /dev/null
sudo chmod 400 /run/secrets/db_password

# if the app doesn't watch for file changes, restart it
docker compose -f docker-compose.prod.yml restart app
```

**Zero-downtime rotation** requires either:
- Applications designed to re-read secrets on a signal (SIGHUP) — possible but requires code support
- A manual blue-green swap: start a new container with the new secret, shift traffic, stop the old one
- An external secret manager where the application fetches credentials dynamically and handles rotation in code

For most deployments, a brief restart during rotation is acceptable. If it isn't, design for it from the start — retrofitting zero-downtime secret rotation is significantly harder.

<!-- RESOURCES -->

- [Docker secrets documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Docker BuildKit --secret flag](https://docs.docker.com/build/building/secrets/)
- [The Twelve-Factor App: Config](https://12factor.net/config)
