---
id: writing-a-dockerfile
title: Writing a Dockerfile
zone: containers
edges:
  to:
    - id: docker-compose-dev
      question: >-
        I can build an image. My app needs a database too — how do I run them
        together?
      detail: >-
        I've got my app containerized, but it needs Postgres running alongside
        it. Right now I'm starting them separately by hand every time. There has
        to be a way to declare the whole stack and spin everything up together.
    - id: image-optimization
      question: My image works but it's 1.2GB. How do I make it smaller?
      detail: >-
        It takes forever to push and pull. I'm not sure what's in there or why
        it's so big. And every time I change one line of code the whole thing
        rebuilds from scratch — there must be a smarter way to do this.
    - id: debugging-dockerfile-builds
      question: My docker build is failing and I have no idea why.
      detail: >-
        The error message points at a RUN command but I can't tell what actually
        went wrong inside it. And sometimes it's not a failure — the image builds
        fine but the app inside doesn't behave the way I expect.
difficulty: 2
tags:
  - docker
  - dockerfile
  - containers
  - build
category: practice
milestones:
  - Write a Dockerfile for your application
  - Build the image locally with docker build
  - Run the container with docker run and verify it works
  - Use a multi-stage build to keep the final image small
  - Understand which files to exclude with .dockerignore
---

A Dockerfile is a recipe for building a container image. It starts from a base image — an operating system snapshot, usually with a language runtime already installed — then adds your application's dependencies, copies in your code, and declares how the application starts. Every instruction creates a new layer on top of the previous one, and the final stack of layers is the image.

Writing a Dockerfile for a simple application is straightforward. Getting it right for production involves understanding a handful of non-obvious ideas: layer ordering for cache efficiency, the difference between CMD and ENTRYPOINT, and why copying files in the right order can mean the difference between a 5-second rebuild and a 3-minute one.

Multi-stage builds are worth learning early. They let you use a full build environment (compilers, dev dependencies, build tools) to produce your artifact, then copy just the artifact into a minimal final image. The result is an image that's smaller, has fewer attack surface dependencies, and is faster to push and pull.

<!-- DEEP_DIVE -->

## The anatomy of a Dockerfile

Here's a realistic Dockerfile for a Python web application:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

And for a Node.js application:

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Key instructions:

