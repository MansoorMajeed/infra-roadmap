---
id: building-images-in-ci
title: Building Docker Images in CI
zone: containers
edges:
  to:
    - id: container-registry
      question: I built an image in CI. Where does it go?
      detail: >-
        The build finishes and the image just disappears when the CI runner
        shuts down. I need somewhere to actually store it so my server can pull
        it later — but I'm not sure what that looks like.
difficulty: 2
tags:
  - docker
  - ci-cd
  - dockerfile
  - images
  - github-actions
  - containers
category: practice
milestones:
  - Build a Docker image in a GitHub Actions workflow
  - Tag the image with the git commit SHA
  - Use multi-stage builds to keep production images small
  - Cache Docker layers in CI to speed up builds
---

Building images manually on a laptop doesn't scale — the image depends on your local state, there's no audit trail, and you have to remember to rebuild before deploying. Building in CI means every image comes from a clean checkout of a known commit, is stored in a registry, and can be reproduced. The image tag becomes the deployment artifact.

The commit SHA is the link that makes the whole chain traceable: you can look at a running container, read its tag, and find the exact commit, the diff, the PR, and the engineer who merged it. That's the operational value of CI-built images beyond just "automation."

<!-- DEEP_DIVE -->

## Why build in CI

A locally-built image carries invisible risk. It includes whatever is in your working directory — uncommitted changes, local config files, a `node_modules` that differs from what `npm ci` would produce on a clean machine. You also have to remember to build before you deploy, and if you forget or build from the wrong branch, you've deployed something you can't reproduce.

CI builds solve this by construction: the runner starts from a clean git checkout, builds deterministically, tags the image with the commit SHA, and pushes to a registry. The SHA tag is immutable — it maps to exactly one commit. Anyone can look at a running container's image tag and trace it back to source.

## A basic GitHub Actions workflow

This workflow builds and pushes to GitHub Container Registry (GHCR) on every push to `main`. `GITHUB_TOKEN` is provided automatically — no manual secrets needed for GHCR.

```yaml
name: Build and push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

`github.sha` is the full 40-character commit SHA. It's immutable — it will never point to a different image once pushed. `github.repository` expands to `org/repo`, which is the correct path format for GHCR.

The `permissions` block is required. Without `packages: write`, the token won't have permission to push to GHCR even though it's the same GitHub token.

## Tagging strategy

Tags serve different audiences and purposes. A typical setup uses two tags per build:

**SHA tags** (`ghcr.io/myorg/myapp:a1b2c3d`) are immutable and traceable. Use these for deployments — they pin you to an exact version. If something goes wrong, you can roll back by pinning to a previous SHA.

**Branch tags** (`ghcr.io/myorg/myapp:main`) are mutable pointers to the latest build from that branch. Useful for development environments that should always run the latest version, but **never use these for production** — you lose traceability and safe rollback.

**Semantic version tags** (`ghcr.io/myorg/myapp:1.4.2`) make sense for libraries or images that external teams depend on. They provide a stable, human-readable contract.

**`latest`** should be avoided in production. It's mutable, gives no information about what version is actually running, and makes rollback ambiguous.

To push both SHA and branch tags in one build step:

```yaml
tags: |
  ghcr.io/${{ github.repository }}:${{ github.sha }}
  ghcr.io/${{ github.repository }}:main
```

## Layer caching in CI

CI runners are ephemeral — every run starts from a blank slate with no cached Docker layers. Without caching, every build reinstalls all dependencies from scratch, which can add several minutes to a build that would be fast locally.

The fix is registry-based layer caching: store the layer cache in the registry itself, pull it at the start of each build, and only rebuild layers that have changed.

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache
    cache-to: type=registry,ref=ghcr.io/${{ github.repository }}:buildcache,mode=max
```

`mode=max` caches all layers, including intermediate ones from multi-stage builds. The `buildcache` tag is a separate image in your registry that holds only layer data — it won't be confused with your application images.

With a well-structured Dockerfile (dependencies installed before application code is copied), a code-only change will hit the cache for the dependency install layer and only rebuild from the `COPY . .` line onward.

## Build secrets in CI

If your build needs credentials — a private npm registry token, a PyPI token, an SSH key for a private git dependency — don't pass them as build args. Build args are baked into the image and visible in `docker history`. Anyone with access to the image can read them.

BuildKit's secret mounting is the correct approach: the secret is available as a file during a specific build step and is **never written to any image layer**.

In the workflow, pass the secret using the `secrets` input:

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
    secrets: |
      NPM_TOKEN=${{ secrets.NPM_TOKEN }}
```

In the Dockerfile, mount the secret at the step that needs it:

```dockerfile
RUN --mount=type=secret,id=NPM_TOKEN \
    NPM_TOKEN=$(cat /run/secrets/NPM_TOKEN) npm install
```

The secret is exposed as a file at `/run/secrets/<id>` for the duration of that `RUN` instruction only. It is not present in the final image, not visible in the layer history, and not accessible to subsequent build steps unless explicitly mounted again.

<!-- RESOURCES -->

- [docker/build-push-action documentation](https://github.com/docker/build-push-action)
- [GitHub Container Registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker BuildKit secrets documentation](https://docs.docker.com/build/building/secrets/)
- [GitHub Actions: automatic token authentication](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication)
