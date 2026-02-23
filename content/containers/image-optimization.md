---
id: image-optimization
title: Optimizing Docker Images
zone: containers
edges:
  to:
    - id: container-security-basics
      question: My images are lean. What should I know about making them secure?
      detail: >-
        I've got the size down and builds are fast. But I'm realizing I don't
        really know if what's running inside my containers is safe — am I
        exposing things I shouldn't be?
difficulty: 2
tags:
  - docker
  - dockerfile
  - images
  - optimization
  - multi-stage
category: practice
milestones:
  - Use multi-stage builds to separate build dependencies from the final image
  - Understand how Docker layer caching works and why instruction order matters
  - Use .dockerignore to exclude files from the build context
  - Choose minimal base images (alpine, distroless, slim variants)
  - Combine RUN commands and clean up package manager caches in a single layer
  - Measure image size with docker image ls and inspect layers with docker history
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
