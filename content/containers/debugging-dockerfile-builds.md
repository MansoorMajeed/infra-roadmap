---
id: debugging-dockerfile-builds
title: Debugging Dockerfile Builds
zone: containers
edges:
  to:
    - id: docker-compose-dev
      question: Builds are working. How do I run my app alongside its dependencies locally?
      detail: >-
        I can build and debug images now. But I'm still starting Postgres and
        Redis separately by hand every time I work on the app — that's getting old.
difficulty: 2
tags:
  - docker
  - dockerfile
  - debugging
  - builds
category: practice
milestones:
  - Read docker build output and understand which step failed
  - Use docker build --no-cache to rule out stale cache as the cause
  - Inspect intermediate layers by running a shell at a failed build step
  - Understand what goes into the build context and why large contexts slow builds down
  - Use docker history to see what each layer in an image actually contains
  - Debug ENTRYPOINT/CMD mismatches by overriding them at run time
---

A failed or misbehaving build usually comes down to one of a few things: a RUN command that errors out, stale cache serving content that's no longer valid, a build context that's pulling in things it shouldn't, or a wrong ENTRYPOINT or CMD that makes the container exit as soon as it starts. Each of these has a specific diagnostic approach, and once you know the patterns they're quick to resolve.

The trickier case is when the build succeeds but the container doesn't behave correctly. That's usually an ENTRYPOINT or CMD problem — the image was built right but it starts the wrong thing, or signals don't propagate correctly. Getting comfortable with overriding the entrypoint at runtime is the main tool for that class of issue.

<!-- DEEP_DIVE -->

## Reading build output

Each line in `docker build` output corresponds to one instruction in the Dockerfile, executed in order. When a step fails, the error appears inline with that step's output — not at the end.

```
Step 5/9 : RUN pip install -r requirements.txt
 ---> Running in a3f91c2b88d4
Collecting flask
...
ERROR: Could not find a version that satisfies the requirement flakk==2.0 (from versions: ...)
```

The long hash after "Running in" is the ID of the intermediate container Docker created for that step. If you need to inspect the state right before the failure, that hash is useful (more on that below).

Common causes by error type:

- **"command not found"** — the base image doesn't have the tool you're trying to run; wrong base image, or you need to install it first
- **"no such file or directory" in a COPY** — the source path is wrong relative to the build context, or the file is excluded by `.dockerignore`
- **permission denied** — you're trying to write somewhere the current user can't, or a script doesn't have execute permission
- **network failure during package download** — transient; retry or pin to a specific package version

## Cache issues

Docker caches each layer. If the instruction and its inputs haven't changed since the last build, Docker reuses the cached result and skips the step. This is usually what you want, but it can produce stale results:

```bash
# bypass the cache entirely
docker build --no-cache -t myapp .
```

If a build was succeeding but producing a wrong result — an outdated package version, a missing file that was added recently — the cache is often the culprit. `--no-cache` forces a full rebuild from scratch.

Understanding **when cache invalidates** is also important for structuring Dockerfiles efficiently. Once any layer's instruction or its inputs change, Docker rebuilds that layer and every layer after it. This is why instruction order matters:

- If you change a `RUN apt-get install` near the top of a Dockerfile, everything below it rebuilds
- If you `COPY . .` early, every code change triggers a full rebuild of all subsequent layers
- The correct pattern (covered in the COPY section of writing-a-dockerfile) is to copy dependency manifests first, install dependencies, then copy source code

## Build context problems

When you run `docker build . `, the `.` is the **build context** — the directory Docker sends to the daemon before the build starts. The entire directory is uploaded, even files that are never referenced in the Dockerfile.

The first line of build output tells you how large it is:

```
Sending build context to Docker daemon  1.23GB
```

If that number is large, the build will be slow even before the first step runs. Common culprits:

- `node_modules/` — often hundreds of MB, never needed in the build context
- `.git/` — the full git history adds up
- Build artifacts, compiled binaries, or local `.env` files
- Large test fixtures or data files

Fix this with a `.dockerignore` file in the same directory as the Dockerfile:

```
.git
node_modules
*.log
.env
.env.*
dist
__pycache__
*.pyc
.DS_Store
```

`.dockerignore` uses the same syntax as `.gitignore`. Adding it to a project with a large context can cut build times dramatically — not because the build steps get faster, but because the upload step disappears.

## Inspecting intermediate layers

When a build fails partway through, Docker prints the ID of the last successfully built layer. You can start a container from that exact layer to inspect the filesystem state right before the failing step:

```bash
docker run --rm -it <layer-id> sh
```

From that shell, you can see exactly what files exist, what paths are available, what environment variables are set, and what the working directory looks like. This is the most direct way to debug a complex build failure — you're standing at the exact point in the build where things went wrong.

You can also use `docker history` to see what each layer in a finished image actually contains:

```bash
docker history myapp:latest
```

The output shows each layer, its size, and the command that created it. This is useful for understanding where image size is coming from, and for verifying that a layer-caching strategy is working the way you expect.

## ENTRYPOINT and CMD problems

The container builds successfully but exits immediately when you run it — often with exit code 0 or 1 and nothing useful in the logs. This is almost always an ENTRYPOINT or CMD problem.

First, check what the image declares:

```bash
docker inspect <image> --format '{{.Config.Entrypoint}} {{.Config.Cmd}}'
```

Then test it interactively by overriding the entrypoint:

```bash
docker run --rm -it --entrypoint sh <image>
```

From that shell, run the intended command manually and watch what happens. If the command errors out, you'll see the error. If it exits immediately, you can check file permissions and paths.

A few specific things to check:

**Shell form vs JSON array form.** There are two ways to write CMD and ENTRYPOINT:

```dockerfile
# shell form — runs via sh -c
CMD python app.py

# JSON array form — runs the executable directly
CMD ["python", "app.py"]
```

Shell form wraps the command in `sh -c`, which means the shell process is PID 1, not your application. When Docker sends SIGTERM to stop the container, the shell may or may not forward it to the child process — often it doesn't, and the container gets forcibly killed after the timeout. **Always use JSON array form** for CMD and ENTRYPOINT in production images.

**Entrypoint scripts.** If your ENTRYPOINT is a shell script, check two things: the file must have execute permission (`chmod +x`), and it must have a correct shebang line (`#!/bin/sh` or `#!/bin/bash`). A script without a shebang may work on some systems and fail silently on others.

<!-- RESOURCES -->

- [docker build reference](https://docs.docker.com/reference/cli/docker/buildx/build/)
- [docker history reference](https://docs.docker.com/reference/cli/docker/image/history/)
- [BuildKit documentation](https://docs.docker.com/build/buildkit/)
- [.dockerignore file reference](https://docs.docker.com/reference/dockerfile/#dockerignore-file)
