---
id: container-debugging
title: Debugging Containers That Crash or Misbehave
zone: containers
edges:
  to:
    - id: writing-a-dockerfile
      question: I can debug running containers. Now I want to build my own image.
      detail: >-
        I've got the debugging tools down. Time to stop using other people's
        images and package my own app.
difficulty: 2
tags:
  - docker
  - containers
  - debugging
  - operations
category: practice
milestones:
  - Understand common exit codes (0, 1, 137, 139) and what they mean
  - Debug a container that exits immediately by overriding the entrypoint
  - Use docker run --rm -it <image> sh to explore an image interactively
  - Debug networking issues between containers with docker network inspect
  - Understand why you can't exec into a stopped container and what to do instead
  - Use a temporary debug sidecar to inspect a broken container's filesystem
---

`docker logs` gets you far when something is failing noisily. But some failures leave almost nothing to look at: a container that exits before you can exec in, a crash with no error message, a network issue where two containers simply can't reach each other. These situations require a different set of techniques — not just reading output, but reshaping how the container starts so you can get inside and look around.

The core idea behind most container debugging is this: if you can't observe the failure directly, change what the container runs so you can. Override the entrypoint, attach a sidecar, or start a fresh shell from the same image. The container's isolation is the problem, but it's also the tool.

<!-- DEEP_DIVE -->

## Reading exit codes

When a container stops, Docker records the exit code. This is often the first and most useful signal:

```bash
docker inspect <container> --format '{{.State.ExitCode}}'
```

The common ones:

- **exit 0** — the process exited cleanly on its own (not always good — if a server exits with 0, something told it to stop)
- **exit 1** — general application error; check the logs for the actual message
- **exit 137** — the process received SIGKILL; most commonly an out-of-memory kill, but also happens from `docker kill` or a host-level OOM event
- **exit 139** — segfault (SIGSEGV); unusual in interpreted languages, more common with native code or bad memory access in C extensions
- **exit 143** — received SIGTERM; this is the normal signal from `docker stop`, so exit 143 usually means clean shutdown

**Exit 137 is the most commonly misread.** People assume it means "application crashed," but it usually means the kernel or Docker killed it due to memory pressure. Always check:

```bash
docker inspect <container> --format '{{.State.OOMKilled}}'
```

If that's `true`, the container hit its memory limit (or the host ran out of memory) and was killed. The fix is increasing the limit or fixing a memory leak — not debugging the application code.

## Debugging a container that exits immediately

The hardest case: the container starts and exits before you can exec into it. You can't attach to something that's already gone.

The solution is to **override the entrypoint** to get a shell instead of running the application:

```bash
docker run --rm -it --entrypoint sh <image>
# or, if bash is available
docker run --rm -it --entrypoint bash <image>
```

Now you have a shell inside the exact same filesystem environment the application would have run in. From here you can:

- Check that all expected files exist at the right paths
- Inspect environment variables with `env`
- Run the application command manually and watch what happens:
  ```bash
  # run whatever the original CMD was
  python app.py
  # or
  node server.js
  ```
- Check file permissions on the entrypoint script
- Verify the working directory is what the Dockerfile declared

This technique works even if you don't have the Dockerfile — you're exploring the image as-built.

## You can't exec into a stopped container

`docker exec` only works on **running** containers. If the container has exited, exec will refuse:

```
Error response from daemon: container is not running
```

Your options:

1. **Restart and exec quickly** — works if the crash takes a few seconds to manifest, not if it exits in milliseconds
2. **Start with an overridden entrypoint** — `docker run --rm -it --entrypoint sh <image>`, as above. If the container uses specific volumes, mount them the same way: `docker run --rm -it -v mydata:/data --entrypoint sh <image>`
3. **Commit the stopped container to an image** — `docker commit <stopped-container> debug-image`, then `docker run --rm -it --entrypoint sh debug-image`. This captures the filesystem state at the time of the crash, including any files written at runtime.

The commit approach is especially useful when you need to see exactly what was on disk when the crash happened — not just what the original image contained.

## Network debugging between containers

When containers can't reach each other, `docker network inspect` shows the full state of a network:

```bash
docker network inspect <network-name>
```

This shows every container attached to the network, their assigned IP addresses, and their DNS aliases. If a container you expect to find isn't listed, it's on a different network and DNS resolution between them won't work.

From inside a running container, you can test connectivity directly:

```bash
# by container name (Docker's built-in DNS)
ping other-container-name
curl http://other-container-name:8080/health

# by IP if DNS isn't resolving
curl http://172.18.0.3:8080/health
```

Common causes of network failures:
- **Different networks** — containers started without `--network` land on the default bridge, which has no automatic DNS. Containers on user-defined networks get DNS by name automatically.
- **Wrong port** — the application listens on a different port than the one being requested
- **Application not binding to 0.0.0.0** — if the app binds only to `127.0.0.1`, it's unreachable from other containers even on the same network

## Debug sidecars for minimal images

Distroless and scratch-based images contain no shell, no package manager, and often no standard utilities. You cannot exec into them with bash or sh — there's nothing to run.

The solution is a **debug sidecar**: a separate container that shares the target container's namespaces:

```bash
docker run --rm -it \
  --pid container:<target-container-name> \
  --network container:<target-container-name> \
  --volumes-from <target-container-name> \
  ubuntu bash
```

What each flag does:
- `--pid container:<target>` — shares the PID namespace; you can see the target's processes with `ps aux` and send signals to them
- `--network container:<target>` — shares the network namespace; `curl localhost:8080` hits the target's listening port, and `netstat` or `ss` shows the target's connections
- `--volumes-from <target>` — mounts all the same volumes; you can read and write the target's data files

This gives you a full Ubuntu environment with access to the target's runtime state, without modifying the target image at all. Use any debugging tool you need — `strace`, `tcpdump`, `lsof` — by installing it in the sidecar.

<!-- RESOURCES -->

- [Docker exit codes reference](https://docs.docker.com/reference/run/#exit-status)
- [docker network inspect reference](https://docs.docker.com/reference/cli/docker/network/inspect/)
- [docker commit reference](https://docs.docker.com/reference/cli/docker/container/commit/)
