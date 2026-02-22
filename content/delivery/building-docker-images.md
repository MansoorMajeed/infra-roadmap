---
id: "building-docker-images"
title: "Building Docker Images in CI"
zone: "delivery"
edges:
  from:
    - id: "build-and-test-pipeline"
      question: "Tests pass. How do I build a Docker image as part of my pipeline?"
      detail: "Instead of copying source code to a server and hoping the environment matches, you package the app into a Docker image. Build once, run anywhere — the same image runs in staging and production."
  to:
    - id: "container-registry"
      question: "I built an image. Where do I store it?"
      detail: "A built image lives on the CI runner — and disappears when the job ends. You need a container registry to store images, version them by commit, and let your servers pull exactly the version they need."
difficulty: 2
tags: ["docker", "ci-cd", "dockerfile", "images", "containers", "build"]
category: "practice"
milestones:
  - "Write a Dockerfile that builds your application"
  - "Build the Docker image in a GitHub Actions workflow"
  - "Tag the image with the git commit SHA"
  - "Understand the difference between build-time and run-time concerns in a Dockerfile"
---

Instead of copying source code to a server and hoping the runtime environment matches, you package the application into a Docker image. The image contains everything the app needs: the runtime, dependencies, config, and code. Build it once in CI, run that exact image everywhere.

Building in CI means every image is built consistently, tagged with the commit that produced it, and ready to deploy without touching a server directly.

<!-- DEEP_DIVE -->

## A Dockerfile for a Python app

```dockerfile
# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Runtime stage
FROM python:3.12-slim

WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8000
CMD ["gunicorn", "myapp.wsgi:application", "--bind", "0.0.0.0:8000"]
```

This is a multi-stage build. The first stage (`builder`) installs dependencies. The second stage copies only what's needed to run — not the build tools. The resulting image is smaller and has a smaller attack surface.

**Build-time vs run-time:** The builder stage can install compilers, build tools, and dev headers. The runtime stage needs none of that. Keep the final image lean.

## Building in GitHub Actions

Use `docker/build-push-action` — the standard action for building and pushing images:

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: false                      # build only, don't push yet
    tags: myapp:${{ github.sha }}
    cache-from: type=gha             # use GitHub Actions cache for layers
    cache-to: type=gha,mode=max
```

`github.sha` is the full commit hash. Every build gets a unique, traceable tag.

## Tagging strategy

Tags identify what's in an image. Get this wrong and deployments become guesswork.

**Commit SHA** (`myapp:a3f9c12`) — the canonical tag. Immutable. Every image is traceable to a specific commit. This is what you deploy.

**Branch name** (`myapp:main`) — mutable, always points to the latest build from that branch. Useful for staging environments that always track the latest.

**`latest`** — avoid it for anything that matters. It's mutable, gives no traceability, and creates ambiguity. "Which version is running?" becomes unanswerable.

Common pattern: tag with both commit SHA and branch name. Deploy by SHA, let the branch tag float:

```yaml
tags: |
  ghcr.io/yourorg/myapp:${{ github.sha }}
  ghcr.io/yourorg/myapp:main
```

## Layer caching in CI

Docker builds are slow when every layer rebuilds from scratch. `docker/build-push-action` supports GitHub Actions cache (`type=gha`) to persist layer cache between runs. Dependencies installed in an early layer (that rarely changes) get cached and restored in seconds on subsequent builds.

Put slow, rarely-changing steps early in your Dockerfile (e.g. `pip install`) and fast, frequently-changing steps late (e.g. `COPY . .`). Docker only rebuilds layers after the first changed one.

<!-- RESOURCES -->

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/) -- type: reference, time: 10min
- [docker/build-push-action](https://github.com/docker/build-push-action) -- type: reference, time: 10min
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) -- type: reference, time: 15min
