---
id: container-registry
title: Container Registries
zone: containers
edges:
  to:
    - id: deploying-to-a-server
      question: >-
        My image is stored and versioned. How do I get it running on a real
        server?
      detail: >-
        I've pushed my image to a registry but I'm not sure how my server
        actually gets it and keeps it running. Do I ssh in and run docker pull
        every time? And what happens if the container crashes?
difficulty: 1
tags:
  - docker
  - container-registry
  - ghcr
  - ecr
  - images
  - containers
category: concept
milestones:
  - Push a Docker image to GitHub Container Registry (GHCR)
  - Pull a specific image version by tag on your server
  - Understand what image tags are for and why 'latest' is dangerous
  - Set up registry authentication in your CI pipeline
---

A container registry is where images live between being built and being run. It's the distribution layer — CI pushes to it, servers pull from it, and the tag on the image is how you know exactly which version you're running. Without a registry, an image exists only on the machine that built it, and there's no way to get it anywhere else without exporting and copying files manually.

The registry also enforces immutability through content-addressable storage. Every image has a digest — a SHA256 hash of its contents — that never changes. Tags are human-readable pointers to digests, and understanding the difference between the two is what separates a working deployment strategy from one that will eventually surprise you.

<!-- DEEP_DIVE -->

## What a registry is

A registry is an HTTP server implementing the [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec). The spec defines how clients push and pull image layers, manifests, and tags. Because it's a standard, any OCI-compliant tool works against any compliant registry.

The main options:

- **Docker Hub** — the default. `docker pull nginx` implicitly pulls from `registry-1.docker.io`. Rate-limited for unauthenticated pulls.
- **GHCR** (GitHub Container Registry) — good default for GitHub projects. Auth uses GitHub credentials and tokens. Free for public images, included in GitHub plans for private.
- **ECR** (AWS Elastic Container Registry) — natural choice when deploying to AWS. Auth integrates with IAM.
- **Artifact Registry** (GCP) — GCP equivalent. Replaces the older Google Container Registry.
- **ACR** (Azure Container Registry) — Azure equivalent.

GHCR is usually the right choice for projects already on GitHub. Authentication uses the same `GITHUB_TOKEN` that CI already has, so there's no extra credential management.

## Pushing to GHCR

The workflow is: authenticate, tag your local image with the full registry path, push.

```bash
# authenticate — pipe the token to avoid it appearing in shell history
echo $GITHUB_TOKEN | docker login ghcr.io -u <username> --password-stdin

# tag your local image with the full registry path
docker tag myapp:latest ghcr.io/<org>/<repo>:latest

# push
docker push ghcr.io/<org>/<repo>:latest

# on any other machine with credentials, pull it
docker pull ghcr.io/<org>/<repo>:latest
```

The image name must match the registry path exactly. `ghcr.io/<org>/<repo>` is the standard format — `org` is your GitHub username or organization, `repo` is the repository name.

By default, newly pushed packages on GHCR are private. You can change visibility in the package settings on GitHub, or link the package to a repository.

## Image tags

A tag is a **mutable pointer** — it's a name that points to an image manifest, and that name can be repointed to a different manifest at any time. `nginx:1.25.3` is relatively stable because that version was released once, but in principle anyone with push access could retag it.

An image **digest** is immutable. It's a SHA256 hash of the image manifest, and it identifies the exact bytes of that image forever. If you pull the same digest six months from now, you get exactly the same image.

```bash
# see the digest of a local image
docker inspect --format='{{index .RepoDigests 0}}' nginx:1.25.3

# pull by digest — will always be the same image
docker pull nginx@sha256:a484819eb60efa9577...
```

For most practical purposes, a git SHA tag (e.g., `myapp:a1b2c3d`) gives you the traceability you need without managing digests manually. It's semantically immutable — you'd never retag a git SHA — and it ties the image directly to its source commit.

## Why `latest` is dangerous in production

`latest` is not special. It's just a tag, and like any tag it's mutable. The problems it causes in production are consistent:

**Silent updates on restart.** If your deployment spec says `image: myapp:latest` and you push a new `latest` to the registry, the next time the container restarts — whether from a crash, a deploy, or a node reboot — it will pull the new version. You didn't explicitly deploy anything; the version changed beneath you.

**No traceability.** You can't look at a running container with tag `latest` and know what version it's running. You can't correlate it to a commit, a PR, or a point in time.

**Rollback is unclear.** To roll back, you need to know what the previous version was and retag `latest` to point at it. If you had been using SHA tags, rollback is just changing the tag in your deployment spec.

The rule is simple: in production, always deploy with a specific tag. Git SHA tags are the most traceable option.

## Registry authentication in CI

For GitHub Actions pushing to GHCR, the `GITHUB_TOKEN` that Actions provides automatically has sufficient permissions — no manual secret setup needed:

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

The `permissions` block in the workflow job must include `packages: write` for the token to be allowed to push:

```yaml
jobs:
  build:
    permissions:
      contents: read
      packages: write
```

For other registries, the pattern is the same — authenticate, then push. AWS ECR requires generating a temporary token via the AWS CLI; there are Actions for this. Docker Hub uses repository secrets to store the username and access token.

## Pulling on a server

On the server, authenticate once and Docker will reuse the stored credentials for all subsequent pulls:

```bash
# authenticate
echo $TOKEN | docker login ghcr.io -u <username> --password-stdin

# pull a specific version by tag
docker pull ghcr.io/<org>/<repo>:<sha>
```

Credentials are stored in `~/.docker/config.json` for the user that ran `docker login`. Docker Compose reads them automatically when pulling images. This means if you run `docker compose pull` or `docker compose up` as the same user that authenticated, it will work without any extra configuration.

One practical note: if you're running Docker operations as root on the server (e.g., via a deploy script that uses `sudo`), root's `~/.docker/config.json` needs to hold the credentials — not your regular user's. Authenticate with `sudo docker login` in that case, or use a credential helper that makes credentials available system-wide.

<!-- RESOURCES -->

- [GitHub Container Registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec)
- [docker login reference](https://docs.docker.com/reference/cli/docker/login/)
- [Image tags vs digests](https://docs.docker.com/reference/cli/docker/image/pull/#pull-an-image-by-digest-immutable-identifier)
