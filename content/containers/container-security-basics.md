---
id: container-security-basics
title: Container Security Basics
zone: containers
edges:
  to:
    - id: docker-compose-dev
      question: My images are optimized and reasonably secure. How do I run multiple services together locally?
      detail: >-
        I've got my app containerized properly. Now I need Postgres and Redis
        running alongside it — I'm starting everything separately and it's
        getting messy.
difficulty: 2
tags:
  - docker
  - containers
  - security
  - dockerfile
category: practice
milestones:
  - Add a USER instruction to run the container process as a non-root user
  - Understand why running as root inside a container is a real risk even with namespace isolation
  - Never bake secrets or credentials into an image layer
  - Use read-only filesystems with --read-only where possible
  - Scan images for known CVEs with docker scout or trivy
  - Understand what --cap-drop and --cap-add do and why dropping capabilities matters
---

Most container security problems aren't sophisticated exploits — they're basic misconfigurations that make a bad situation worse if something else goes wrong. Running processes as root, baking API keys into image layers, shipping fat images full of outdated packages. None of these things are immediately exploitable on their own, but each one turns a minor vulnerability into a major incident.

The security model for containers is defense in depth. The namespace and cgroup isolation Docker provides is real, but it's not a hard boundary the way a VM is. A container escape vulnerability in the container runtime — and they have happened — means your process's privileges matter. A non-root process with dropped capabilities in a read-only container is a much harder target than a root process with full privileges.

<!-- DEEP_DIVE -->

## The root problem

By default, container processes run as root (UID 0). This is the same UID 0 as the host. The container namespace creates isolation at the process and filesystem level, but the user identity is shared.

This matters most in a container escape scenario. CVE-2019-5736 was a real vulnerability in `runc` (the container runtime Docker uses) that allowed a malicious container to overwrite the host's `runc` binary. An attacker who could run arbitrary code inside the container could escape and execute code on the host with root privileges — because the container process was already running as root.

With a non-root container process, the same escape gives the attacker a shell on the host as an unprivileged user. That's still bad, but the blast radius is dramatically smaller. They can't read `/etc/shadow`, can't install kernel modules, can't bind to privileged ports.

Running as non-root is the single highest-leverage security change you can make to a Dockerfile.

## Running as non-root

Add a `USER` instruction at the end of your Dockerfile, after creating a dedicated user:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

The `--chown` flag on `COPY` matters. If you copy files as root and then switch to `appuser`, the non-root user may not be able to read them. Own files as the user that needs to read them.

Many official images already provide a non-root user. The official `node` image has a `node` user, `nginx` has `nginx`. Check the image's documentation or Dockerfile before creating your own:

```dockerfile
FROM node:20-slim
# The 'node' user already exists — use it
USER node
```

## Secrets don't belong in images

Every layer in a Docker image is permanent and addressable. If you add a secret in one layer and try to delete it in the next, the original layer still contains it — it's visible to anyone who can pull the image and inspect the layer directly.

```dockerfile
# Wrong: secret is in the image history forever
COPY .npmrc /root/.npmrc
RUN npm install
RUN rm /root/.npmrc

# Also wrong: visible in docker inspect and docker history
ENV NPM_TOKEN=secret_token_here
RUN npm install
```

For runtime secrets, pass them at runtime, not build time:

```bash
docker run -e DATABASE_URL="postgres://user:pass@host/db" myapp
```

For build-time secrets — like a `.npmrc` with a private registry token — use Docker BuildKit's `--secret` flag. The secret is mounted as a file during that `RUN` instruction and is never written to any layer:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci

COPY . .
RUN npm run build
```

Build with:

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .
```

The `.npmrc` is available during `npm ci` and gone afterward — it never appears in any layer.

## Read-only filesystems

Most application containers don't need to write to their filesystem at runtime. If yours doesn't, make that explicit:

```bash
docker run --read-only myapp
```

If the app tries to write somewhere unexpected, it fails loudly with a permission error rather than silently. That's useful both as a security control and as a way to discover unintended write behavior.

Apps that need scratch space (temp files, caches) can get a writable tmpfs mount for specific directories:

```bash
docker run --read-only --tmpfs /tmp myapp
```

Or in a Compose file:

```yaml
services:
  app:
    image: myapp
    read_only: true
    tmpfs:
      - /tmp
```

## Linux capabilities

Linux capabilities break root's privileges into discrete units. Docker grants containers a default subset — enough for most apps, but more than most apps actually need.

```bash
# Drop everything, add back only what you need
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE myapp
```

Common capabilities and what they allow:

- **`NET_BIND_SERVICE`**: bind to ports below 1024. Most apps should use ports above 1024 instead and not need this at all.
- **`SYS_PTRACE`**: attach a debugger to a process. Never needed in production.
- **`SYS_ADMIN`**: a broad capability covering many privileged operations. Almost never needed.
- **`CHOWN`**, **`SETUID`**, **`SETGID`**: manipulate file ownership and user identity. Needed by some apps during startup, not at runtime.

Never use `--privileged` in production. It disables all capability restrictions, all seccomp profiles, and gives the container nearly full access to the host kernel. It exists for specific use cases (running Docker inside Docker, certain system tooling) and is frequently misused as a quick fix when something doesn't work.

## Image scanning

A lean, non-root image that was built six months ago may still have dozens of known CVEs in its base image packages. Scanning catches these.

```bash
# Docker's built-in scanner (requires Docker Desktop or Docker Hub login)
docker scout cves myapp:latest

# trivy — open source, no login required, widely used in CI
trivy image myapp:latest

# Fail the build if HIGH or CRITICAL vulnerabilities are found
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

In a CI pipeline, run `trivy` as part of the image build step. Set a severity threshold that fails the build — `HIGH` and `CRITICAL` is a reasonable starting point. Lower severity findings are often too noisy to gate on initially.

One important caveat: new CVEs are published against packages that haven't changed. An image that passed scanning when it was built may fail a week later. Running scans in CI on every build helps, but also consider periodic re-scans of images already deployed to production.

<!-- RESOURCES -->

- [Docker security best practices](https://docs.docker.com/develop/security-best-practices/)
- [trivy documentation](https://aquasecurity.github.io/trivy/)
- [Docker BuildKit secrets](https://docs.docker.com/build/building/secrets/)
- [Linux capabilities man page](https://man7.org/linux/man-pages/man7/capabilities.7.html)
