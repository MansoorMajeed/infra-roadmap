---
id: container-logs-and-exec
title: Logs, Exec, and Inspecting Containers
zone: containers
edges:
  to:
    - id: writing-a-dockerfile
      question: I've got enough to debug basics. Now I want to build my own image.
      detail: >-
        I can run containers and poke around inside them. Time to stop using
        other people's images and package my own app.
    - id: container-debugging
      question: Logs aren't enough — the container keeps crashing and I can't tell why.
      detail: >-
        I can see the logs but they don't explain what's happening. The container
        exits with code 137 or just disappears. I need to get inside it or figure
        out how to debug something I can't directly observe.
difficulty: 1
tags:
  - docker
  - containers
  - debugging
  - logs
  - operations
category: practice
milestones:
  - Stream container logs with docker logs -f
  - Filter logs with --tail and --since
  - Open a shell inside a running container with docker exec -it
  - Inspect container metadata and config with docker inspect
  - Check resource usage in real time with docker stats
  - Use docker top to see processes running inside a container
---

A container isn't a VM with a persistent terminal — it's a process (or a small group of processes) running in isolation. There's no SSH daemon waiting for you to log in. Docker provides a set of commands to observe and interact with a running container: reading its output, opening a shell inside it, inspecting its configuration, and watching its resource usage in real time.

These tools are your first line of investigation. Getting comfortable with them means you can tell the difference between a container that's working correctly, one that's struggling, and one that's about to fall over.

<!-- DEEP_DIVE -->

## docker logs

Containers write their output to stdout and stderr, and Docker captures that stream automatically. `docker logs` is how you read it.

```bash
# all logs since the container started
docker logs <container>

# follow in real time (like tail -f)
docker logs -f <container>

# last 50 lines only
docker logs --tail 50 <container>

# everything since 10 minutes ago
docker logs --since 10m <container>

# since a specific timestamp
docker logs --since "2024-01-15T10:00:00" <container>
```

The most important thing to understand: **Docker only captures what the process writes to stdout and stderr.** If your application writes logs to a file inside the container (e.g., `/var/log/app.log`), `docker logs` will show nothing useful. This is why the standard practice is to always log to stdout — it works automatically with Docker, Kubernetes, and every log aggregation system.

If you're dealing with an application that insists on writing to files, you can either configure it to use stdout, or use `docker exec` to open a shell and read the file directly.

## docker exec

`docker exec` runs a command inside an already-running container. The most common use is opening an interactive shell:

```bash
# if the image has bash
docker exec -it <container> bash

# for minimal images (alpine, slim variants) that only have sh
docker exec -it <container> sh
```

The `-i` flag keeps stdin open so you can type input. The `-t` flag allocates a pseudo-TTY so the terminal behaves correctly — you get line editing, colors, and proper cursor behavior. Almost always use both together.

You're not just getting a shell on a remote machine — you're inside the container's **filesystem**, **network namespace**, and **environment variables**. The hostname resolves as the container sees it, `/etc/hosts` is the container's version, and the env vars are whatever was set in the image or at `docker run` time.

For non-interactive use, you can run a single command and get the output:

```bash
# print all environment variables
docker exec <container> env

# check a specific file
docker exec <container> cat /etc/nginx/nginx.conf

# run a database query
docker exec <container> psql -U postgres -c "SELECT version();"
```

## docker inspect

`docker inspect` gives you the complete configuration and state of a container as JSON. It covers everything: image, network settings, mounted volumes, environment variables, resource limits, and current state.

```bash
docker inspect <container>
```

The raw output is verbose. Use `--format` with Go template syntax to extract specific fields:

```bash
# container's IP address on the default bridge network
docker inspect <container> --format '{{.NetworkSettings.IPAddress}}'

# all environment variables
docker inspect <container> --format '{{.Config.Env}}'

# exit code (useful for stopped containers)
docker inspect <container> --format '{{.State.ExitCode}}'

# whether the container was OOM-killed
docker inspect <container> --format '{{.State.OOMKilled}}'

# the image the container is running from
docker inspect <container> --format '{{.Config.Image}}'
```

`docker inspect` works on both **running and stopped containers** — which is critical for debugging crashes. The container may be gone from your terminal, but Docker still holds its metadata until you `docker rm` it.

## docker stats

`docker stats` shows a live table of resource usage across your running containers:

```bash
# all running containers
docker stats

# a specific container
docker stats <container>
```

The output updates every second and shows CPU percentage, memory usage vs limit, network I/O, and block I/O. The memory column is particularly useful: `256MiB / 512MiB` means the container is using 256MB of its 512MB limit.

Watch for **steady memory growth** — a container that starts at 50MB and climbs to 450MB over a few hours without ever coming back down is almost certainly leaking memory. `docker stats` is usually how you first notice this.

If you haven't set a memory limit with `docker run -m`, the limit column will show the total RAM on the host. That's not a container limit — it just means you haven't set one.

## docker top

`docker top` lists the processes running inside a container, as seen from the host:

```bash
docker top <container>
```

The output looks like `ps aux` — PIDs, CPU and memory percentages, start time, and the command. Because containers share the host kernel, these are real host PIDs (just namespaced), so they show up here as well as in a regular `ps` on the host.

This is useful for a few things: confirming your application actually started (as opposed to an init process waiting for it), spotting unexpected processes that shouldn't be there, and identifying zombie processes that have accumulated because a parent isn't reaping them.

<!-- RESOURCES -->

- [docker logs reference](https://docs.docker.com/reference/cli/docker/container/logs/)
- [docker exec reference](https://docs.docker.com/reference/cli/docker/container/exec/)
- [docker inspect reference](https://docs.docker.com/reference/cli/docker/inspect/)
- [docker stats reference](https://docs.docker.com/reference/cli/docker/container/stats/)
