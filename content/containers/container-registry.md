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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
