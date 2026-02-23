---
id: docker-first-container
title: Running Your First Container
zone: containers
edges:
  to:
    - id: writing-a-dockerfile
      question: I can run containers. Now how do I build one for my own app?
      detail: >-
        I've pulled and run existing images but all of those were someone else's
        app. I need to package my own code into a container — where do I start?
    - id: container-logs-and-exec
      question: Something's broken inside a container. How do I figure out what's going on?
      detail: >-
        The container is running but the app isn't behaving right. I don't have
        a terminal open inside it and I'm not sure how to look at what it's doing
        or what went wrong.
difficulty: 1
tags:
  - docker
  - containers
  - getting-started
category: practice
milestones:
  - Pull and run an existing image with docker run
  - Map a container port to your host with -p
  - Pass environment variables into a container with -e
  - Run a container in the background with -d and check it with docker ps
  - Stop and remove containers with docker stop and docker rm
  - Understand the difference between docker run and docker start
---

The fastest way to develop an intuition for containers is to run one before you touch a Dockerfile. There are thousands of production-quality images on Docker Hub — databases, web servers, language runtimes — and you can have any of them running locally in seconds. Getting comfortable with `docker run` and its flags first means you'll understand what a Dockerfile is actually producing when you get to building your own.

This node covers the commands you'll use constantly: running containers, mapping ports, injecting config, checking what's running, and cleaning up. These are the primitives everything else is built on.

<!-- DEEP_DIVE -->

## Your first docker run

```bash
docker run nginx
```

This pulls the official nginx image from Docker Hub if it isn't cached locally, then starts a container from it. The process runs in the **foreground** — you'll see nginx's access logs streaming to your terminal, and pressing Ctrl-C stops the container.

That's useful for experimenting, but most of the time you want the container running in the background. The `-d` flag (detached) does that:

```bash
docker run -d nginx
```

Docker prints a container ID and returns you to the prompt. To confirm it's running:

```bash
docker ps
```

This lists all running containers with their IDs, image names, status, and ports. To stop it:

```bash
docker stop <container-id>
```

You only need enough characters of the ID to make it unambiguous — usually 3-4 is enough.

## Port mapping

A container has its own network namespace — its ports are completely invisible to your host by default. If nginx inside the container listens on port 80, you can't reach it at `localhost:80` without explicitly mapping it.

The `-p` flag maps a host port to a container port:

```bash
docker run -d -p 8080:80 nginx
```

The format is `host:container`. After this, `localhost:8080` on your machine hits port 80 inside the container.

This also means you can run **multiple containers from the same image** simultaneously as long as they map to different host ports:

```bash
docker run -d -p 8080:80 nginx
docker run -d -p 8081:80 nginx
```

Both containers listen on port 80 internally. They're routed to different host ports, so there's no conflict.

## Environment variables

Most container images are configured via environment variables rather than config files. This is by design — it's how you run the same image in dev and production with different settings without modifying the image.

The `-e` flag injects a variable:

```bash
docker run -d -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=myapp postgres
```

Pass multiple variables with multiple `-e` flags. The image's entrypoint reads these at startup and configures the application accordingly.

This pattern extends to Compose files and Kubernetes — they all use environment variables as the primary mechanism for injecting config into containers. Understanding it now makes everything else click.

## Managing containers

**Listing containers:**

```bash
docker ps          # running containers only
docker ps -a       # all containers, including stopped ones
```

Stopped containers still exist on disk until you remove them. `docker ps -a` is how you find them.

**Stopping containers:**

```bash
docker stop <id>   # sends SIGTERM, waits for graceful shutdown (default: 10s), then SIGKILL
docker kill <id>   # sends SIGKILL immediately — no graceful shutdown
```

Prefer `docker stop` — it gives the process a chance to flush buffers and close connections cleanly. Use `docker kill` when something is unresponsive.

**Removing containers:**

```bash
docker rm <id>          # remove a stopped container
docker rm -f <id>       # force stop and remove a running container
```

Two shortcuts worth knowing:

```bash
docker run --rm nginx        # container is automatically removed when it stops
docker run --name myapp nginx  # give the container a name instead of a random one
```

`--rm` is useful for one-off tasks and experiments so you don't accumulate stopped containers. `--name` makes subsequent commands like `docker stop myapp` more readable.

## docker run vs docker start

These do different things and it's worth being clear on the distinction.

`docker run` **creates a new container** from an image every time. Each invocation produces a fresh container with a new writable layer and a new ID.

`docker start` **resumes an existing stopped container** — the one that already exists from a previous `docker run`. Its writable layer and state are preserved.

In practice, treat containers as **disposable**. If something needs updating, stop the old container, remove it, and run a new one from the updated image. Don't reach for `docker start` to resume a specific container's state — that's what volumes are for. The workflow is almost always: run, not start.

<!-- RESOURCES -->

- [docker run reference — Docker Docs](https://docs.docker.com/reference/cli/docker/container/run/)
- [docker ps reference — Docker Docs](https://docs.docker.com/reference/cli/docker/container/ls/)