| Instruction | What it does |
|-------------|--------------|
| `FROM` | Sets the base image — everything starts here |
| `WORKDIR` | Sets the working directory for subsequent instructions; creates it if missing |
| `COPY` | Copies files from the build context into the image |
| `RUN` | Executes a command during the build; creates a new layer |
| `ENV` | Sets an environment variable that persists into the running container |
| `ARG` | Build-time variable; available during build only, not in the running container |
| `EXPOSE` | Documents which port the container listens on (informational only — doesn't publish the port) |
| `CMD` | Default command to run when the container starts; overridable at `docker run` time |
| `ENTRYPOINT` | Fixed executable; CMD becomes its arguments |

## FROM: choosing a base image

The base image is the biggest decision in a Dockerfile. It determines the OS userspace, available tools, and a large fraction of the final image size.

**Language-specific slim variants** are the right default for most applications:

```dockerfile
FROM python:3.11-slim
FROM node:20-slim
FROM golang:1.22-bookworm
```

The `-slim` variants are Debian-based with most optional packages stripped out. They're small enough for most purposes and don't have the compatibility issues of Alpine.

**Alpine images** (`python:3.11-alpine`, `node:20-alpine`) are tempting because they're tiny — often 5–10x smaller than slim variants. But Alpine uses musl libc instead of glibc. Most pure-Python or pure-JS code works fine, but C extensions (numpy, psycopg2, bcrypt) often fail to install or produce subtle runtime bugs. Unless you specifically need Alpine's size, slim variants are safer.

**Distroless images** (from `gcr.io/distroless/`) contain only the runtime and your application — no shell, no package manager, no utilities. They're very secure and very hard to debug. A good choice for final production images once everything is working; not a good choice when you're still figuring things out.

**Always pin to a specific version.** `FROM python:latest` will silently upgrade when you rebuild, breaking things unpredictably:

```dockerfile
# wrong
FROM python:latest

# right
FROM python:3.11-slim
# or even more specific:
FROM python:3.11.8-slim
```

## RUN: installing dependencies

Each `RUN` instruction creates a new layer. Keeping layers small and meaningful is good, but there's an important exception: **always combine apt-get update and apt-get install into a single RUN instruction**:

```dockerfile
# wrong — stale cache can serve an old package index
RUN apt-get update
RUN apt-get install -y curl

# right
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

If `apt-get update` is a separate layer, Docker will cache it. On a future build, Docker reuses that cached layer even if the package index is a week old — which can cause `apt-get install` to fail because the package version it's looking for is no longer in the cached index. Keeping them in one instruction ensures `update` always runs before `install`.

The `rm -rf /var/lib/apt/lists/*` at the end removes the package lists, which can add tens of megabytes to an image. Always clean up in the same `RUN` instruction — cleaning up in a later `RUN` doesn't remove the files from the earlier layer.

## COPY: getting your code in

The key to efficient builds is understanding how Docker's layer cache interacts with COPY. When you change a file, Docker invalidates the cache for the COPY instruction that includes it, and rebuilds everything after.

The pattern: **copy dependency manifests first, install dependencies, then copy source code.**

```dockerfile
# copy only the dependency list first
COPY requirements.txt .
# this layer only rebuilds when requirements.txt changes
RUN pip install --no-cache-dir -r requirements.txt

# now copy the rest of the code
# this layer rebuilds on every code change, but pip install doesn't
COPY . .
```

If you did `COPY . .` first, every single code change would invalidate the pip install layer and force a full reinstall of all packages. With the pattern above, pip install only reruns when `requirements.txt` actually changes.

For file ownership, use `--chown` to set the owner in the same instruction rather than a separate `RUN chown`:

```dockerfile
COPY --chown=appuser:appuser . .
```

## CMD vs ENTRYPOINT

Both CMD and ENTRYPOINT specify what runs when the container starts, but they behave differently:

- **CMD** is the default command. It can be completely overridden by passing a command to `docker run`: `docker run myapp python manage.py migrate` replaces the CMD entirely.
- **ENTRYPOINT** is the fixed executable. If you set an entrypoint, CMD becomes arguments passed to it. The entrypoint itself can only be overridden with `--entrypoint`.

A common pattern: ENTRYPOINT sets the executable, CMD sets the default arguments:

```dockerfile
ENTRYPOINT ["python", "-m", "uvicorn"]
CMD ["app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

For most applications, CMD alone is simpler and more flexible.

**Always use JSON array form** (also called exec form), not shell form:

```dockerfile
# shell form — don't use this
CMD python app.py

# JSON array form — use this
CMD ["python", "app.py"]
```

Shell form runs the command via `sh -c`, making the shell process PID 1 instead of your application. When Docker sends SIGTERM to stop the container, the shell may not forward the signal to the child process. Your app won't get a chance to shut down gracefully, and after the timeout Docker will SIGKILL it. JSON array form runs the executable directly as PID 1, so signals are delivered correctly.

## Building and running

```bash
# build with a tag
docker build -t myapp:latest .

# build with a specific version tag
docker build -t myapp:1.0.0 .

# run the container, mapping port 8000 on the host to 8000 in the container
docker run -p 8000:8000 myapp:latest

# run with environment variables
docker run -p 8000:8000 -e DATABASE_URL=postgres://... myapp:latest

# run in the background
docker run -d -p 8000:8000 --name myapp myapp:latest
```

The `.` at the end of `docker build` is the **build context** — the directory whose contents are available to COPY instructions. It's not necessarily the directory containing the Dockerfile; you can specify a different Dockerfile path with `-f`:

```bash
docker build -f docker/Dockerfile.prod -t myapp:latest .
```

Use a `.dockerignore` file to exclude files from the build context that don't need to be there — `node_modules`, `.git`, local `.env` files, build artifacts. Large build contexts slow down every build because the entire directory is uploaded to the Docker daemon before building starts.

<!-- RESOURCES -->

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker best practices for writing Dockerfiles](https://docs.docker.com/build/building/best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
