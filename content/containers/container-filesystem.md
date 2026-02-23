---
id: container-filesystem
title: Image Layers and the Union Filesystem
zone: containers
edges:
  to:
    - id: docker-first-container
      question: I get how Docker works internally. Let me actually start using it.
      detail: >-
        I understand namespaces, cgroups, and how image layers are stored. Now
        I want to put that into practice — pull an image and run my first container.
difficulty: 2
tags:
  - containers
  - linux
  - overlayfs
  - internals
  - images
category: concept
milestones:
  - Understand what a union filesystem is and why Docker uses one
  - Know how image layers are stacked (read-only layers + writable layer on top)
  - Understand copy-on-write and what it means for container filesystem changes
  - Know where Docker stores layers on disk (/var/lib/docker)
  - Understand why layer sharing makes pulling images efficient
---

A container image isn't a single file or a disk snapshot. It's a stack of **layers**, each containing only the filesystem changes from the step before it. A **union filesystem** (Docker uses OverlayFS on most Linux hosts) merges these read-only layers into a single coherent filesystem that the container sees as its root. On top of that stack sits a thin writable layer, unique to each running container, where all writes go.

This design is why `docker pull` shows "Already exists" for layers your system has already seen, why builds that change one line don't re-download the world, and why ten containers running the same image don't consume ten times the disk. The layers are stored once and referenced by every container that needs them.

<!-- DEEP_DIVE -->

## The problem union filesystems solve

Without layer sharing, each image would be a complete, standalone copy of every file it contains. Two images both based on `ubuntu:22.04` would each store a separate full copy of the Ubuntu filesystem — roughly 80 MB each, duplicated on disk. At scale this becomes significant: a host pulling hundreds of images accumulates enormous redundancy.

**OverlayFS** solves this by stacking multiple directory trees as a single unified view. Each layer is a directory on the host. OverlayFS merges them top-to-bottom: files in higher layers shadow files with the same path in lower layers. The result looks like one filesystem but the data is stored separately per layer.

Layers are identified by a content hash. If two images share a base layer — even if they have completely different names and purposes — they reference the same content-addressed layer on disk. Docker stores it once.

## How image layers work

Each Dockerfile instruction that modifies the filesystem produces a new layer containing only the diff from the previous state. Instructions that don't touch the filesystem (like `ENV` or `EXPOSE`) don't produce a filesystem layer.

```dockerfile
FROM ubuntu:22.04                          # Layer 1: base Ubuntu filesystem
RUN apt-get install -y python3             # Layer 2: python3 and its dependencies added
COPY . /app                                # Layer 3: your application code
RUN pip install -r /app/requirements.txt  # Layer 4: Python packages installed
```

Layer 1 is the full Ubuntu base. Layer 2 contains only the files that `apt-get` added or modified — nothing else. Layer 3 contains only your application files. Layer 4 contains only the installed packages.

All four layers are read-only once built. They're immutable — a layer's content never changes after creation, which is how Docker can safely identify and deduplicate them by hash.

## The writable container layer

When Docker starts a container, it assembles the image layers into a merged view using OverlayFS and adds one additional **writable layer** on top. This writable layer is where all container filesystem writes go — log files written to disk, config files modified at runtime, anything created or changed during the container's lifetime.

**Copy-on-write** is the mechanism that makes this work for writes to existing files. If a container modifies a file that exists in one of the read-only image layers, OverlayFS first copies that file up into the writable layer, then applies the modification there. The original in the read-only layer is untouched. From the container's perspective, it sees the modified version in its unified filesystem view.

Consequences:

- When a container is deleted, its writable layer is discarded. The image layers are untouched.
- Ten containers from the same image share all the read-only image layers but each has its own independent writable layer.
- Writes that modify large files from the base layers are expensive the first time (the full file is copied up before the modification), but subsequent writes to that file are cheap.
- Data you need to persist beyond a container's lifetime must go into a **volume** or a **bind mount**, which bypass the writable layer entirely.

## Where layers live on disk

Docker stores layer data under `/var/lib/docker/overlay2/` on systems using OverlayFS (the default on most modern Linux distributions). Each subdirectory corresponds to a layer. You'll find `diff/` (the layer's filesystem content), `link` (a short identifier), and `lower` (a reference to the parent layers).

```bash
docker pull ubuntu:22.04
ls /var/lib/docker/overlay2/
```

You can inspect the layers for a specific image:

```bash
docker image inspect ubuntu:22.04 --format '{{json .GraphDriver}}'
```

When you pull a second image based on the same Ubuntu base, Docker checks whether each layer's hash already exists locally. The layers that match print "Already exists" and are not re-downloaded. Only new layers transfer.

## What this means for builds

Layer caching is the most practical consequence of this architecture. Docker checks each build step: if the instruction is identical **and** its inputs are unchanged (for `COPY`, the files being copied), it reuses the cached layer and skips re-executing the instruction. The moment any step's inputs change, that layer is **invalidated** — and so are all subsequent layers, because they were built on top of it.

This has a direct implication for how you order Dockerfile instructions:

```dockerfile
# Good: dependencies installed before code is copied
COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt
COPY . /app                        # changing app code only invalidates from here

# Bad: copying all code first
COPY . /app
RUN pip install -r /app/requirements.txt  # reinstalls on every code change
```

Put instructions that change infrequently (system package installs, dependency installations) near the top. Put instructions whose inputs change frequently (copying your application code) near the bottom. This maximizes cache hits and keeps builds fast.

Inspect the layers of any image to see what each instruction produced and how large each layer is:

```bash
docker history <image>
```

This prints each layer, the command that created it, and its size. Large unexpected layers usually mean a `RUN` instruction left behind build artifacts or temporary files that should have been cleaned up in the same layer.

<!-- RESOURCES -->

- [Docker storage drivers — Docker Docs](https://docs.docker.com/storage/storagedriver/)
- [Use the OverlayFS storage driver — Docker Docs](https://docs.docker.com/storage/storagedriver/overlayfs-driver/)
- [OverlayFS — kernel.org documentation](https://www.kernel.org/doc/html/latest/filesystems/overlayfs.html)
