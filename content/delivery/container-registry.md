---
id: "container-registry"
title: "Container Registries"
zone: "delivery"
edges:
  from:
    - id: "building-docker-images"
      question: "I'm building Docker images in CI. Where do they actually go?"
      detail: "A Docker image built on a CI runner exists only on that runner — and it disappears when the job finishes. You need a registry: a versioned store of images your servers can pull from."
  to:
    - id: "deployment-strategies"
      question: "My image is stored and versioned. How do I actually deploy it without downtime?"
      detail: "Getting the image to the registry is the build half. Deployment is the other half: getting the server to pull the new image and switch over to it — ideally without dropping any requests in the process."
difficulty: 1
tags: ["docker", "container-registry", "ghcr", "ecr", "docker-hub", "images"]
category: "concept"
milestones:
  - "Push a Docker image to GitHub Container Registry (GHCR)"
  - "Pull a specific image version by tag"
  - "Understand what image tags are for and why 'latest' is dangerous"
  - "Set up registry authentication in your CI pipeline"
---

A container registry is a versioned store for Docker images. Your CI pipeline builds an image and pushes it there. Your servers pull it from there when deploying. The registry is the handoff point between build and deploy.

GitHub Container Registry (GHCR) is the easiest starting point — it's built into GitHub, free for public images, and authenticates with your GitHub token.

<!-- DEEP_DIVE -->

## Why you need a registry

A Docker image built on a CI runner exists only on that runner. When the job ends, the runner is recycled and the image is gone. A registry gives the image a permanent home with a URL your servers can pull from.

It also gives you versioning. Every push can be a distinct tag. You can roll back to `myapp:a3f9c12` (last week's commit) with a single command. Without a registry, rollback means re-running a CI build.

## GitHub Container Registry (GHCR)

GHCR images live at `ghcr.io/<owner>/<image-name>:<tag>`.

Authenticate in your pipeline using the automatically-provided `GITHUB_TOKEN`:

```yaml
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
    tags: |
      ghcr.io/${{ github.repository_owner }}/myapp:${{ github.sha }}
      ghcr.io/${{ github.repository_owner }}/myapp:latest
```

`GITHUB_TOKEN` is automatically available in every workflow — no manual secret setup needed. It has permission to push to GHCR for the same repo.

## Pulling on your server

On your deployment target, authenticate with a Personal Access Token (PAT) or use `GITHUB_TOKEN` if deploying from within Actions:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u USERNAME --password-stdin
docker pull ghcr.io/yourorg/myapp:a3f9c12
docker run -d -p 8000:8000 ghcr.io/yourorg/myapp:a3f9c12
```

## Other registries

**Docker Hub** — the original. Public images are free and unauthenticated pulls work up to a rate limit. Private images require a paid plan. Still widely used for open-source base images.

**AWS ECR** — tightly integrated with AWS IAM. The natural choice if you're deploying on AWS (ECS, EKS, EC2). Authentication uses `aws ecr get-login-password`.

**Google Artifact Registry / GCR** — same idea for GCP workloads.

For self-hosted or small setups: GHCR is free and zero-friction. For AWS-native setups: ECR is easier to wire up with IAM roles.

## Why `latest` is dangerous

`latest` is a mutable tag. When you push a new image with `latest`, the tag now points to a different image than it did yesterday. There's no way to know what's deployed without checking the actual image digest.

In a production system, always deploy by a specific immutable tag — the commit SHA. Use `latest` only as a convenience pointer for development environments where "the newest thing" is exactly what you want.

<!-- RESOURCES -->

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) -- type: reference, time: 10min
- [docker/login-action](https://github.com/docker/login-action) -- type: reference, time: 5min
