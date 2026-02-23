---
id: image-optimization
title: Optimizing Docker Images
zone: containers
edges:
  to:
    - id: container-security-basics
      question: My images are lean. What should I know about making them secure?
      detail: >-
        I've got the size down and builds are fast. But I'm realizing I don't
        really know if what's running inside my containers is safe — am I
        exposing things I shouldn't be?
difficulty: 2
tags:
  - docker
  - dockerfile
  - images
  - optimization
  - multi-stage
category: practice
milestones:
  - Use multi-stage builds to separate build dependencies from the final image
  - Understand how Docker layer caching works and why instruction order matters
  - Use .dockerignore to exclude files from the build context
  - Choose minimal base images (alpine, distroless, slim variants)
  - Combine RUN commands and clean up package manager caches in a single layer
  - Measure image size with docker image ls and inspect layers with docker history
---

A working Dockerfile gets your app running. An optimized one gets it running fast, in a small image, with a cache that actually helps. The gap between a naive Dockerfile and a well-structured one is often 10x in image size and 5x in build time — and neither improvement is complicated once you understand the mechanics.

The two tools that matter most are multi-stage builds and layer caching. Multi-stage builds let you use a fat image full of compilers and dev tools to produce your artifact, then throw all of that away and ship only what the runtime actually needs. Layer caching lets you skip rebuilding dependencies on every code change — but only if your Dockerfile is written in the right order. These two things together turn a 1.5GB image with a two-minute rebuild into a 50MB image that rebuilds in seconds.

<!-- DEEP_DIVE -->

## Why image size matters

Image size shows up in more places than you'd expect. In CI, every build pushes an image and every deployment pulls one — the bigger the image, the longer every step takes. On a new node joining your cluster, a 1.5GB image means 1.5GB of data over the wire before the first container starts. And in terms of security, every extra package in your image is a potential CVE. A Node app that ships its full `node_modules`, build tools, and a Debian base with all its utilities has an enormous attack surface compared to one that ships only the compiled output and a handful of runtime packages.

A common example: a default Node.js app image built with `node:20` and a naive `COPY . .` will include every devDependency, TypeScript, ts-node, testing libraries, and whatever else is in your `node_modules`. Ship that to production and you're pushing half a gigabyte of code that never runs.

## Multi-stage builds

Multi-stage builds let you use multiple `FROM` instructions in a single Dockerfile. Each stage starts with a fresh filesystem. The key insight is that you can `COPY --from=<stage>` to pull specific files from an earlier stage into a later one — and only those files end up in the final image.

A Node.js example:

```dockerfile
# Stage 1: build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

The `build` stage has TypeScript, ts-node, all devDependencies. None of that makes it into `runtime` — only the compiled `dist` directory and production `node_modules` do.

For Go, this is even more dramatic since the compiled binary has no runtime dependencies at all:

```dockerfile
FROM golang:1.22 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM gcr.io/distroless/static-debian12
COPY --from=build /app/server /server
ENTRYPOINT ["/server"]
```

The final image is `gcr.io/distroless/static-debian12` — no shell, no package manager, just a minimal set of C libraries. The only thing in it is your binary.

## Layer caching and instruction order

Every instruction in a Dockerfile creates a layer. Docker caches each layer and reuses it on the next build if two things are true: the instruction itself hasn't changed, and none of the layers before it have been invalidated. Once a layer is invalidated, every layer after it rebuilds from scratch.

This makes instruction order critical. The wrong order:

```dockerfile
# Rebuilds npm ci on every code change
COPY . .
RUN npm ci
```

Every time you change a single source file, `COPY . .` invalidates its layer, and `npm ci` runs again from scratch. With a large dependency tree, that's easily a minute of wasted time per build.

The right order:

```dockerfile
# npm ci is cached unless package.json or package-lock.json changes
COPY package*.json ./
RUN npm ci
COPY . .
```

Now `npm ci` only re-runs when your actual dependencies change. Day-to-day development only rebuilds the `COPY . .` layer and anything after it.

The general rule: put instructions that change rarely near the top, instructions that change on every commit near the bottom.

For `apt-get`, combine the install and cleanup in a single `RUN` instruction — if you split them across two instructions, the cached install layer retains the package manager cache even after you try to clean it:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
```

## .dockerignore

When you run `docker build .`, Docker sends the entire build context — everything in the directory — to the daemon before executing a single instruction. On a large project with a `node_modules` directory, this can mean hundreds of megabytes transferred before anything happens. Even files you never `COPY` into the image are still sent.

A `.dockerignore` file works like `.gitignore` and lives in the same directory as your Dockerfile:

```
.git
node_modules
.env
*.log
dist
coverage
.DS_Store
.pytest_cache
__pycache__
```

There are two benefits: builds start faster because the context is smaller, and `COPY . .` won't unnecessarily invalidate the cache when files in ignored directories change.

## Choosing base images

The base image you choose is the foundation of everything else in the image — its size, its packages, its vulnerabilities.

**`python:3.11`** — the full official image. Debian-based, includes everything. Fine for development, unnecessarily large for production. Typical size: 900MB+.

**`python:3.11-slim`** — a minimal Debian image with Python installed. Removes most of the standard Debian packages. Good default for production. Typical size: 130MB.

**`python:3.11-alpine`** — based on Alpine Linux with musl libc instead of glibc. Very small (around 50MB) but causes compatibility issues with Python packages that have C extensions (numpy, cryptography, psycopg2). If your packages compile without issues on Alpine, it's worth it. If they don't, you'll waste hours debugging.

**`gcr.io/distroless/python3`** — no shell, no package manager, no utilities. Maximum security posture, minimum attack surface. Hard to debug because you can't get a shell inside the container.

For most production services, **`-slim` variants are the right default**. They're small enough, broadly compatible, and debuggable when something goes wrong.

Always pin to a specific version tag. `FROM python:3.11-slim` will pull different images over time as the tag is updated. `FROM python:3.11.9-slim-bookworm` is reproducible.

## Measuring image size

```bash
# List images with sizes
docker image ls

# Show each layer, the instruction that created it, and its size
docker history myapp:latest

# Show uncompressed layer sizes in a more readable format
docker history --no-trunc myapp:latest
```

`docker history` is where you find the problem layers. If you see a large `RUN` layer, it usually means you're leaving a package manager cache in that layer. Fix it by cleaning up in the same `RUN` instruction.

For a more interactive exploration, `dive` is a third-party tool that lets you navigate layers and see exactly which files are in each one:

```bash
# Install dive (macOS)
brew install dive

# Run against an image
dive myapp:latest
```

`dive` shows you the file tree diff for each layer and flags wasted space — files added in one layer and deleted in another, which still take up space in the image.

<!-- RESOURCES -->

- [Docker multi-stage builds documentation](https://docs.docker.com/build/building/multi-stage/)
- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [dive — image layer explorer](https://github.com/wagoodman/dive)
- [distroless base images](https://github.com/GoogleContainerTools/distroless)
