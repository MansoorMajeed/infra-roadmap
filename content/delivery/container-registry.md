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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
